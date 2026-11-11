import { createElement, type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { SessionContext } from "next-auth/react";
import { useCriticalSessionRefresh } from "../useCriticalSessionRefresh";

function withSession(value: unknown) {
  return function SessionWrapper({ children }: { children: ReactNode }) {
    return createElement(SessionContext.Provider, { value: value as any }, children);
  };
}

describe("critical admin action session gate", () => {
  it("renews an expired access token before allowing a protected action", async () => {
    const now = Math.floor(Date.now() / 1000);
    const update = jest.fn().mockResolvedValue({
      user: { accessToken: "renewed-access", accessTokenExp: now + 900 },
    });
    const { result } = renderHook(() => useCriticalSessionRefresh(), {
      wrapper: withSession({
        data: { user: { accessToken: "expired-access", accessTokenExp: now - 1 } },
        status: "authenticated", update,
      }),
    });

    await act(async () => result.current.ensureFreshSession());
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("blocks a protected action after session revocation", async () => {
    const now = Math.floor(Date.now() / 1000);
    const update = jest.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useCriticalSessionRefresh(), {
      wrapper: withSession({
        data: { user: { accessToken: "expired-access", accessTokenExp: now - 1 } },
        status: "authenticated", update,
      }),
    });

    await expect(result.current.ensureFreshSession()).rejects.toThrow("Nao foi possivel validar sua sessao");
  });
});
