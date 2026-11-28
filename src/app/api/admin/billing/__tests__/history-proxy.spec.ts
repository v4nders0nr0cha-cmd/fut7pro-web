import { GET, POST } from "../subscription/[subscriptionId]/[...history]/route";
import { ensureScopedSubscription } from "../subscription/_scope";
import { requireUser, proxyBackend } from "@/app/api/_proxy/helpers";
jest.mock("../subscription/_scope", () => ({ ensureScopedSubscription: jest.fn() }));
jest.mock("@/lib/get-api-base", () => ({ getApiBase: () => "http://fixture.invalid" }));
jest.mock("@/app/api/_proxy/helpers", () => ({
  requireUser: jest.fn(),
  jsonResponse: (body: any, options: any) => ({ body, status: options.status }),
  proxyBackend: jest.fn(),
  buildHeaders: () => ({ "x-tenant-slug": "grupo-a" }),
  forwardResponse: (status: number, body: any) => ({ status, body }),
}));
const params = (history: string[]) => ({
  params: Promise.resolve({ subscriptionId: "sub-a", history }),
});
const req = {
  nextUrl: new URL(
    "http://localhost/api?status=confirmed&limit=10&tenantId=outro&url=https://unsafe.invalid"
  ),
} as any;
beforeEach(() => {
  jest.clearAllMocks();
  (requireUser as jest.Mock).mockResolvedValue({ id: "admin" });
  (ensureScopedSubscription as jest.Mock).mockResolvedValue({ tenantSlug: "grupo-a" });
  (proxyBackend as jest.Mock).mockResolvedValue({ response: { status: 200 }, body: { items: [] } });
});
it("concilia apenas a fatura do grupo autenticado sem encaminhar identificador externo", async () => {
  const res = await POST(req, params(["invoices", "invoice-a", "reconcile"]));
  expect(res.status).toBe(200);
  expect(ensureScopedSubscription).toHaveBeenCalledWith({ id: "admin" }, "sub-a");
  expect(proxyBackend).toHaveBeenCalledWith(
    "http://fixture.invalid/billing/subscription/sub-a/invoices/invoice-a/reconcile",
    expect.objectContaining({ method: "POST", cache: "no-store" })
  );
});
it("bloqueia conciliação sem sessão, fora do grupo ou com rota arbitrária", async () => {
  expect((await POST(req, params(["cancel"]))).status).toBe(404);
  (requireUser as jest.Mock).mockResolvedValue(null);
  expect((await POST(req, params(["invoices", "invoice-a", "reconcile"]))).status).toBe(401);
  (requireUser as jest.Mock).mockResolvedValue({ id: "admin" });
  (ensureScopedSubscription as jest.Mock).mockResolvedValue({
    error: "Fora do escopo",
    status: 403,
  });
  expect((await POST(req, params(["invoices", "invoice-a", "reconcile"]))).status).toBe(403);
  expect(proxyBackend).not.toHaveBeenCalled();
});
it("encaminha apenas consultas e filtros permitidos com escopo validado", async () => {
  const res = await GET(req, params(["invoices"]));
  expect(res.status).toBe(200);
  expect(ensureScopedSubscription).toHaveBeenCalledWith({ id: "admin" }, "sub-a");
  expect(proxyBackend).toHaveBeenCalledWith(
    "http://fixture.invalid/billing/subscription/sub-a/invoices?limit=10&status=confirmed",
    expect.objectContaining({ cache: "no-store" })
  );
});
it("nega assinatura de outro grupo sem consultar seu histórico", async () => {
  (ensureScopedSubscription as jest.Mock).mockResolvedValue({
    error: "Fora do escopo",
    status: 403,
  });
  expect((await GET(req, params(["events"]))).status).toBe(403);
  expect(proxyBackend).not.toHaveBeenCalled();
});
it("nega sessão ausente e caminhos que não sejam consultas", async () => {
  expect((await GET(req, params(["cancel"]))).status).toBe(404);
  expect(proxyBackend).not.toHaveBeenCalled();
  (requireUser as jest.Mock).mockResolvedValue(null);
  expect((await GET(req, params(["overview"]))).status).toBe(401);
});
