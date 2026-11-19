import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useRachaAgenda } from "../useRachaAgenda";
import { ADMIN_GUIDE_CHANGED } from "@/lib/admin-guide-events";
jest.mock("swr", () => ({ __esModule: true, ...jest.requireActual("swr") }));
let user = "one";
let slug = "group-a";
jest.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { id: user } } }) }));
jest.mock("@/context/RachaContext", () => ({ useRacha: () => ({ tenantSlug: slug }) }));
function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      {children}
    </SWRConfig>
  );
}
const response = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
  text: async () => JSON.stringify(body),
});
beforeEach(() => {
  user = "one";
  slug = "group-a";
  global.fetch = jest.fn();
});
it("shares the page read and never leaks previous identity data or late responses", async () => {
  let late!: (value: unknown) => void;
  (fetch as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          late = resolve;
        })
    )
    .mockResolvedValueOnce(response([{ id: "b", weekday: 2, time: "20:00" }]))
    .mockResolvedValueOnce(response([{ id: "c", weekday: 4, time: "21:00" }]));
  const { result, rerender } = renderHook(() => [useRachaAgenda(), useRachaAgenda()], { wrapper });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  slug = "group-b";
  rerender();
  expect(result.current[0].items).toEqual([]);
  await waitFor(() => expect(result.current[0].items[0]?.id).toBe("b"));
  await act(async () => late(response([{ id: "a", weekday: 1, time: "10:00" }])));
  expect(result.current[0].items[0].id).toBe("b");
  user = "two";
  rerender();
  expect(result.current[0].items).toEqual([]);
  await waitFor(() => expect(result.current[0].items[0]?.id).toBe("c"));
  expect(fetch).toHaveBeenCalledTimes(3);
});
it("notifies only successful mutations, keeps a failed save pending, and refreshes the shared schedule", async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce(response([]))
    .mockResolvedValueOnce(response({ message: "Falha" }, false))
    .mockResolvedValueOnce(response({ id: "saved" }))
    .mockResolvedValueOnce(response([{ id: "saved", weekday: 6, time: "06:27" }]));
  const changed = jest.fn();
  window.addEventListener(ADMIN_GUIDE_CHANGED, changed);
  try {
    const { result } = renderHook(() => useRachaAgenda(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.createAgenda({ weekday: 6, time: "06:27" });
    });
    expect(changed).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
    await act(async () => {
      await result.current.createAgenda({ weekday: 6, time: "06:27" });
    });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(result.current.items[0].id).toBe("saved");
  } finally {
    window.removeEventListener(ADMIN_GUIDE_CHANGED, changed);
  }
});
it("does not read without an authenticated scope or when disabled", () => {
  user = "";
  const { rerender } = renderHook(() => useRachaAgenda({ enabled: false }), { wrapper });
  user = "one";
  rerender();
  expect(fetch).not.toHaveBeenCalled();
});
