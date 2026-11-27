"use client";
import { useEffect, useRef } from "react";
import { CreditCard, QrCode, ChevronDown, ArrowRight } from "lucide-react";
import type { ChargePricing } from "@/lib/api/billing";
import { money, date } from "./presentation";
import s from "./central.module.css";

type Props = {
  label: string;
  trialEnd?: string | null;
  couponCode?: string;
  existingRecurring?: boolean;
  interval: "month" | "year";
  pricing?: ChargePricing;
  enabled: boolean;
  recurring: boolean;
  pix: boolean;
  canApplyCoupon: boolean;
  cardSelected: boolean;
  selectCard: () => void;
  accepted: boolean;
  accept: (value: boolean) => void;
  payCard: () => void;
  payPix: () => void;
  coupon: string;
  setCoupon: (value: string) => void;
  applyCoupon: () => void;
  couponMessage: string | null;
  quotePending: boolean;
  retry: () => void;
};

export default function PaymentOptions(p: Props) {
  const consent = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (p.cardSelected) consent.current?.focus();
  }, [p.cardSelected]);
  const period = p.interval === "year" ? "ano" : "mês";
  const price = p.pricing;
  const available = p.enabled && !p.quotePending && Boolean(price);
  return (
    <div className={s.paymentFlow}>
      <div className={s.paymentSummary}>
        <div>
          <strong>{p.label}</strong>
          <p>Período {p.interval === "year" ? "anual" : "mensal"} da assinatura</p>
        </div>
        <span>Pagamento confirmado somente após processamento.</span>
      </div>
      {p.trialEnd && (
        <p className={s.small}>
          Teste gratuito registrado até {date(p.trialEnd)}. Confira a data da primeira cobrança no
          Mercado Pago antes de autorizar a assinatura.
        </p>
      )}
      {p.canApplyCoupon && (
        <details className={s.paymentCoupon}>
          <summary>
            Tem um cupom de desconto? <ChevronDown size={15} aria-hidden="true" />
          </summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              p.applyCoupon();
            }}
          >
            <label htmlFor="central-payment-coupon">Código do cupom</label>
            <div className={s.couponFields}>
              <input
                id="central-payment-coupon"
                className={s.input}
                value={p.coupon}
                onChange={(event) => p.setCoupon(event.target.value)}
                autoComplete="off"
                maxLength={100}
                disabled={!p.enabled || p.quotePending}
              />
              <button
                className={s.secondary}
                type="submit"
                disabled={!p.enabled || p.quotePending || !p.coupon.trim()}
              >
                Aplicar cupom
              </button>
            </div>
            <p className={s.small}>
              As condições e a elegibilidade serão verificadas antes da aplicação. Digitar o código
              não concede descontos nem dias extras.
            </p>
          </form>
        </details>
      )}
      <div className={s.paymentOptions}>
        {p.recurring && (
          <section className={s.paymentOption} aria-label="Mercado Pago - assinatura automática">
            <CreditCard size={23} aria-hidden="true" />
            <h3>
              Mercado Pago <span>Assinatura automática</span>
            </h3>
            <p>
              Escolha como deseja pagar no Mercado Pago, com cartão de crédito ou outros meios
              disponíveis para sua assinatura.
            </p>
            <strong className={s.paymentPrice}>
              {price ? money(price.totalCents) : "Consultando valor"}
              <small> / {period}</small>
            </strong>
            {price?.firstPaymentDiscountApplied && (
              <p className={s.small}>
                Valor da primeira cobrança. Depois:{" "}
                {money(price.recurringAmountCents ?? price.baseAmountCents)}/{period}.
              </p>
            )}
            {price?.recurringDiscountApplied && (
              <p className={s.small}>Condição recorrente considerada neste valor.</p>
            )}
            <button
              className={s.button}
              type="button"
              disabled={!available}
              aria-expanded={p.cardSelected}
              aria-controls="central-card-consent"
              onClick={p.selectCard}
            >
              Ver formas de pagamento <ArrowRight size={15} aria-hidden="true" />
            </button>
          </section>
        )}
        {p.pix && (
          <section className={s.paymentOption} aria-label="PIX — pagamento avulso">
            <QrCode size={23} aria-hidden="true" />
            <h3>
              PIX <span>Pagamento avulso</span>
            </h3>
            <p>
              Pague diretamente pelo PIX, sem cobrança automática. Para renovar, basta realizar um
              novo pagamento.
            </p>
            <strong className={s.paymentPrice}>
              {price ? money(price.totalCents) : "Consultando valor"}
              <small> / {period}</small>
            </strong>
            <p className={s.small}>Este PIX paga um período da assinatura.</p>
            {p.existingRecurring && (
              <p className={s.small}>Este PIX não cancela a assinatura automática já existente.</p>
            )}
            {price?.firstPaymentDiscountApplied && (
              <p className={s.small}>
                Desconto somente nesta cobrança. Valor atual dos próximos períodos:{" "}
                {money(price.recurringAmountCents ?? price.baseAmountCents)}/{period}.
              </p>
            )}
            {price?.recurringDiscountApplied && (
              <p className={s.small}>Condição recorrente considerada neste valor.</p>
            )}
            <button className={s.button} type="button" disabled={!available} onClick={p.payPix}>
              Pagar com PIX <ArrowRight size={15} aria-hidden="true" />
            </button>
          </section>
        )}
      </div>
      {!price && (
        <p role="status" className={s.small}>
          O valor precisa ser confirmado pelo sistema antes de iniciar o pagamento.{" "}
          <button type="button" className={s.textButton} onClick={p.retry} disabled={!p.enabled}>
            Atualizar valores
          </button>
        </p>
      )}
      {p.couponCode && (
        <p className={s.small}>
          Cupom confirmado na assinatura: <strong>{p.couponCode}</strong>. Confira as condições nos
          valores acima e no histórico de Benefícios.
        </p>
      )}
      {p.couponMessage && (
        <p role="status" className={s.small}>
          {p.couponMessage}
        </p>
      )}
      {p.quotePending && (
        <p role="status" className={s.notice}>
          Cupom aplicado. Atualizando valores e opções de pagamento…{" "}
          <button className={s.textButton} type="button" onClick={p.retry}>
            Consultar novamente
          </button>
        </p>
      )}
      {p.cardSelected && p.recurring && (
        <section id="central-card-consent" className={s.paymentConsent}>
          <h3>Confirmar assinatura automática</h3>
          <p>
            Você vai continuar no Mercado Pago, onde poderá conferir o meio de pagamento, o valor,
            as datas e as condições finais antes de confirmar.
          </p>
          <label>
            <input
              ref={consent}
              type="checkbox"
              checked={p.accepted}
              onChange={(event) => p.accept(event.target.checked)}
              disabled={!available}
            />
            Autorizo as cobranças automáticas da assinatura conforme as condições apresentadas no
            checkout.
          </label>
          <button
            className={s.button}
            type="button"
            disabled={!available || !p.accepted}
            onClick={p.payCard}
          >
            Confirmar e ir ao Mercado Pago
          </button>
        </section>
      )}
      <p className={s.small}>
        A autorização da assinatura permite cobranças automáticas; não confirma um pagamento. O
        valor final do PIX será mostrado na cobrança gerada.
      </p>
    </div>
  );
}
