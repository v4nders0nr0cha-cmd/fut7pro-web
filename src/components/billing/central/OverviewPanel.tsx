"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useCentral } from "./CentralProvider";
import { Empty, Notice, Pill, Skeleton } from "./Common";
import { date, money, statusLabel, accessSource } from "./presentation";
import RecordTimeline from "./RecordTimeline";
import { paymentActionLabel } from "./payment-presentation";
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
  const benefit = overview?.activeAccessBenefit;
  const free = accessKnown && allowed && Boolean(benefit);
  const assessment = overview?.invoices?.attemptsAreNotDebt === true ? overview.invoices : null;
  const overdue = (assessment?.overdueConfirmed ?? 0) > 0;
  const neutralPayment = assessment ? !overdue : Boolean(allowed && access?.compensationActive);
  const financialLabel = assessment
    ? overdue
      ? "Pagamento vencido confirmado"
      : (assessment.confirmationPending ?? 0) > 0
        ? "Pagamento em confirmação"
        : financial?.code === "EM_DIA"
          ? financial.label
          : assessment.pending > 0
            ? "Aguardando ou a conferir"
            : "Sem pagamento vencido comprovado"
    : neutralPayment
      ? "Situação a conferir"
      : financial?.label || "Não informado";
  const contractLabel =
    neutralPayment && (overview?.subscription.status || sub.status) === "past_due"
      ? "Contrato em conferência"
      : statusLabel(overview?.subscription.status || sub.status);
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
      {caps?.paymentConfirmationPending && (
        <Notice>
          O Mercado Pago indica pagamento aprovado. Não pague novamente; aguarde a confirmação
          financeira no Fut7Pro.
        </Notice>
      )}
      <div className={`${s.grid} ${s.three}`}>
        <section className={`${s.card} ${s.hero}`}>
          <h3>Plano contratado</h3>
          <Pill>{contractLabel}</Pill>
          <strong className={s.value}>{plan?.label || formatBillingPlanLabel(sub.planKey)}</strong>
          <p className={s.muted}>
            {money(overview?.subscription.amountCents ?? sub.amount)} /{" "}
            {sub.interval === "year" ? "ano" : "mês"}
          </p>
          <p className={s.small}>
            Condições atuais do contrato. Valores históricos ficam nas cobranças.
          </p>
        </section>
        <section className={s.card}>
          <h3>{free ? "Você está usando o Fut7Pro grátis!" : "Status de acesso"}</h3>
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
            {free && benefit
              ? benefit.source === "GUIDE_REWARD"
                ? "Recompensa confirmada do Guia Interativo"
                : benefit.reasonCategory === "COMMERCIAL_COURTESY"
                  ? `O Fut7Pro concedeu${benefit.days ? ` mais ${benefit.days} dias de acesso` : " esse período"} como cortesia.`
                  : `${benefit.customerReason}${benefit.days ? `: ${benefit.days} dias gratuitos concedidos.` : "."}`
              : end
                ? accessKnown
                  ? "Prazo oficial de acesso"
                  : "Último prazo consultado"
                : "Prazo não informado"}
          </p>
          {!free && <p className={s.small}>{accessSource(access?.source)}</p>}
          {free ? (
            <p className={s.small}>
              Não é necessário pagar para manter o acesso durante esse período gratuito.
            </p>
          ) : (
            access?.compensationActive && (
              <p className={s.small}>
                A concessão de acesso é independente da situação dos pagamentos.
              </p>
            )
          )}
        </section>
        <section className={s.card}>
          <h3>Status financeiro</h3>
          <Pill
            tone={
              neutralPayment
                ? "neutral"
                : financial?.code === "EM_DIA"
                  ? "good"
                  : ["PENDENTE", "VENCIDO"].includes(financial?.code || "")
                    ? "warn"
                    : "neutral"
            }
          >
            {financialLabel}
          </Pill>
          <strong className={s.value}>
            {assessment && (assessment.pixAttempts ?? 0) > 0
              ? `${assessment.assessmentComplete === false ? "Pelo menos " : ""}${assessment.pixAttempts} ${(assessment.pixAttempts ?? 0) === 1 ? "tentativa PIX registrada" : "tentativas PIX registradas"}`
              : overview?.invoices
                ? `${overview.invoices.pending} ${overview.invoices.pending === 1 ? "cobrança pendente" : "cobranças pendentes"}`
                : "Situação dos pagamentos"}
          </strong>
          <p className={s.muted}>
            {assessment && (assessment.pixAttempts ?? 0) > 0 && !overdue
              ? `${(assessment.pixExpired ?? 0) > 0 ? `${assessment.pixExpired} ${(assessment.pixExpired ?? 0) === 1 ? "código expirou" : "códigos expiraram"}. ` : ""}${(assessment.pixCanceled ?? 0) > 0 ? `${assessment.pixCanceled} ${(assessment.pixCanceled ?? 0) === 1 ? "tentativa foi cancelada" : "tentativas foram canceladas"}. ` : ""}Esses registros não comprovam, por si só, mensalidades em dívida. Confira os detalhes em Pagamentos.`
              : financial?.message ||
                "Consulte as cobranças para verificar pagamentos e pendências registrados."}
          </p>
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
            {overdue
              ? "Regularizar pagamento"
              : financial?.code === "TESTE"
                ? "Configurar pagamento"
                : neutralPayment
                  ? "Ver opções de pagamento"
                  : paymentActionLabel(financial?.code, overview?.invoices?.pending)}
          </button>
        )}
      </div>
      <div className={s.sectionTitle}>
        <h2>Gestão da assinatura</h2>
      </div>
      {overview?.subscription.periodIsProspective &&
        overview.subscription.currentPeriodEnd &&
        overview.subscription.currentPeriodEnd !== end && (
          <p className={s.small}>
            O período de referência do contrato ainda não comprova pagamento. O prazo de uso é o
            acesso confirmado acima; não foi alterado por essas tentativas PIX.
          </p>
        )}
      <section className={s.card}>
        <dl className={s.details}>
          <div>
            <dt>Situação contratual</dt>
            <dd>{contractLabel}</dd>
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
