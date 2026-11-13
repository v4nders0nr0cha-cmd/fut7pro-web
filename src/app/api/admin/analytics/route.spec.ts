import { GET } from "./route";
import { proxyBackend } from "../../_proxy/helpers";

jest.mock("../../_proxy/helpers", () => ({
  requireUser: jest.fn().mockResolvedValue({ id: "admin-a" }),
  resolveTenantSlug: jest.fn().mockReturnValue("racha-a"),
  buildHeaders: jest.fn().mockReturnValue({}),
  proxyBackend: jest.fn().mockResolvedValue({
    response: { ok: true },
    body: JSON.stringify({ summary: { participations: 4 } }),
  }),
}));

const request = (period?: string) =>
  ({
    nextUrl: { searchParams: new URLSearchParams(period ? { period } : {}) },
  }) as any;

describe("proxy de relatorios", () => {
  beforeAll(() => {
    globalThis.Response = class {
      status: number;
      constructor(_body: unknown, init?: ResponseInit) {
        this.status = init?.status ?? 200;
      }
    } as unknown as typeof Response;
  });
  beforeEach(() => jest.clearAllMocks());

  it.each(["day", "week", "month", "year", "all"])("preserva %s ate a API", async (period) => {
    expect((await GET(request(period))).status).toBe(200);
    expect((proxyBackend as jest.Mock).mock.calls[0][0]).toContain(`period=${period}`);
  });

  it("usa year na requisicao inicial", async () => {
    await GET(request());
    expect((proxyBackend as jest.Mock).mock.calls[0][0]).toContain("period=year");
  });

  it("rejeita periodo desconhecido sem mascarar a consulta", async () => {
    expect((await GET(request("quarter"))).status).toBe(400);
    expect(proxyBackend).not.toHaveBeenCalled();
  });
});
