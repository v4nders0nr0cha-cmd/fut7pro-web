import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useEstatutoAdmin } from "../useEstatuto";

jest.mock("swr", () => {
  const actual = jest.requireActual("swr");
  return {
    __esModule: true,
    ...actual,
    default: jest.fn().mockReturnValue({
      data: { data: {} },
      error: undefined,
      mutate: jest.fn(),
      isLoading: false,
    }),
    SWRConfig: actual.SWRConfig,
  };
});

describe("useEstatutoAdmin", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockClear?.();
  });

  it("envia payload no formato { data } ao atualizar", async () => {
    const fetchMock = jest
      .fn()
      // GET inicial
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { topicos: [] } }),
      })
      // PUT
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { titulo: "Novo" } }),
      });

    global.fetch = fetchMock as any;

    const { result } = renderHook(() => useEstatutoAdmin());

    await act(async () => {
      await result.current.update({ titulo: "Novo" });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/estatuto",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ data: { titulo: "Novo" } }),
      })
    );
  });
});
