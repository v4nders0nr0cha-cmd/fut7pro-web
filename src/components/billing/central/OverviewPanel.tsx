"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useCentral } from "./CentralProvider";
import { Empty, Notice, Pill, Skeleton } from "./Common";
import { date, money, statusLabel, accessSource } from "./presentation";
import RecordTimeline from "./RecordTimeline";
import { formatBillingPlanLabel } from "@/utils/billing-plan-label";
import s from "./central.module.css";

export default function OverviewPanel() {
  const c = useCentral();
  const params = useSearchParams();
  const [timeline, setTimeline] = useState(false);
  const sub = c.subscription;
  if (c.subscriptionLoading && !sub) return <Skeleton />;
  if (!sub)
    return c.subscriptionError ? (
      <Notice error retry={() => void c.refresh()}>
        {c.subscriptionError}
      </Notice>
    ) : (
      <Empty>
        <p>Este grupo ainda não tem uma assinatura registrada.</p>
        <Link className={s.linkButton} href="/admin/assinatura/planos">
          Conhecer os planos disponíveis <ArrowUpRight size={15} />
        </Link>
      </Empty>
    );
  const overview = c.overview.data;
  const caps = c.capabilities.data?.capabilities;
  const access = c.subscriptionStatus?.access ?? sub.access ?? overview?.access;
  const financial =
    c.subscriptionStatus?.financialStatus ?? sub.financialStatus ?? overview?.financialStatus;
  const allowed = access?.canAccess === true && access.blocked !== true;
  const accessKnown =
    !c.subscriptionError && !c.subscriptionLoading && typeof access?.canAccess === "boolean";
  const plan = c.plans.find((plan) => plan.key === sub.planKey);
  const end = access?.effectiveAccessUntil;
  return (
    <>
      {params.get("retorno") === "pagamento" && (
        <Notice>
          Retorno do checkout recebido. A situação abaixo depende da confirmação do sistema.
        </Notice>
      )}
      {c.subscriptionError && (
        <Notice error retry={() => void c.refresh()}>
          Os dados do plano foram preservados, mas não foi possível confirmar a situação atual. As
          ações financeiras estão bloqueadas.
        </Notice>
      )}
      {c.overview.error && (
        <Notice error retry={c.overview.retry}>
          O resumo do plano continua disponível. Não foi possível consultar as informações
          complementares agora.
        </Notice>
      )}
      {caps?.operationPending && (
        <Notice>
          Existe uma solicitação financeira em conferência. Atualize a assinatura para consultar a
          situação. Uma nova cobrança não será iniciada automaticamente.
        </Notice>
      )}
      <div className={`${s.grid} ${s.three}`}>
        <section className={`${s.card} ${s.hero}`}>
          <h3>Plano contratado</h3>
          <Pill>{statusLabel(overview?.subscription.status || sub.status)}</Pill>
          <strong className={s.value}>{plan?.label || formatBillingPlanLabel(sub.planKey)}</strong>
          <p className={s.muted}>
            {money(overview?.subscription.amountCents ?? sub.amount)} /{" "}
            {sub.interval === "year" ? "ano" : "mês"}
          </p>
          <p className={s.small}>
            Condições atuais do contrato. Valores históricos ficam nas cobranças.
          </p>
          <Link className={s.linkButton} href="/admin/assinatura/planos">
            Ver planos <ArrowUpRight size={14} />
          </Link>
        </section>
        <section className={s.card}>
          <h3>Status de acesso</h3>
          <Pill tone={!accessKnown ? "neutral" : allowed ? "good" : "danger"}>
            {allowed ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}{" "}
            {accessKnown
              ? allowed
                ? access?.compensationActive
                  ? "Acesso liberado"
                  : "Ativo"
                : "Acesso bloqueado"
              : c.subscriptionLoading
                ? "Verificando acesso"
                : "Não confirmado"}
          </Pill>
          <strong className={s.value}>
            {end ? date(end) : allowed ? "Acesso autorizado" : "Consulte a situação"}
          </strong>
          <p className={s.muted}>
            {end
              ? accessKnown
                ? "Prazo oficial de acesso"
                : "Último prazo consultado"
              : "Prazo não informado"}
          </p>
          <p className={s.small}>{accessSource(access?.source)}</p>
          {access?.compensationActive && (
            <p className={s.small}>
              A concessão de acesso é independente da situação dos pagamentos.
            </p>
          )}
        </section>
        <section className={s.card}>
          <h3>Status financeiro</h3>
          <Pill
            tone={
              financial?.code === "EM_DIA"
                ? "good"
                : ["PENDENTE", "VENCIDO"].includes(financial?.code || "")
                  ? "warn"
                  : "neutral"
            }
          >
            {financial?.label || "Não informado"}
          </Pill>
          <strong className={s.value}>
            {overview?.invoices
              ? `${overview.invoices.pending} ${overview.invoices.pending === 1 ? "cobrança pendente" : "cobranças pendentes"}`
              : "Situação dos pagamentos"}
          </strong>
          <p className={s.muted}>
            {financial?.message ||
              "Consulte as cobranças para verificar pagamentos e pendências registrados."}
          </p>
          {caps?.canViewHistory && (
            <Link className={s.linkButton} href="/admin/assinatura/pagamentos">
              Consultar cobranças <ArrowUpRight size={14} />
            </Link>
          )}
        </section>
      </div>
      <div className={s.actions}>
        {caps?.canPay && (
          <button
            className={s.button}
            type="button"
            disabled={!c.ready || c.busy || (!caps.canUsePix && !caps.canUseRecurring)}
            onClick={() => c.openDialog("payment")}
          >
            Regularizar pagamento
          </button>
        )}
        {caps?.canViewHistory && (
          <Link className={s.secondary} href="/admin/assinatura/beneficios">
            Consultar benefícios
          </Link>
        )}
        <Link className={s.secondary} href="/admin/assinatura/planos">
          Ver planos disponíveis
        </Link>
      </div>
      <div className={s.sectionTitle}>
        <h2>Gestão da assinatura</h2>
      </div>
      <section className={s.card}>
        <dl className={s.details}>
          <div>
            <dt>Situação contratual</dt>
            <dd>{statusLabel(overview?.subscription.status || sub.status)}</dd>
          </div>
          <div>
            <dt>Periodicidade</dt>
            <dd>
              {sub.interval === "year"
                ? "Anual"
                : sub.interval === "month"
                  ? "Mensal"
                  : "Não registrada"}
            </dd>
          </div>
          <div>
            <dt>Assinatura registrada em</dt>
            <dd>
              {overview
                ? date(overview.subscription.createdAt)
                : c.overview.error
                  ? "Consulta indisponível"
                  : "Consultando..."}
            </dd>
          </div>
          <div>
            <dt>Teste gratuito até</dt>
            <dd>{date(sub.trialEnd)}</dd>
          </div>
        </dl>
        {caps?.canCancel && (
          <button
            type="button"
            className={s.linkButton}
            disabled={!c.ready || c.busy}
            onClick={() => c.openDialog("cancel")}
          >
            Solicitar cancelamento
          </button>
        )}
        {!caps?.canViewHistory && (
          <p className={s.small}>
            Você está consultando o resumo permitido ao seu acesso administrativo.
          </p>
        )}
      </section>
      {caps?.canViewHistory && (
        <>
          <button
            className={s.linkButton}
            type="button"
            aria-expanded={timeline}
            onClick={() => setTimeline((value) => !value)}
          >
            {timeline ? "Ocultar" : "Consultar"} histórico da assinatura
          </button>
          {timeline && <RecordTimeline key={c.scope} />}
        </>
      )}
    </>
  );
}
