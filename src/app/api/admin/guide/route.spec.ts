import type { NextRequest } from "next/server";
import { PATCH } from "./route";
import { proxyBackend } from "../../_proxy/helpers";

jest.mock("@/lib/get-api-base", () => ({ getApiBase: () => "https://api.fut7pro.test" }));

jest.mock("../../_proxy/helpers", () => ({
  buildHeaders: jest.fn(() => ({ "X-Tenant-Slug": "grupo-a" })),
  forwardResponse: jest.fn((status, body) => ({ status, body })),
  jsonResponse: jest.fn((body, options) => ({ status: options?.status ?? 200, body })),
  proxyBackend: jest.fn(async () => ({ response: { status: 200 }, body: { revision: 4 } })),
  requireUser: jest.fn(async () => ({ id: "admin-1" })),
  resolveTenantSlug: jest.fn(() => "grupo-a"),
}));

const mockedProxy = proxyBackend as jest.Mock;

beforeEach(() => jest.clearAllMocks());

it("encaminha a dispensa com a revisão ao backend do grupo ativo", async () => {
  const response = await PATCH({
    json: async () => ({ action: "DASHBOARD_INVITE_DISMISSED", expectedRevision: 3 }),
  } as NextRequest);

  expect(response.status).toBe(200);
  expect(mockedProxy).toHaveBeenCalledWith(
    "https://api.fut7pro.test/api/admin/guide",
    expect.objectContaining({
      method: "PATCH",
      headers: { "X-Tenant-Slug": "grupo-a", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DASHBOARD_INVITE_DISMISSED", expectedRevision: 3 }),
    })
  );
});

it("recusa campos adicionais na ação de dispensa", async () => {
  const response = await PATCH({
    json: async () => ({ action: "DASHBOARD_INVITE_DISMISSED", tenantId: "outro-grupo" }),
  } as NextRequest);

  expect(response.status).toBe(400);
  expect(mockedProxy).not.toHaveBeenCalled();
});
