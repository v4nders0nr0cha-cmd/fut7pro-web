import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { useAdminGuide } from "../useAdminGuide";
import type { AdminGuideData } from "@/types/admin-guide";

jest.mock("swr", () => {
  const actual = jest.requireActual("swr");
  return { __esModule: true, ...actual };
});

let activeUserId = "user-1";
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: activeUserId } } }),
}));

let activeSlug = "pelada-a";
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: activeSlug }),
}));

const makeGuide = (slug: string, revision = 0) =>
  ({
    tenant: { id: slug, slug, name: slug },
    pedagogicalState: {
      revision,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    },
    activationProgress: { completed: 0, total: 5, percentage: 0, complete: false },
    tasks: [],
    nextAction: null,
  }) as AdminGuideData;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );
}

beforeEach(() => {
  activeSlug = "pelada-a";
  activeUserId = "user-1";
  global.fetch = jest.fn();
});

it("encerra uma leitura sem resposta e permite tentar novamente", async () => {
  jest.useFakeTimers();
  try {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(
        (_url: string, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            options.signal?.addEventListener("abort", () =>
              reject(new DOMException("Tempo de leitura excedido", "AbortError"))
            );
          })
      )
      .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a") });
    const { result, unmount } = renderHook(() => useAdminGuide(), { wrapper });
    await act(async () => {
      jest.advanceTimersByTime(15_000);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error?.name).toBe("AbortError");
    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.guide?.tenant.slug).toBe("pelada-a");
    expect(result.current.error).toBeNull();
    unmount();
  } finally {
    jest.useRealTimers();
  }
});

it("isola o cache por pelada e ignora resposta antiga após a troca", async () => {
  let resolveOld!: (response: Response) => void;
  (global.fetch as jest.Mock)
    .mockImplementationOnce(() => new Promise<Response>((resolve) => (resolveOld = resolve)))
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-b") });
  const { result, rerender } = renderHook(() => useAdminGuide(), { wrapper });
  activeSlug = "pelada-b";
  rerender();
  await waitFor(() => expect(result.current.guide?.tenant.slug).toBe("pelada-b"));
  await act(async () => {
    resolveOld({ ok: true, json: async () => makeGuide("pelada-a") } as Response);
  });
  expect(result.current.guide?.tenant.slug).toBe("pelada-b");
});

it("não apresenta nem altera dados se o servidor ainda responder pela pelada anterior", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => makeGuide("pelada-a"),
  });
  activeSlug = "pelada-b";
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(result.current.guide).toBeNull();
  await act(async () => {
    expect(await result.current.update({ action: "WELCOME_SEEN" })).toBe(false);
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

it("envia apenas a ação pedagógica e a revisão, revalidando após o PATCH", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 2) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ pedagogicalState: { revision: 3 } }) })
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 3) });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  await act(async () => {
    expect(await result.current.update({ action: "WELCOME_SEEN" })).toBe(true);
  });
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/admin/guide",
    expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ action: "WELCOME_SEEN", expectedRevision: 2 }),
    })
  );
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(3));
});

it("persiste a modalidade escolhida sem enviar dados operacionais ou tenant no PATCH", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 2) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ pedagogicalState: { revision: 3 } }) })
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 3) });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  await act(async () => {
    expect(
      await result.current.update({ action: "FIRST_MATCH_MODE_SELECTED", mode: "CLASSIC_MATCH" })
    ).toBe(true);
  });
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/admin/guide",
    expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({
        action: "FIRST_MATCH_MODE_SELECTED",
        mode: "CLASSIC_MATCH",
        expectedRevision: 2,
      }),
    })
  );
});

it("recarrega o estado após conflito sem apagar outra alteração", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 2) })
    .mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: "Conflito de revisão." }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 3) });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  await act(async () => {
    expect(await result.current.update({ action: "WELCOME_SEEN" })).toBe(false);
  });
  expect(result.current.actionError?.status).toBe(409);
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(3));
});

it("mantém os dados da mesma pelada após uma falha temporária de revalidação", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 2) })
    .mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: "Indisponível." }),
    });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  await act(async () => {
    await result.current.retry();
  });
  await waitFor(() => expect(result.current.error?.status).toBe(503));
  expect(result.current.guide?.tenant.slug).toBe("pelada-a");
});

it("oculta os dados em cache quando a revalidação revoga o acesso", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a") })
    .mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "Acesso negado." }),
    });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.tenant.slug).toBe("pelada-a"));
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.error?.status).toBe(403);
  expect(result.current.guide).toBeNull();
});

