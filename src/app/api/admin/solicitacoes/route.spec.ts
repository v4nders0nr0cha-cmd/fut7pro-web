import { GET } from "./route";
import { proxyBackend, resolveTenantSlug } from "../../_proxy/helpers";

jest.mock("@/lib/get-api-base", () => ({ getApiBase: () => "https://api.example.test" }));
jest.mock("../../_proxy/helpers", () => ({
  appendSafeQueryParams: jest.fn((params: URLSearchParams, target: URL) => {
    params.forEach((value, key) => target.searchParams.set(key, value));
  }),
  buildHeaders: jest.fn(() => ({ "X-Tenant-Slug": "grupo-a" })),
  forwardResponse: jest.fn((status, body) => ({ status, body })),
  jsonResponse: jest.fn((body, options) => ({ body, ...options })),
  proxyBackend: jest.fn(async () => ({ response: { status: 200 }, body: { count: 2 } })),
  requireUser: jest.fn(async () => ({ id: "admin-a" })),
  resolveTenantSlug: jest.fn(() => "grupo-a"),
}));

it("envia apenas a contagem ao endpoint de leitura do tenant ativo", async () => {
  await GET({ nextUrl: { searchParams: new URLSearchParams("status=PENDENTE&count=1") } } as any);
  expect(proxyBackend).toHaveBeenCalledWith(
    "https://api.example.test/admin/solicitacoes/count",
    expect.objectContaining({ headers: { "X-Tenant-Slug": "grupo-a" }, cache: "no-store" })
  );
  expect(resolveTenantSlug).toHaveBeenCalled();
});

it("mantém a consulta operacional de listagem no endpoint existente", async () => {
  await GET({ nextUrl: { searchParams: new URLSearchParams("status=PENDENTE") } } as any);
  expect(proxyBackend).toHaveBeenCalledWith(
    "https://api.example.test/admin/solicitacoes?status=PENDENTE",
    expect.any(Object)
  );
});
