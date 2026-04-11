jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn((options: any) => ({ id: "google", options })),
}));

jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: jest.fn((options: any) => ({ id: "credentials", options })),
}));

type JwtCallback = NonNullable<
  NonNullable<(typeof import("../admin-options"))["authOptions"]["callbacks"]>["jwt"]
>;

const buildJwt = (exp: number) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `${header}.${payload}.signature`;
};

const setupAuthEnv = () => {
  process.env.BACKEND_URL = "https://api.fut7pro.com.br";
  process.env.AUTH_REFRESH_PATH = "/auth/refresh";
  process.env.AUTH_LOGIN_PATH = "/auth/login";
  process.env.AUTH_ME_PATH = "/auth/me";
};

const loadJwtCallback = async (): Promise<JwtCallback> => {
  jest.resetModules();
  setupAuthEnv();
  const mod = await import("../admin-options");
  const callback = mod.authOptions.callbacks?.jwt;
  if (!callback) {
    throw new Error("JWT callback não encontrado");
  }
  return callback as JwtCallback;
};

describe("admin-options jwt refresh flow", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("refreshes expiring access token and clears tokenError", async () => {
    const jwt = await loadJwtCallback();
    const now = Math.floor(Date.now() / 1000);
    const nextAccessToken = buildJwt(now + 3600);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: nextAccessToken,
        refreshToken: "refresh-next",
      }),
    });

    const result = await jwt({
      token: {
        accessToken: buildJwt(now + 30),
        refreshToken: "refresh-old",
        accessTokenExp: now + 30,
      } as any,
    } as any);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe(nextAccessToken);
    expect(result.refreshToken).toBe("refresh-next");
    expect((result as any).error).toBeNull();
    expect((result as any).accessTokenExp).toBeGreaterThan(now);
  });

  it("keeps current token when refresh fails but token is still valid", async () => {
    const jwt = await loadJwtCallback();
    const now = Math.floor(Date.now() / 1000);
    const currentAccessToken = buildJwt(now + 20);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await jwt({
      token: {
        accessToken: currentAccessToken,
        refreshToken: "refresh-fail",
        accessTokenExp: now + 20,
      } as any,
    } as any);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((result as any).accessToken).toBe(currentAccessToken);
    expect((result as any).refreshToken).toBe("refresh-fail");
    expect((result as any).accessTokenExp).toBe(now + 20);
    expect((result as any).error).toBe("RefreshAccessTokenRetry");
  });

  it("keeps expired token temporarily when refresh fails to absorb race conditions", async () => {
    const jwt = await loadJwtCallback();
    const nowMs = Date.now();
    const now = Math.floor(nowMs / 1000);
    jest.spyOn(Date, "now").mockReturnValue(nowMs);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await jwt({
      token: {
        accessToken: buildJwt(now - 5),
        refreshToken: "refresh-expired",
        accessTokenExp: now - 5,
      } as any,
    } as any);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((result as any).accessToken).toBeDefined();
    expect((result as any).refreshToken).toBe("refresh-expired");
    expect((result as any).accessTokenExp).toBe(now - 5);
    expect((result as any).refreshFailureCount).toBe(1);
    expect((result as any).refreshFirstFailureAtMs).toBe(nowMs);
    expect((result as any).error).toBe("RefreshAccessTokenRetry");
  });

  it("invalidates session fields after repeated expired refresh failures", async () => {
    const jwt = await loadJwtCallback();
    const nowMs = Date.now();
    const now = Math.floor(nowMs / 1000);
    jest.spyOn(Date, "now").mockReturnValue(nowMs);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    let token: any = {
      accessToken: buildJwt(now - 5),
      refreshToken: "refresh-expired",
      accessTokenExp: now - 5,
    };

    for (let index = 0; index < 3; index += 1) {
      token = await jwt({ token } as any);
      expect((token as any).error).toBe("RefreshAccessTokenRetry");
      expect((token as any).accessToken).toBeDefined();
      expect((token as any).refreshToken).toBe("refresh-expired");
    }

    token = await jwt({ token } as any);

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect((token as any).accessToken).toBeUndefined();
    expect((token as any).refreshToken).toBeUndefined();
    expect((token as any).accessTokenExp).toBeNull();
    expect((token as any).error).toBe("RefreshAccessTokenError");
  });

  it("uses single-flight refresh for concurrent jwt callbacks", async () => {
    const jwt = await loadJwtCallback();
    const now = Math.floor(Date.now() / 1000);
    const nextAccessToken = buildJwt(now + 2400);
    let resolveFetch!: (value: unknown) => void;

    const pendingFetch = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValue(pendingFetch);

    const tokenA: any = {
      accessToken: buildJwt(now + 25),
      refreshToken: "refresh-shared",
      accessTokenExp: now + 25,
    };
    const tokenB: any = {
      accessToken: buildJwt(now + 25),
      refreshToken: "refresh-shared",
      accessTokenExp: now + 25,
    };

    const promiseA = jwt({ token: tokenA } as any);
    const promiseB = jwt({ token: tokenB } as any);

    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      json: async () => ({
        accessToken: nextAccessToken,
        refreshToken: "refresh-shared-next",
      }),
    });

    const [resultA, resultB] = await Promise.all([promiseA, promiseB]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(resultA.accessToken).toBe(nextAccessToken);
    expect(resultB.accessToken).toBe(nextAccessToken);
    expect(resultA.refreshToken).toBe("refresh-shared-next");
    expect(resultB.refreshToken).toBe("refresh-shared-next");
  });
});
