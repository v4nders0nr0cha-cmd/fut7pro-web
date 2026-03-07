import { useState, useEffect, useCallback } from "react";
import BillingAPI, {
  BillingApiError,
  type Subscription,
  type Plan,
  type SubscriptionStatus,
  type PlanCatalogMeta,
} from "@/lib/api/billing";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plans: Plan[];
  planMeta: PlanCatalogMeta | null;
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  errorTitle: string | null;
  errorStatus: number | null;
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

function mapFriendlyError(error: unknown, fallback: string) {
  if (error instanceof BillingApiError) {
    const status = error.status;
    if (status === 403) {
      return {
        title: "Não foi possível carregar os dados do plano",
        message:
          "Estamos tentando sincronizar as informações da assinatura do seu racha. Atualize a página em instantes.",
        status,
      };
    }
    if (status === 404) {
      return {
        title: "Assinatura em sincronização",
        message:
          "Ainda estamos concluindo a vinculação do plano do seu racha. Atualize a página em alguns instantes.",
        status,
      };
    }
    if (status === 409) {
      return {
        title: "Conflito ao carregar assinatura",
        message:
          "Detectamos uma atualização em andamento nos dados do plano. Aguarde alguns instantes e tente novamente.",
        status,
      };
    }
    if (status >= 500) {
      return {
        title: "Serviço de assinatura indisponível",
        message:
          "Não foi possível carregar os dados do seu plano agora. Tente novamente em instantes.",
        status,
      };
    }
    return {
      title: "Falha ao carregar assinatura",
      message: error.message || fallback,
      status,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Falha ao carregar assinatura",
      message: error.message || fallback,
      status: null,
    };
  }

  return {
    title: "Falha ao carregar assinatura",
    message: fallback,
    status: null,
  };
}

export function useSubscription(tenantId?: string): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planMeta, setPlanMeta] = useState<PlanCatalogMeta | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const refreshSubscription = useCallback(async () => {
    try {
      setError(null);
      setErrorTitle(null);
      setErrorStatus(null);
      const data = await BillingAPI.getSubscriptionByTenant();
      setSubscription(data ?? null);

      // Se tiver subscription, buscar status
      if (data?.id) {
        const status = await BillingAPI.getSubscriptionStatus(data.id);
        setSubscriptionStatus(status);
      } else {
        setSubscriptionStatus(null);
      }
    } catch (err) {
      const friendly = mapFriendlyError(err, "Erro ao buscar assinatura.");
      setError(friendly.message);
      setErrorTitle(friendly.title);
      setErrorStatus(friendly.status);
      setSubscriptionStatus(null);
    }
  }, []);

  const refreshPlans = useCallback(async () => {
    try {
      setError(null);
      setErrorTitle(null);
      setErrorStatus(null);
      const data = await BillingAPI.getPlans();
      setPlans(data.plans || []);
      setPlanMeta(data.meta ?? null);
    } catch (err) {
      const friendly = mapFriendlyError(err, "Erro ao buscar planos.");
      setError(friendly.message);
      setErrorTitle(friendly.title);
      setErrorStatus(friendly.status);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!subscription?.id) return;

    try {
      setError(null);
      setErrorTitle(null);
      setErrorStatus(null);
      const status = await BillingAPI.getSubscriptionStatus(subscription.id);
      setSubscriptionStatus(status);
    } catch (err) {
      const friendly = mapFriendlyError(err, "Erro ao buscar status da assinatura.");
      setError(friendly.message);
      setErrorTitle(friendly.title);
      setErrorStatus(friendly.status);
    }
  }, [subscription?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshPlans(), refreshSubscription()]);
      setLoading(false);
    };

    loadData();
  }, [tenantId, refreshPlans, refreshSubscription]);

  return {
    subscription,
    plans,
    planMeta,
    subscriptionStatus,
    loading,
    error,
    errorTitle,
    errorStatus,
    refreshSubscription,
    refreshPlans,
    refreshStatus,
  };
}

export default useSubscription;
