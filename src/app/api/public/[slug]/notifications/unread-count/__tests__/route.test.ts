import { GET } from "../route";
import { buildHeaders, forwardResponse, proxyBackend, requireUser } from "@/app/api/_proxy/helpers";

jest.mock("@/lib/get-api-base", () => ({
  getApiBase: () => "https://api.fut7pro.test",
}));

jest.mock("@/app/api/_proxy/helpers", () => ({
  buildHeaders: jest.fn(() => ({ Authorization: "Bearer token" })),
  forwardResponse: jest.fn((status: number, body: unknown) => ({ status, body })),
  jsonResponse: jest.fn((body: unknown, init?: ResponseInit) => ({
    status: init?.status ?? 200,
    body,
  })),
  proxyBackend: jest.fn(),
  requireUser: jest.fn(),
}));

describe("public notifications unread-count proxy", () => {
  const mockedRequireUser = requireUser as jest.Mock;
  const mockedProxyBackend = proxyBackend as jest.Mock;
  const mockedBuildHeaders = buildHeaders as jest.Mock;
  const mockedForwardResponse = forwardResponse as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireUser.mockResolvedValue({ id: "user-1", accessToken: "token" });
    mockedProxyBackend.mockResolvedValue({
      response: { status: 200 },
      body: JSON.stringify({ unreadCount: 2 }),
    });
  });

  it("autentica a Conta Fut7Pro sem exigir realm global athlete", async () => {
    await GET({ url: "https://app.fut7pro.test/api" } as any, {
      params: { slug: "seu-racha" },
    });

    expect(mockedRequireUser).toHaveBeenCalledWith({ scope: "any" });
    expect(mockedBuildHeaders).toHaveBeenCalledWith(
      { id: "user-1", accessToken: "token" },
      "seu-racha"
    );
    expect(mockedProxyBackend).toHaveBeenCalledWith(
      "https://api.fut7pro.test/public/rachas/seu-racha/notifications/unread-count",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token",
          "x-auth-context": "athlete",
        }),
        cache: "no-store",
      })
    );
  });

  it("propaga 403 do backend quando TenantGuard ou Membership rejeitam acesso", async () => {
    mockedProxyBackend.mockResolvedValue({
      response: { status: 403 },
      body: JSON.stringify({ error: "Forbidden" }),
    });

    await GET({ url: "https://app.fut7pro.test/api" } as any, {
      params: { slug: "seu-racha" },
    });

    expect(mockedForwardResponse).toHaveBeenCalledWith(403, JSON.stringify({ error: "Forbidden" }));
  });
});
