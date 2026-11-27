"use client";
import { useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { useCentral } from "./CentralProvider";
import { Empty, Notice, Pill, Skeleton } from "./Common";
import { money } from "./presentation";
import s from "./central.module.css";
export default function PlansPanel() {
  const c = useCentral();
  const [selection, setSelection] = useState<{ scope: string; interval: "month" | "year" } | null>(
    null
  );
  const interval =
    selection?.scope === c.scope
      ? selection.interval
      : c.subscription?.interval === "year"
        ? "year"
        : "month";
  const setInterval = (value: "month" | "year") =>
    setSelection({ scope: c.scope, interval: value });
  const caps = c.capabilities.data?.capabilities;
  if (c.plansLoading && !c.plans.length)
    return <Skeleton label="Consultando planos disponíveis..." />;
  if (c.plansError)
    return (
      <Notice error retry={() => void c.refreshPlans()}>
        {c.plansError}
      </Notice>
    );
  const plans = c.plans
    .filter((plan) => plan.active !== false && plan.interval === interval)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <>
      <div className={s.sectionTitle}>
        <h2>Planos para o seu grupo</h2>
      </div>
      <p className={s.muted}>
        Compare as condições do catálogo oficial. A contratação e as alterações seguem as
        possibilidades autorizadas para a sua assinatura.
      </p>
      <div className={`${s.segments} mt-5`} role="group" aria-label="Periodicidade dos planos">
        <button
          type="button"
          aria-pressed={interval === "month"}
          onClick={() => setInterval("month")}
        >
          Mensal
        </button>
        <button
          type="button"
          aria-pressed={interval === "year"}
          onClick={() => setInterval("year")}
        >
          Anual
        </button>
      </div>
      {interval === "year" && c.planMeta?.annualNote && (
        <p className={s.small}>{c.planMeta.annualNote}</p>
      )}
      {caps?.changePlanRequiresSupport && (
        <Notice>
          Já existe um checkout vinculado ao plano atual. A troca de plano exige conferência pelo
          suporte para preservar as condições da cobrança.
        </Notice>
      )}
      {c.capabilities.error && (
        <Notice error retry={c.capabilities.retry}>
          O catálogo está disponível, mas as ações comerciais dependem da confirmação das suas
          permissões.
        </Notice>
      )}
      {!plans.length ? (
        <Empty>Nenhum plano desta periodicidade está disponível no momento.</Empty>
      ) : (
        <div className={`${s.grid} ${s.three}`}>
          {plans.map((plan) => {
            const current = c.subscription?.planKey === plan.key;
            const commercial = !c.subscription ? caps?.canCreateSubscription : caps?.canChangePlan;
            return (
              <article
                key={plan.key}
                className={`${s.card} flex flex-col ${current ? s.hero : ""}`}
              >
                {current ? (
                  <Pill tone="good">Plano atual</Pill>
                ) : plan.badge ? (
                  <Pill>{plan.badge}</Pill>
                ) : null}
                <h3 className="!text-lg !text-white mt-4">{plan.label}</h3>
                <p className={s.muted}>{plan.description}</p>
                <strong className={s.value}>
                  {money(Math.round(plan.amount * 100))}
                  <span className="ml-1 text-sm font-normal text-zinc-400">
                    /{plan.interval === "year" ? "ano" : "mês"}
                  </span>
                </strong>
                {plan.requiresUpfront && typeof plan.upfrontAmount === "number" && (
                  <p className={s.muted}>
                    Cobrança inicial: {money(Math.round(plan.upfrontAmount * 100))}
                  </p>
                )}
                {plan.paymentNote && <p className={s.small}>{plan.paymentNote}</p>}
                <ul className={`${s.features} flex-1`}>
                  {[...(plan.features || []), ...(plan.limits || [])].map((feature, index) => (
                    <li key={index}>
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-300"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={current ? s.secondary : s.button}
                  disabled={
                    !c.ready ||
                    c.busy ||
                    current ||
                    (plan.ctaType !== "contact" && !commercial) ||
                    Boolean(
                      plan.requiresUpfront &&
                        plan.key !== "monthly_enterprise" &&
                        plan.ctaType !== "contact"
                    )
                  }
                  onClick={() =>
                    c.openDialog(
                      plan.ctaType === "contact" ? "contact" : c.subscription ? "plan" : "create",
                      plan
                    )
                  }
                >
                  {current
                    ? "Seu plano atual"
                    : plan.ctaType === "contact"
                      ? "Conversar sobre este plano"
                      : !commercial && c.subscription
                        ? "Troca indisponível"
                        : "Escolher este plano"}
                  {!current && <ArrowUpRight size={14} aria-hidden="true" />}
                </button>
                {!c.subscription && plan.trialDays > 0 && (
                  <p className={s.small}>
                    {plan.trialDays} dias de teste conforme as condições de contratação.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
      {c.subscription && (caps?.canViewHistory || caps?.canApplyCoupon) && (
        <section className={`${s.card} mt-6`}>
          <h3>Cupom da assinatura</h3>
          <p className={s.muted}>
            {c.subscription.couponCode
              ? `Cupom aplicado: ${c.subscription.couponCode}. As condições e o uso confirmado estão disponíveis em Benefícios e Pagamentos.`
              : "Tem um cupom? O Fut7Pro verificará se ele pode ser aplicado ao contrato atual."}
          </p>
          {caps?.canApplyCoupon && (
            <button
              type="button"
              className={`${s.secondary} mt-3`}
              disabled={!c.ready || c.busy}
              onClick={() => c.openDialog("coupon")}
            >
              Aplicar cupom
            </button>
          )}
        </section>
      )}
    </>
  );
}
