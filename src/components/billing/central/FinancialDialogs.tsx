"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import BillingAPI, { BillingApiError, type ChargePricing } from "@/lib/api/billing";
import {
  buildFut7ProOfficialWhatsAppUrl,
  FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL,
} from "@/config/fut7pro-contact";
import { useCentral } from "./CentralProvider";
import { money, dateTime, isPixExpired } from "./presentation";
import { Notice } from "./Common";
import s from "./central.module.css";

export function paymentHref(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      ["mercadopago.com.br", "mercadopago.com", "mpago.la"].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      )
      ? url.href
      : null;
  } catch {
    return null;
  }
}
type PixView = {
  code?: string;
  image?: string;
  url?: string;
  expiresAt?: string | null;
  amount: number;
  pricing?: ChargePricing;
  recurringUrl?: string;
};

export default function FinancialDialogs() {
  const c = useCentral();
  const caps = c.capabilities.data?.capabilities;
  const { data: session } = useSession();
  const [accepted, setAccepted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [pix, setPix] = useState<PixView | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiryTick, setExpiryTick] = useState(0);
  useEffect(() => {
    const deadline = Date.parse(pix?.expiresAt || "");
    if (!Number.isFinite(deadline) || deadline <= Date.now()) return;
    const timer = setTimeout(
      () => setExpiryTick((n) => n + 1),
      Math.min(deadline - Date.now() + 25, 2147483647)
    );
    return () => clearTimeout(timer);
  }, [pix?.expiresAt, expiryTick]);
  const pixExpired = isPixExpired(pix?.expiresAt);
  useEffect(() => {
    setAccepted(false);
    setCoupon("");
    setPix(null);
    setCopied(false);
  }, [c.dialog?.type]);
  const dialog = c.dialog;
  const plan = dialog?.plan;
  const pricing = c.subscription?.pricingPreview;
  const enabled = c.ready && !c.busy;
  const label =
    dialog?.type === "payment"
      ? pix
        ? "PIX da assinatura"
        : "Regularizar assinatura"
      : dialog?.type === "cancel"
        ? "Cancelar assinatura"
        : dialog?.type === "coupon"
          ? "Aplicar cupom"
          : dialog?.type === "contact"
            ? "Converse com o Fut7Pro"
            : dialog?.type === "create"
              ? "Escolher plano"
              : "Alterar plano";
  async function recurring() {
    if (!caps?.canUseRecurring || !accepted || !c.subscription) return;
    const result = await c.runAction(async () => {
      const reply = await BillingAPI.activateSubscription(
        c.subscription!.id,
        `${window.location.origin}/admin/assinatura?retorno=pagamento`
      );
      const url = paymentHref(reply.checkoutUrl);
      if (!url)
        throw new BillingApiError(
          "O checkout não pôde ser confirmado. Atualize a assinatura antes de continuar.",
          409,
          null
        );
      return url;
    });
    if (result) window.location.assign(result);
  }
  async function createPix() {
    if (!caps?.canUsePix || !c.subscription) return;
    const result = await c.runAction(() =>
      BillingAPI.createPixCharge(c.subscription!.id, session?.user?.name || email)
    );
    if (result)
      setPix({
        code: result.pix.qrCode,
        image: result.pix.qrCodeBase64,
        url: result.pix.ticketUrl,
        expiresAt: result.pix.expiresAt,
        amount: result.invoice.amount,
        pricing: result.pricing,
      });
  }
  async function applyCoupon() {
    if (!caps?.canApplyCoupon || !c.subscription || !coupon.trim()) return;
    const result = await c.runAction(() =>
      BillingAPI.applyCouponToSubscription(c.subscription!.id, coupon.trim())
    );
    if (result) {
      c.success(
        "Cupom aplicado à assinatura. Consulte os benefícios para conferir as condições e as concessões registradas."
      );
      c.closeDialog();
    }
  }
  async function cancel() {
    if (!caps?.canCancel || !c.subscription) return;
    const result = await c.runAction(async () => {
      const value = await BillingAPI.cancelSubscription(c.subscription!.id);
      if (!value.success) throw new Error("Cancelamento não confirmado");
      return value;
    });
    if (result) {
      c.success("Cancelamento confirmado pelo sistema.");
      c.closeDialog();
    }
  }
  async function choose() {
    if (!plan || !c.tenantId) return;
    if (dialog?.type === "create") {
      if (!caps?.canCreateSubscription || !email.trim()) return;
      if (plan.requiresUpfront) {
        if (!caps.canStartEnterprise || plan.key !== "monthly_enterprise") return;
        const result = await c.runAction(() =>
          BillingAPI.startEnterpriseMonthly({
            tenantId: c.tenantId!,
            payerEmail: email.trim(),
            payerName: session?.user?.name || email,
          })
        );
        if (result) {
          c.success(
            "Contratação registrada. Consulte a cobrança inicial e a autorização de recorrência."
          );
          setPix({
            code: result.pix.qrCode,
            image: result.pix.qrCodeBase64,
            url: result.pix.ticketUrl,
            amount: result.upfrontInvoice.amount,
            recurringUrl: result.preapproval.url,
          });
        }
      } else {
        const result = await c.runAction(() =>
          BillingAPI.createSubscription({
            tenantId: c.tenantId!,
            planKey: plan.key,
            payerEmail: email.trim(),
            couponCode: coupon.trim() || undefined,
          })
        );
        if (result) {
          c.success(
            "Plano registrado. Consulte a visão geral para acompanhar o acesso e os pagamentos."
          );
          c.closeDialog();
        }
      }
    } else if (caps?.canChangePlan && c.subscription) {
      const result = await c.runAction(() =>
        BillingAPI.changeSubscriptionPlan(c.subscription!.id, plan.key)
      );
      if (result) {
        c.success("Plano alterado pelo sistema.");
        c.closeDialog();
      }
    }
  }
  const pixUrl = paymentHref(pix?.url);
  return (
    <Fut7DialogBase
      open={Boolean(dialog)}
      title={label}
      eyebrow="Assinatura Fut7Pro"
      tone={dialog?.type === "cancel" ? "destructive" : "default"}
      onClose={c.closeDialog}
      size={dialog?.type === "payment" ? "lg" : "md"}
    >
      <div className={s.central} style={{ padding: 0 }}>
        {c.actionError && <Notice error>{c.actionError}</Notice>}
        {c.busy && (
          <p role="status" className={s.notice}>
            Solicitação em processamento. Aguarde a confirmação.
          </p>
        )}
        {pix ? (
          <>
            <p className={s.muted}>
              {pixExpired
                ? "O prazo informado para este PIX terminou. Atualize a assinatura para conferir a cobrança antes de tentar pagar."
                : "Pague com o aplicativo do seu banco. A confirmação depende do processamento do pagamento."}
            </p>
            <p className={s.value}>{money(pix.amount)}</p>
            {pix.image && !pixExpired && (
              <Image
                src={
                  pix.image.startsWith("data:image/png;base64,")
                    ? pix.image
                    : `data:image/png;base64,${pix.image}`
                }
                alt="QR Code para pagamento da assinatura"
                width={192}
                height={192}
                unoptimized
                className="mx-auto my-5 rounded-xl"
              />
            )}
            {pix.code && (
              <>
                <label htmlFor="central-pix" className={s.muted}>
                  Código PIX copia e cola
                </label>
                <textarea
                  id="central-pix"
                  readOnly
                  disabled={pixExpired}
                  value={pix.code}
                  className={`${s.input} mt-2`}
                  rows={3}
                />
                <button
                  type="button"
                  className={s.secondary}
                  disabled={pixExpired}
                  onClick={async () => {
                    const current = c.actionToken();
                    try {
                      await navigator.clipboard.writeText(pix.code!);
                      if (current()) setCopied(true);
                    } catch {
                      if (current()) setCopied(false);
                    }
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                  {copied ? "Código copiado" : "Copiar código PIX"}
                </button>
              </>
            )}
            {pix.expiresAt && (
              <p className={s.small}>
                Validade do PIX: {dateTime(pix.expiresAt)}. Essa data não representa o prazo de
                acesso ao sistema.
              </p>
            )}
            <div className={s.actions}>
              {paymentHref(pix.recurringUrl) && (
                <a
                  className={s.button}
                  href={paymentHref(pix.recurringUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Autorizar recorrência no Mercado Pago
                </a>
              )}
              {pixUrl && !pixExpired && (
                <a className={s.secondary} href={pixUrl} target="_blank" rel="noopener noreferrer">
                  Abrir pagamento
                </a>
              )}
              <button
                type="button"
                className={s.button}
                onClick={() => void c.refresh()}
                disabled={c.subscriptionLoading}
              >
                Atualizar assinatura
              </button>
            </div>
            <p className={s.small}>O link de pagamento não é um comprovante.</p>
          </>
        ) : dialog?.type === "payment" ? (
          <>
            <p className={s.muted}>
              Escolha como deseja pagar. O acesso será atualizado conforme a confirmação oficial do
              sistema.
            </p>
            {pricing && (
              <dl className={s.details}>
                <div>
                  <dt>Valor base desta cobrança</dt>
                  <dd>{money(pricing.baseAmountCents)}</dd>
                </div>
                <div>
                  <dt>Total previsto</dt>
                  <dd>{money(pricing.totalCents)}</dd>
                </div>
                {pricing.discountCents > 0 && (
                  <div>
                    <dt>Desconto previsto</dt>
                    <dd>
                      {money(pricing.discountCents)} ·{" "}
                      {pricing.recurringDiscountApplied ? "recorrente" : "nesta cobrança"}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {caps?.canUseRecurring && (
              <section className={s.card}>
                <h3>Pagamento recorrente</h3>
                <p className={s.muted}>Conclua a autorização no ambiente do Mercado Pago.</p>
                <label className="mt-4 flex gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  Autorizo as cobranças recorrentes conforme as condições apresentadas no checkout.
                </label>
                <button
                  type="button"
                  className={`${s.button} mt-4`}
                  disabled={!enabled || !accepted}
                  onClick={() => void recurring()}
                >
                  Continuar no Mercado Pago
                </button>
              </section>
            )}
            {caps?.canUsePix && (
              <section className={`${s.card} mt-4`}>
                <h3>PIX</h3>
                <p className={s.muted}>Gere o código de pagamento desta cobrança.</p>
                <button
                  type="button"
                  className={`${s.secondary} mt-4`}
                  disabled={!enabled}
                  onClick={() => void createPix()}
                >
                  Gerar PIX
                </button>
              </section>
            )}
          </>
        ) : dialog?.type === "coupon" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void applyCoupon();
            }}
          >
            <p className={s.muted}>
              As condições serão verificadas pelo Fut7Pro antes da aplicação. Dias e descontos
              recebidos serão mostrados nos registros confirmados.
            </p>
            <label htmlFor="central-coupon" className={s.muted}>
              Código do cupom
            </label>
            <input
              id="central-coupon"
              className={`${s.input} my-3`}
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              autoComplete="off"
              maxLength={100}
            />
            <button
              type="submit"
              className={s.button}
              disabled={!enabled || !caps?.canApplyCoupon || !coupon.trim()}
            >
              Aplicar cupom
            </button>
          </form>
        ) : dialog?.type === "cancel" ? (
          <>
            <p className={s.muted}>
              Deseja solicitar o cancelamento da assinatura? As condições vigentes serão verificadas
              pelo sistema. O cancelamento só estará concluído após a confirmação.
            </p>
            <div className={s.actions}>
              <button type="button" className={s.secondary} onClick={c.closeDialog}>
                Manter assinatura
              </button>
              <button
                type="button"
                className={s.button}
                disabled={!enabled || !caps?.canCancel}
                onClick={() => void cancel()}
              >
                Confirmar cancelamento
              </button>
            </div>
          </>
        ) : dialog?.type === "contact" ? (
          <>
            <p className={s.muted}>
              Converse com a equipe sobre o plano {plan?.label || "selecionado"} e as condições para
              o seu grupo.
            </p>
            <div className={s.actions}>
              <a
                className={s.button}
                href={buildFut7ProOfficialWhatsAppUrl(
                  `Olá! Gostaria de conhecer as condições do plano ${plan?.label || "Enterprise"} para meu grupo de futebol.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com a equipe
              </a>
              <a
                className={s.secondary}
                href={`mailto:${plan?.contactEmail || FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL}`}
              >
                Enviar e-mail
              </a>
            </div>
          </>
        ) : plan ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void choose();
            }}
          >
            <p className={s.value}>{plan.label}</p>
            <p className={s.muted}>
              {money(Math.round(plan.amount * 100))}/{plan.interval === "year" ? "ano" : "mês"}
            </p>
            <p className={s.muted}>{plan.paymentNote || plan.description}</p>
            {dialog?.type === "create" && (
              <>
                <label className={s.field}>
                  E-mail do responsável pelo pagamento
                  <input
                    type="email"
                    required
                    className={`${s.input} my-3`}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                {!plan.requiresUpfront && (
                  <label className={s.field}>
                    Cupom, se houver
                    <input
                      className={`${s.input} my-3`}
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      maxLength={100}
                    />
                  </label>
                )}
              </>
            )}
            <div className={s.actions}>
              <button type="button" className={s.secondary} onClick={c.closeDialog}>
                Voltar
              </button>
              <button
                type="submit"
                className={s.button}
                disabled={
                  !enabled ||
                  (dialog?.type === "create" ? !caps?.canCreateSubscription : !caps?.canChangePlan)
                }
              >
                Confirmar escolha
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </Fut7DialogBase>
  );
}