it("permite atualizar a pelada B enquanto o PATCH da pelada A ainda está pendente", async () => {
  let resolvePatchA!: (response: Response) => void;
  let resolvePatchB!: (response: Response) => void;
  (global.fetch as jest.Mock).mockImplementation((_url, options?: RequestInit) => {
    if (options?.method === "PATCH") {
      return new Promise<Response>((resolve) => {
        if (activeSlug === "pelada-a") resolvePatchA = resolve;
        else resolvePatchB = resolve;
      });
    }
    return Promise.resolve({ ok: true, json: async () => makeGuide(activeSlug) });
  });
  const { result, rerender } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.tenant.slug).toBe("pelada-a"));
  let pendingA!: Promise<boolean>;
  act(() => {
    pendingA = result.current.update({ action: "WELCOME_SEEN" });
  });
  expect(result.current.updating).toBe(true);

  await waitFor(() => expect(resolvePatchA).toEqual(expect.any(Function)));
  activeSlug = "pelada-b";
  rerender();
  await waitFor(() => expect(result.current.guide?.tenant.slug).toBe("pelada-b"));
  expect(result.current.updating).toBe(false);
  let pendingB!: Promise<boolean>;
  act(() => {
    pendingB = result.current.update({ action: "WELCOME_SEEN" });
  });
  expect(result.current.updating).toBe(true);
  await waitFor(() => expect(resolvePatchB).toEqual(expect.any(Function)));
  await act(async () => {
    resolvePatchA({ ok: true, json: async () => ({}) } as Response);
    expect(await pendingA).toBe(false);
  });
  expect(result.current.guide?.tenant.slug).toBe("pelada-b");
  expect(result.current.updating).toBe(true);
  await act(async () => {
    resolvePatchB({ ok: true, json: async () => ({}) } as Response);
    expect(await pendingB).toBe(true);
  });
  expect(result.current.updating).toBe(false);
  expect(result.current.guide?.tenant.slug).toBe("pelada-b");
  expect(
    (global.fetch as jest.Mock).mock.calls.filter(([, options]) => options?.method === "PATCH")
  ).toHaveLength(2);
});

it("isolates personal preferences when administrators change in the same group", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 2) })
    .mockResolvedValueOnce({ ok: true, json: async () => makeGuide("pelada-a", 8) });
  const { result, rerender } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  activeUserId = "user-2";
  rerender();
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(8));
});

it.each([
  { action: "STEP_SKIPPED", tipId: "SCHEDULE" },
  { action: "COMPLETION_PRESENTED" },
  { action: "PREPARATION_CELEBRATED" },
] as const)(
  "revalidates a 409 and safely retries an idempotent guide action %j once",
  async (action) => {
    let revision = 2;
    let patches = 0;
    (global.fetch as jest.Mock).mockImplementation((_url, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        patches++;
        const payload = JSON.parse(String(options.body));
        if (patches === 1) {
          revision = 3;
          return Promise.resolve({
            ok: false,
            status: 409,
            json: async () => ({ message: "Conflito" }),
          });
        }
        expect(payload.expectedRevision).toBe(3);
        revision = 4;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            pedagogicalState: makeGuide(activeSlug, revision).pedagogicalState,
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => makeGuide(activeSlug, revision) });
    });
    const { result } = renderHook(() => useAdminGuide(), { wrapper });
    await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
    await act(async () => expect(await result.current.update(action)).toBe(true));
    expect(patches).toBe(2);
    expect(result.current.actionError).toBeNull();
  }
);
it("serializes updates from two guide instances without losing revisions", async () => {
  let revision = 1;
  const expected: number[] = [];
  (global.fetch as jest.Mock).mockImplementation(async (_url, options?: RequestInit) => {
    if (options?.method === "PATCH") {
      const payload = JSON.parse(String(options.body));
      expected.push(payload.expectedRevision);
      if (payload.expectedRevision !== revision)
        return { ok: false, status: 409, json: async () => ({ message: "Conflito" }) };
      revision++;
      return {
        ok: true,
        json: async () => ({ pedagogicalState: makeGuide(activeSlug, revision).pedagogicalState }),
      };
    }
    return { ok: true, json: async () => makeGuide(activeSlug, revision) };
  });
  const { result } = renderHook(() => [useAdminGuide(), useAdminGuide()], { wrapper });
  await waitFor(() => expect(result.current[0].guide).toBeTruthy());
  await act(async () => {
    const a = result.current[0].update({ action: "WELCOME_PRESENTED" });
    const b = result.current[1].update({ action: "STEP_SKIPPED", tipId: "SCHEDULE" });
    expect(await a).toBe(true);
    expect(await b).toBe(true);
  });
  expect(expected).toEqual([1, 2]);
});

it("keeps a confirmed write when its subsequent progress read fails", async () => {
  let reads = 0;
  (global.fetch as jest.Mock).mockImplementation(async (_url, options?: RequestInit) => {
    if (options?.method === "PATCH")
      return {
        ok: true,
        json: async () => ({ pedagogicalState: makeGuide(activeSlug, 3).pedagogicalState }),
      };
    if (reads++ === 0) return { ok: true, json: async () => makeGuide(activeSlug, 2) };
    return { ok: false, status: 503, json: async () => ({ message: "Indisponível" }) };
  });
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide?.pedagogicalState.revision).toBe(2));
  await act(async () =>
    expect(await result.current.update({ action: "STEP_SKIPPED", tipId: "SCHEDULE" })).toBe(true)
  );
  expect(result.current.actionError).toBeNull();
  expect(result.current.guide?.pedagogicalState.revision).toBe(3);
});

it("requires an explicit granted response when claiming the commercial reward", async () => {
  (global.fetch as jest.Mock).mockImplementation(async (_url, options?: RequestInit) =>
    options?.method === "PATCH"
      ? {
          ok: true,
          json: async () => ({
            pedagogicalState: makeGuide(activeSlug, 3).pedagogicalState,
            reward: { granted: false, eligible: false },
          }),
        }
      : { ok: true, json: async () => makeGuide(activeSlug, 2) }
  );
  const { result } = renderHook(() => useAdminGuide(), { wrapper });
  await waitFor(() => expect(result.current.guide).toBeTruthy());
  await act(async () =>
    expect(await result.current.update({ action: "REWARD_CLAIM" })).toBe(false)
  );
});
