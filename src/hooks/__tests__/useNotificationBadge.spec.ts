import { act, renderHook } from "@testing-library/react";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";

describe("useNotificationBadge", () => {
  it("retorna fallback zero e permite incrementar/resetar", () => {
    const { result } = renderHook(() => useNotificationBadge());
    expect(result.current.unreadCount).toBe(0);

    act(() => result.current.addUnread());
    expect(result.current.unreadCount).toBe(1);

    act(() => result.current.addUnread(2));
    expect(result.current.unreadCount).toBe(3);

    act(() => result.current.resetUnread());
    expect(result.current.unreadCount).toBe(0);
  });

  it("aceita valor inicial customizado", () => {
    const { result } = renderHook(() => useNotificationBadge(5));
    expect(result.current.unreadCount).toBe(5);
  });
});
