import { createElement, type ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useAdminAccess } from "../useAdminAccess";

jest.mock("swr", () => {
  const actual = jest.requireActual("swr");
  return { __esModule: true, ...actual };
});

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), shouldRetryOnError: false } },
    children
  );

describe("admin access after session recovery", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("retries a concurrent 401 and restores an authorized tenant response", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => '{"message":"unauthorized"}',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          '{"allowed":true,"blocked":false,"tenant":{"id":"tenant-1","slug":"racha-1","name":"Racha"}}',
      } as Response);
    global.fetch = fetchMock;

    const { result } = renderHook(() => useAdminAccess({ tenantSlug: "racha-1" }), { wrapper });
    await waitFor(() => expect(result.current.access?.allowed).toBe(true));
    expect(result.current.access?.tenant?.id).toBe("tenant-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
