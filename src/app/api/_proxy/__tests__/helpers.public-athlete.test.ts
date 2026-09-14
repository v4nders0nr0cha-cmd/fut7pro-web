import { getToken } from "next-auth/jwt";
import { requirePublicAthleteUser } from "../helpers";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("@/server/auth/admin-options", () => ({
  authOptions: {},
}));

jest.mock("@/server/auth/superadmin-options", () => ({
  superAdminAuthOptions: {},
}));

describe("requirePublicAthleteUser", () => {
  const mockedGetToken = getToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("aceita Conta Fut7Pro comum com realm global admin para o backend validar Membership", async () => {
    mockedGetToken.mockImplementation(({ cookieName }: { cookieName?: string }) => {
      if (String(cookieName || "").includes("superadmin")) return null;
      return {
        sub: "user-1",
        accessToken: "token",
        role: "ADMIN",
        authRealm: "admin",
      };
    });

    await expect(requirePublicAthleteUser()).resolves.toMatchObject({
      id: "user-1",
      accessToken: "token",
      role: "ADMIN",
      authRealm: "admin",
    });
  });

  it("bloqueia SuperAdmin nos proxies publicos de atleta", async () => {
    mockedGetToken.mockImplementation(({ cookieName }: { cookieName?: string }) => {
      if (!String(cookieName || "").includes("superadmin")) return null;
      return {
        sub: "super-1",
        accessToken: "super-token",
        role: "SUPERADMIN",
        authRealm: "superadmin",
      };
    });

    await expect(requirePublicAthleteUser()).resolves.toBeNull();
  });
});
