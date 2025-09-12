import { useState, useEffect } from "react";
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

  const refreshSubscription = async () => {
    if (!tenantId) return;

    try {
      setError(null);
      const data = await BillingAPI.getSubscriptionByTenant(tenantId);
      setSubscription(data);

      // Se tiver subscription, buscar status
      if (data.id) {
        const status = await BillingAPI.getSubscriptionStatus(data.id);
        setSubscriptionStatus(status);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar assinatura");
    }
  };

  const refreshPlans = async () => {
    try {
      setError(null);
      const data = await BillingAPI.getPlans();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar planos");
    }
  };

  const refreshStatus = async () => {
    if (!subscription?.id) return;

    try {
      setError(null);
      const status = await BillingAPI.getSubscriptionStatus(subscription.id);
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar status");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshPlans(), tenantId ? refreshSubscription() : Promise.resolve()]);
      setLoading(false);
    };

    loadData();
  }, [tenantId]);

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
