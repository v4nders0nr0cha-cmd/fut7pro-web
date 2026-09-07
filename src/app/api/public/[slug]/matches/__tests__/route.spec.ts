type RouteModule = typeof import("../route");

export {};

class MockNextResponse {
  status: number;
  headers: Headers;
  private body: string;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = typeof body === "string" ? body : body ? String(body) : "";
    this.status = init?.status ?? 200;
    this.headers = new Headers(init?.headers);
  }

  static json(body: unknown, init?: ResponseInit) {
    return new MockNextResponse(JSON.stringify(body), init);
  }

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

jest.mock("next/server", () => ({
  NextResponse: MockNextResponse,
}));

async function loadRouteModule(): Promise<RouteModule> {
  jest.resetModules();
  return import("../route");
}

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as any;
}

function mockFetchResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    text: async () => JSON.stringify(payload),
  } as Response;
}

describe("GET /api/public/[slug]/matches", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn() as any;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("usa a fixture central para a Vitrine sem chamar backend", async () => {
    delete process.env.BACKEND_URL;
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const { GET } = await loadRouteModule();
    const response = await GET(
      makeRequest("http://localhost/api/public/vitrine/matches?scope=recent&limit=20"),
      {
        params: { slug: "vitrine" },
      }
    );
    const body = await response.json();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(body.slug).toBe("vitrine");
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].date.slice(0, 10)).toBe("2026-08-29");
  });

  it("preserva o proxy real para slug diferente de vitrine", async () => {
    process.env.BACKEND_URL = "https://api.fut7pro.com.br";
    const backendPayload = { slug: "racha-real", total: 0, results: [] };
    global.fetch = jest.fn().mockResolvedValue(mockFetchResponse(200, backendPayload)) as any;

    const { GET } = await loadRouteModule();
    const response = await GET(
      makeRequest("http://localhost/api/public/racha-real/matches?scope=recent&limit=20"),
      { params: { slug: "racha-real" } }
    );
    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toBe(
      "https://api.fut7pro.com.br/public/racha-real/matches?scope=recent&limit=20"
    );
    expect(body).toEqual(backendPayload);
  });
});
