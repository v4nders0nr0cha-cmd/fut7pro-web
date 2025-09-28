import { useState, useEffect, useCallback } from "react";
import BillingAPI, {
  type Subscription,
  type Plan,
  type SubscriptionStatus,
} from "@/lib/api/billing";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plans: Plan[];
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useSubscription(tenantId?: string): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!tenantId) return;

    try {
      setError(null);
      const data = await BillingAPI.getSubscriptionByTenant(tenantId);
      setSubscription(data);

      if (data.id) {
        const status = await BillingAPI.getSubscriptionStatus(data.id);
        setSubscriptionStatus(status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar assinatura");
    }
  }, [tenantId]);

  const refreshPlans = useCallback(async () => {
    try {
      setError(null);
      const data = await BillingAPI.getPlans();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar planos");
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!subscription?.id) return;

    try {
      setError(null);
      const status = await BillingAPI.getSubscriptionStatus(subscription.id);
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar status");
    }
  }, [subscription?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([refreshPlans(), tenantId ? refreshSubscription() : Promise.resolve()]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [tenantId, refreshPlans, refreshSubscription]);

  return {
    subscription,
    plans,
    subscriptionStatus,
    loading,
    error,
    refreshSubscription,
    refreshPlans,
    refreshStatus,
  };
}

export default useSubscription;
