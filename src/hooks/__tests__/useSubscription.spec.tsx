import { act, renderHook, waitFor } from "@testing-library/react";
import useSubscription from "@/hooks/useSubscription";
import BillingAPI, { BillingApiError, type Subscription } from "@/lib/api/billing";

jest.mock("@/lib/api/billing", () => ({
  __esModule: true,
  default: {
    getPlans: jest.fn(),
    getSubscriptionByTenant: jest.fn(),
    getSubscriptionStatus: jest.fn(),
  },
  BillingApiError: class BillingApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body: unknown
    ) {
      super(message);
    }
  },
}));

const api = BillingAPI as jest.Mocked<typeof BillingAPI>;
const subscription = (tenantId: string): Subscription => ({
  id: `sub-${tenantId}`,
  tenantId,
  planKey: "monthly_essential",
  status: "active",
  marketingEnabled: false,
  requiresUpfront: false,
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  jest.clearAllMocks();
  api.getPlans.mockResolvedValue({ plans: [], meta: null } as any);
  api.getSubscriptionStatus.mockResolvedValue({ active: true } as any);
});

it("mantém a assinatura pendente mesmo depois do catálogo chegar", async () => {
  const pending = deferred<Subscription | null>();
  api.getSubscriptionByTenant.mockReturnValue(pending.promise);
  const { result } = renderHook(() => useSubscription("grupo-a"));
  await waitFor(() => expect(result.current.plansLoading).toBe(false));
  expect(result.current.subscriptionLoading).toBe(true);
  expect(result.current.subscriptionResolved).toBe(false);
  expect(result.current.subscription).toBeNull();
  await act(async () => pending.resolve(subscription("grupo-a")));
  await waitFor(() => expect(result.current.subscriptionLoading).toBe(false));
  expect(result.current.subscription?.tenantId).toBe("grupo-a");
});

it("distingue ausência confirmada de falha e recupera após nova consulta", async () => {
  api.getSubscriptionByTenant.mockResolvedValueOnce(null);
  const { result } = renderHook(() => useSubscription("grupo-a"));
  await waitFor(() => expect(result.current.subscriptionResolved).toBe(true));
  expect(result.current.subscription).toBeNull();
  expect(result.current.error).toBeNull();
  api.getSubscriptionByTenant.mockRejectedValueOnce(new BillingApiError("erro", 500, null));
  await act(async () => result.current.refreshSubscription());
  expect(result.current.subscriptionError).toMatch(/não foi possível/i);
  expect(result.current.subscription).toBeNull();
  api.getSubscriptionByTenant.mockResolvedValueOnce(subscription("grupo-a"));
  await act(async () => result.current.refreshSubscription());
  expect(result.current.subscriptionError).toBeNull();
  expect(result.current.subscription?.id).toBe("sub-grupo-a");
});

it("nunca mostra resposta atrasada de um grupo anterior", async () => {
  const oldRequest = deferred<Subscription | null>();
  const newRequest = deferred<Subscription | null>();
  api.getSubscriptionByTenant
    .mockReturnValueOnce(oldRequest.promise)
    .mockReturnValueOnce(newRequest.promise);
  const { result, rerender } = renderHook(({ tenantId }) => useSubscription(tenantId), {
    initialProps: { tenantId: "grupo-a" },
  });
  rerender({ tenantId: "grupo-b" });
  expect(result.current.subscription).toBeNull();
  await act(async () => oldRequest.resolve(subscription("grupo-a")));
  expect(result.current.subscription).toBeNull();
  expect(result.current.subscriptionLoading).toBe(true);
  await act(async () => newRequest.resolve(subscription("grupo-b")));
  await waitFor(() => expect(result.current.subscriptionLoading).toBe(false));
  expect(result.current.subscription?.tenantId).toBe("grupo-b");
});

it("preserva dados válidos durante atualização do mesmo grupo", async () => {
  api.getSubscriptionByTenant.mockResolvedValueOnce(subscription("grupo-a"));
  const { result } = renderHook(() => useSubscription("grupo-a"));
  await waitFor(() => expect(result.current.subscriptionLoading).toBe(false));
  const refresh = deferred<Subscription | null>();
  api.getSubscriptionByTenant.mockReturnValueOnce(refresh.promise);
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.refreshSubscription();
  });
  expect(result.current.subscriptionLoading).toBe(true);
  expect(result.current.subscription?.id).toBe("sub-grupo-a");
  await act(async () => {
    refresh.resolve(subscription("grupo-a"));
    await pending;
  });
  expect(result.current.subscriptionLoading).toBe(false);
});

it("aguarda o contexto do grupo antes de iniciar consultas", async () => {
  api.getSubscriptionByTenant.mockResolvedValue(subscription("grupo-a"));
  const view = renderHook(({ enabled }) => useSubscription("grupo-a", { enabled }), {
    initialProps: { enabled: false },
  });
  expect(api.getSubscriptionByTenant).not.toHaveBeenCalled();
  expect(view.result.current.subscription).toBeNull();
  view.rerender({ enabled: true });
  await waitFor(() => expect(view.result.current.subscriptionLoading).toBe(false));
  expect(api.getSubscriptionByTenant).toHaveBeenCalledWith("grupo-a");
});
