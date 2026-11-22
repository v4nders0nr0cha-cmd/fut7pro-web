"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import useSubscription from "@/hooks/useSubscription";
import { useRacha } from "@/context/RachaContext";
import { BILLING_CHANGED, notifyBillingChanged } from "@/lib/billing-events";
import {
  centralRequest,
  historyRequest,
  type CapabilityResponse,
  type Overview,
} from "@/lib/api/subscription-central";
import useCentralResource from "./useCentralResource";
import { BillingApiError, type Plan } from "@/lib/api/billing";
export type CentralDialogKind = "payment" | "cancel" | "plan" | "coupon" | "contact" | "create";

function useCentralState() {
  const { rachaId, tenantSlug } = useRacha();
  const subscription = useSubscription(rachaId || undefined);
  const clock = useRef({ tenant: rachaId, generation: 0 });
  if (clock.current.tenant !== rachaId)
    clock.current = { tenant: rachaId, generation: clock.current.generation + 1 };
  const scope = `${rachaId || "none"}:${clock.current.generation}`;
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [revision, setRevision] = useState(0);
  const [dialogStore, setDialogStore] = useState<{
    scope: string;
    type: CentralDialogKind;
    plan?: Plan;
  } | null>(null);
  const pending = useRef(new Map<string, symbol>());
  const [, renderOperation] = useState(0);
  const [feedback, setFeedback] = useState<{
    scope: string;
    error: string | null;
    success: string | null;
  }>({ scope, error: null, success: null });
  const capabilities = useCentralResource(
    rachaId ? `${scope}:capabilities:${subscription.subscription?.id || "none"}` : null,
    async (signal) => {
      const data = await centralRequest<CapabilityResponse>("capabilities", signal);
      if (data.tenantId !== rachaId) throw new Error("Escopo inválido");
      if (
        !data.capabilities ||
        typeof data.capabilities.canPay !== "boolean" ||
        typeof data.capabilities.canViewHistory !== "boolean"
      )
        throw new Error("Capacidades não confirmadas");
      return data;
    },
    revision
  );
  const id = subscription.subscription?.id;
  const overview = useCentralResource(
    id ? `${scope}:overview:${id}` : null,
    async (signal) => {
      const data = await historyRequest<Overview>(id!, "overview", {}, signal);
      if (data.subscription.id !== id || data.subscription.tenantId !== rachaId)
        throw new Error("Escopo inválido");
      return data;
    },
    revision
  );
  const ready = Boolean(
    rachaId &&
      subscription.subscriptionResolved &&
      !subscription.subscriptionLoading &&
      !subscription.subscriptionError &&
      capabilities.data?.subscriptionId === (id ?? null) &&
      !capabilities.loading &&
      !capabilities.error
  );
  async function runAction<T>(work: () => Promise<T>): Promise<T | undefined> {
    if (!ready || !rachaId || pending.current.has(rachaId)) return;
    const owner = Symbol();
    const tenant = rachaId,
      slug = tenantSlug,
      generation = clock.current.generation;
    const current = () => alive.current && clock.current.generation === generation;
    pending.current.set(tenant, owner);
    renderOperation((n) => n + 1);
    setFeedback({ scope, error: null, success: null });
    try {
      const result = await work();
      notifyBillingChanged({ tenantId: tenant, slug: slug || "" });
      return current() ? result : undefined;
    } catch (error) {
      if (current())
        setFeedback({
          scope,
          success: null,
          error:
            error instanceof BillingApiError && error.status < 500
              ? error.message
              : "Não foi possível confirmar a operação. Atualize a assinatura e confira a situação antes de tentar novamente.",
        });
      return undefined;
    } finally {
      if (pending.current.get(tenant) === owner) pending.current.delete(tenant);
      if (alive.current) renderOperation((n) => n + 1);
    }
  }
  useEffect(() => {
    const update = (event: Event) => {
      if ((event as CustomEvent<{ tenantId?: string }>).detail?.tenantId === rachaId)
        setRevision((n) => n + 1);
    };
    window.addEventListener(BILLING_CHANGED, update);
    return () => window.removeEventListener(BILLING_CHANGED, update);
  }, [rachaId]);
  return {
    ...subscription,
    tenantId: rachaId,
    tenantSlug,
    scope,
    revision,
    capabilities,
    overview,
    ready,
    dialog: dialogStore?.scope === scope ? dialogStore : null,
    openDialog: (type: CentralDialogKind, plan?: Plan) => {
      if (ready && !pending.current.has(rachaId || "")) setDialogStore({ scope, type, plan });
    },
    closeDialog: () => setDialogStore(null),
    busy: pending.current.has(rachaId || ""),
    runAction,
    actionError: feedback.scope === scope ? feedback.error : null,
    actionSuccess: feedback.scope === scope ? feedback.success : null,
    success: (message: string) => setFeedback({ scope, error: null, success: message }),
    refresh: async () => {
      setRevision((n) => n + 1);
      await subscription.refreshSubscription();
    },
    actionToken: () => {
      const generation = clock.current.generation;
      return () => alive.current && clock.current.generation === generation;
    },
    changed: () => {
      if (rachaId) notifyBillingChanged({ tenantId: rachaId, slug: tenantSlug || "" });
    },
  };
}
type CentralState = ReturnType<typeof useCentralState>;
const Context = createContext<CentralState | null>(null);
export function CentralProvider({ children }: { children: ReactNode }) {
  const value = useCentralState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCentral() {
  const value = useContext(Context);
  if (!value) throw new Error("CentralProvider ausente");
  return value;
}
