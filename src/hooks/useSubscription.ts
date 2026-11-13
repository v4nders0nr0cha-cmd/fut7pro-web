import { useCallback, useEffect, useRef, useState } from "react";
import BillingAPI, {
  BillingApiError,
  type Subscription,
  type Plan,
  type SubscriptionStatus,
  type PlanCatalogMeta,
} from "@/lib/api/billing";

type FriendlyError = { title: string; message: string; status: number | null };
type ScopedState = {
  scope: string;
  subscription: Subscription | null;
  plans: Plan[];
  planMeta: PlanCatalogMeta | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionLoading: boolean;
  plansLoading: boolean;
  subscriptionResolved: boolean;
  subscriptionError: FriendlyError | null;
  plansError: FriendlyError | null;
};

const initialState = (scope: string): ScopedState => ({
  scope,
  subscription: null,
  plans: [],
  planMeta: null,
  subscriptionStatus: null,
  subscriptionLoading: true,
  plansLoading: true,
  subscriptionResolved: false,
  subscriptionError: null,
  plansError: null,
});

function mapFriendlyError(error: unknown, fallback: string): FriendlyError {
  if (error instanceof BillingApiError) {
    const status = error.status;
    if (status === 403)
      return {
        title: "Não foi possível carregar os dados do plano",
        message: "Verifique o grupo selecionado e tente novamente.",
        status,
      };
    if (status === 404)
      return {
        title: "Assinatura em sincronização",
        message:
          "Ainda estamos concluindo a vinculação do plano do seu racha. Tente novamente em alguns instantes.",
        status,
      };
    if (status === 409)
      return {
        title: "Atualização em andamento",
        message: "Aguarde alguns instantes e tente novamente.",
        status,
      };
    if (status === 429)
      return {
        title: "Muitas consultas em pouco tempo",
        message: "Aguarde alguns instantes antes de tentar novamente.",
        status,
      };
    if (status >= 500)
      return {
        title: "Serviço de assinatura indisponível",
        message:
          "Não foi possível carregar os dados do seu plano agora. Tente novamente em instantes.",
        status,
      };
    return { title: "Falha ao carregar assinatura", message: error.message || fallback, status };
  }
  return {
    title: "Falha ao carregar assinatura",
    message: error instanceof Error ? error.message || fallback : fallback,
    status: null,
  };
}

export function useSubscription(tenantId?: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const scope = tenantId ?? "";
  const [stored, setStored] = useState<ScopedState>(() => initialState(scope));
  const generation = useRef(0);
  const subscriptionRequest = useRef(0);
  const plansRequest = useRef(0);
  // A render for a new group must never expose the previous group's subscription.
  const state =
    enabled && stored.scope === scope
      ? stored
      : { ...initialState(scope), subscriptionLoading: enabled, plansLoading: enabled };

  const update = useCallback(
    (expectedScope: string, change: (current: ScopedState) => ScopedState) => {
      setStored((current) => (current.scope === expectedScope ? change(current) : current));
    },
    []
  );

  const refreshSubscription = useCallback(async () => {
    const currentGeneration = generation.current;
    const request = ++subscriptionRequest.current;
    update(scope, (current) => ({
      ...current,
      subscriptionLoading: true,
      subscriptionError: null,
    }));
    const isCurrent = () =>
      generation.current === currentGeneration && subscriptionRequest.current === request;
    try {
      const subscription = await BillingAPI.getSubscriptionByTenant(tenantId);
      if (!isCurrent()) return;
      if (tenantId && subscription && subscription.tenantId !== tenantId) {
        throw new Error("A assinatura retornada não pertence ao grupo selecionado.");
      }
      const subscriptionStatus = subscription?.id
        ? await BillingAPI.getSubscriptionStatus(subscription.id)
        : null;
      if (!isCurrent()) return;
      update(scope, (current) => ({
        ...current,
        subscription: subscription ?? null,
        subscriptionStatus,
        subscriptionResolved: true,
        subscriptionLoading: false,
        subscriptionError: null,
      }));
    } catch (error) {
      if (!isCurrent()) return;
      update(scope, (current) => ({
        ...current,
        subscriptionResolved: true,
        subscriptionLoading: false,
        subscriptionError: mapFriendlyError(error, "Erro ao buscar assinatura."),
      }));
    }
  }, [scope, tenantId, update]);

  const refreshPlans = useCallback(async () => {
    const currentGeneration = generation.current;
    const request = ++plansRequest.current;
    update(scope, (current) => ({ ...current, plansLoading: true, plansError: null }));
    try {
      const data = await BillingAPI.getPlans();
      if (generation.current !== currentGeneration || plansRequest.current !== request) return;
      update(scope, (current) => ({
        ...current,
        plans: data.plans || [],
        planMeta: data.meta ?? null,
        plansLoading: false,
        plansError: null,
      }));
    } catch (error) {
      if (generation.current !== currentGeneration || plansRequest.current !== request) return;
      update(scope, (current) => ({
        ...current,
        plansLoading: false,
        plansError: mapFriendlyError(error, "Erro ao buscar planos."),
      }));
    }
  }, [scope, update]);

  const refreshStatus = useCallback(async () => {
    if (!state.subscription?.id || state.subscriptionLoading) return;
    const currentGeneration = generation.current;
    const request = ++subscriptionRequest.current;
    const subscriptionId = state.subscription.id;
    update(scope, (current) => ({
      ...current,
      subscriptionLoading: true,
      subscriptionError: null,
    }));
    try {
      const status = await BillingAPI.getSubscriptionStatus(subscriptionId);
      if (generation.current !== currentGeneration || subscriptionRequest.current !== request)
        return;
      update(scope, (current) => ({
        ...current,
        subscriptionStatus: status,
        subscriptionLoading: false,
      }));
    } catch (error) {
      if (generation.current !== currentGeneration || subscriptionRequest.current !== request)
        return;
      update(scope, (current) => ({
        ...current,
        subscriptionLoading: false,
        subscriptionError: mapFriendlyError(error, "Erro ao buscar status da assinatura."),
      }));
    }
  }, [scope, state.subscription?.id, state.subscriptionLoading, update]);

  useEffect(() => {
    generation.current += 1;
    if (!enabled) {
      setStored({
        ...initialState(scope),
        subscriptionLoading: false,
        plansLoading: false,
      });
      return () => {
        generation.current += 1;
      };
    }
    setStored(initialState(scope));
    void refreshPlans();
    void refreshSubscription();
    return () => {
      generation.current += 1;
    };
  }, [enabled, scope, refreshPlans, refreshSubscription]);

  const error = state.subscriptionError ?? state.plansError;
  return {
    subscription: state.subscription,
    plans: state.plans,
    planMeta: state.planMeta,
    subscriptionStatus: state.subscriptionStatus,
    loading: state.subscriptionLoading || state.plansLoading,
    subscriptionLoading: state.subscriptionLoading,
    plansLoading: state.plansLoading,
    subscriptionResolved: state.subscriptionResolved,
    subscriptionError: state.subscriptionError?.message ?? null,
    plansError: state.plansError?.message ?? null,
    error: error?.message ?? null,
    errorTitle: error?.title ?? null,
    errorStatus: error?.status ?? null,
    refreshSubscription,
    refreshPlans,
    refreshStatus,
  };
}

export default useSubscription;
