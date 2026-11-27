"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ReceiptText } from "lucide-react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import { historyRequest, type InvoiceRecord, type Page } from "@/lib/api/subscription-central";
import { useCentral } from "./CentralProvider";
import useCentralResource from "./useCentralResource";
import useCursor from "./useCursor";
import { date, dateFilter, historicalMoney, methodLabel, statusLabel } from "./presentation";
import { Empty, Notice, Pill, Restricted, Skeleton } from "./Common";
import s from "./central.module.css";

const invoiceRef = (id: string) => id.slice(-8).toUpperCase();
function InvoiceStatus({ invoice }: { invoice: InvoiceRecord }) {
  const confirmed = Boolean(invoice.paymentConfirmedAt);
  const refunded =
    typeof invoice.refundedAmountCents === "number" && invoice.refundedAmountCents > 0;
  const full =
    refunded &&
    invoice.paidAmountCents !== null &&
    invoice.refundedAmountCents === invoice.paidAmountCents;
  return (
    <Pill
      tone={
        invoice.status === "charged_back"
          ? "danger"
          : refunded
            ? "warn"
            : confirmed
              ? "good"
              : ["pending", "in_process", "overdue"].includes(invoice.status)
                ? "warn"
                : "neutral"
      }
    >
      {refunded
        ? full
          ? "Devolução total"
          : "Devolução parcial"
        : !confirmed && ["paid", "approved", "accredited"].includes(invoice.status)
          ? "Pagamento registrado"
          : statusLabel(invoice.status)}
    </Pill>
  );
}
function InvoiceDetails({ invoiceId, close }: { invoiceId: string | null; close: () => void }) {
  const c = useCentral(),
    subId = c.subscription?.id;
  const permitted = c.capabilities.data?.capabilities.canViewHistory === true;
  const query = useCentralResource(
    invoiceId && subId && permitted ? `${c.scope}:invoice:${subId}:${invoiceId}` : null,
    (signal) =>
      historyRequest<InvoiceRecord>(
        subId!,
        `invoices/${encodeURIComponent(invoiceId!)}`,
        {},
        signal
      ),
    c.revision
  );
  const invoice = query.data;
  return (
    <Fut7DialogBase
      open={Boolean(invoiceId && permitted)}
      title="Detalhes da cobrança"
      eyebrow="Pagamentos Fut7Pro"
      onClose={close}
      size="lg"
    >
      <div className={s.central} style={{ padding: 0 }}>
        {query.loading && !invoice ? (
          <Skeleton label="Consultando a cobrança..." />
        ) : query.error ? (
          <Notice error retry={query.retry}>
            {query.error}
          </Notice>
        ) : invoice ? (
          <>
            <div className={s.sectionTitle}>
              <strong>Cobrança {invoiceRef(invoice.id)}</strong>
              <InvoiceStatus invoice={invoice} />
            </div>
            <dl className={s.details}>
              <div>
                <dt>Valor cobrado</dt>
                <dd>{historicalMoney(invoice.chargedAmountCents, invoice.currency)}</dd>
              </div>
              <div>
                <dt>Pagamento bruto confirmado</dt>
                <dd>{historicalMoney(invoice.paidAmountCents, invoice.currency)}</dd>
              </div>
              <div>
                <dt>Desconto confirmado nesta cobrança</dt>
                <dd>{historicalMoney(invoice.confirmedDiscountAmountCents, invoice.currency)}</dd>
              </div>
              <div>
                <dt>Valor devolvido</dt>
                <dd>{historicalMoney(invoice.refundedAmountCents, invoice.currency)}</dd>
              </div>
              <div>
                <dt>Forma de pagamento</dt>
                <dd>{methodLabel(invoice.paymentMethod)}</dd>
              </div>
              <div>
                <dt>Confirmação do pagamento</dt>
                <dd>{date(invoice.paymentConfirmedAt)}</dd>
              </div>
              <div>
                <dt>Registro da cobrança</dt>
                <dd>{date(invoice.createdAt)}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>
                  {invoice.type === "UPFRONT" ? "Cobrança inicial" : "Cobrança da assinatura"}
                </dd>
              </div>
              <div>
                <dt>Início do período de referência</dt>
                <dd>{date(invoice.periodStart)}</dd>
              </div>
              <div>
                <dt>Fim do período de referência</dt>
                <dd>{date(invoice.periodEnd)}</dd>
              </div>
            </dl>
            {invoice.refundedAmountCents !== null && invoice.refundedAmountCents > 0 && (
              <Notice>
                O valor devolvido é informado separadamente. O pagamento original permanece
                registrado no histórico.
              </Notice>
            )}
            <h3>Condições registradas na cobrança</h3>
            {invoice.historicalTermsAvailable && invoice.commercialSnapshot ? (
              <dl className={s.details}>
                <div>
                  <dt>Plano de referência</dt>
                  <dd>
                    {invoice.commercialSnapshot.planKey
                      ? c.plans.find((plan) => plan.key === invoice.commercialSnapshot?.planKey)
                          ?.label || "Plano registrado no histórico"
                      : "Não registrado"}
                  </dd>
                </div>
                <div>
                  <dt>Periodicidade registrada</dt>
                  <dd>
                    {invoice.commercialSnapshot.interval === "year"
                      ? "Anual"
                      : invoice.commercialSnapshot.interval === "month"
                        ? "Mensal"
                        : "Não registrada"}
                  </dd>
                </div>
                <div>
                  <dt>Valor base do orçamento</dt>
                  <dd>
                    {historicalMoney(invoice.commercialSnapshot.baseAmountCents, invoice.currency)}
                  </dd>
                </div>
                <div>
                  <dt>Desconto do orçamento</dt>
                  <dd>
                    {historicalMoney(
                      invoice.commercialSnapshot.discountAmountCents,
                      invoice.currency
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className={s.muted}>
                As condições comerciais originais desta cobrança não estão disponíveis. Os valores
                não foram recalculados pelo plano atual.
              </p>
            )}
            <p className={s.small}>
              Valores não registrados permanecem sem informação. O desconto do orçamento só
              representa uso confirmado quando identificado como desconto confirmado nesta cobrança.
            </p>
            <div className={s.notice}>
              Nenhum comprovante foi disponibilizado para esta cobrança. Links de pagamento não são
              comprovantes.
            </div>
          </>
        ) : null}
      </div>
    </Fut7DialogBase>
  );
}

export default function PaymentsPanel() {
  const c = useCentral(),
    params = useSearchParams(),
    router = useRouter();
  const id = c.subscription?.id,
    permitted = c.capabilities.data?.capabilities.canViewHistory;
  const status = params.get("status") || "",
    from = params.get("de") || "",
    to = params.get("ate") || "";
  const [draft, setDraft] = useState({ key: `${status}|${from}|${to}`, status, from, to });
  const filterKey = `${status}|${from}|${to}`;
  const filters = draft.key === filterKey ? draft : { key: filterKey, status, from, to };
  const cursor = useCursor(`${c.scope}:invoices:${id}:${filterKey}`);
  const query = useCentralResource(
    id && permitted ? `${c.scope}:invoices:${id}:${filterKey}:${cursor.cursor}` : null,
    (signal) =>
      historyRequest<Page<InvoiceRecord>>(
        id!,
        "invoices",
        {
          limit: 10,
          cursor: cursor.cursor,
          status,
          from: dateFilter(from),
          to: dateFilter(to, true),
        },
        signal
      ),
    c.revision
  );
  const invoiceId = params.get("cobranca");
  const setInvoice = (value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("cobranca", value);
    else next.delete("cobranca");
    router.replace(`/admin/assinatura/pagamentos${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  if (c.capabilities.loading || (c.subscriptionLoading && !c.subscription)) return <Skeleton />;
  if (c.capabilities.error)
    return (
      <Notice error retry={c.capabilities.retry}>
        {c.capabilities.error}
      </Notice>
    );
  if (!permitted) return <Restricted />;
  if (!id) return <Empty>Não há assinatura registrada para consultar cobranças.</Empty>;
  const updateFilter = (key: "status" | "from" | "to", value: string) =>
    setDraft({ ...filters, [key]: value });
  const items = query.data?.items;
  return (
    <>
      <div className={s.sectionTitle}>
        <h2>Pagamentos e cobranças</h2>
      </div>
      <p className={s.muted}>
        Consulte valores registrados, confirmações e devoluções da assinatura. O acesso ao sistema é
        apresentado separadamente na visão geral.
      </p>
      <form
        className={s.filters}
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams();
          if (filters.status) next.set("status", filters.status);
          if (filters.from) next.set("de", filters.from);
          if (filters.to) next.set("ate", filters.to);
          router.replace(`/admin/assinatura/pagamentos${next.size ? `?${next}` : ""}`, {
            scroll: false,
          });
        }}
      >
        <div className={s.field}>
          <label htmlFor="invoice-status">Situação</label>
          <select
            id="invoice-status"
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
          >
            <option value="">Todas as situações</option>
            <option value="confirmed">Pagamentos confirmados</option>
            <option value="open">Aguardando pagamento</option>
            <option value="refunds">Devoluções registradas</option>
            <option value="cancellations">Cobranças canceladas</option>
            <option value="overdue">Cobranças vencidas</option>
          </select>
        </div>
        <div className={s.field}>
          <label htmlFor="invoice-from">A partir de</label>
          <input
            id="invoice-from"
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
          />
        </div>
        <div className={s.field}>
          <label htmlFor="invoice-to">Até</label>
          <input
            id="invoice-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => updateFilter("to", event.target.value)}
          />
        </div>
        <button type="submit" className={s.secondary}>
          Aplicar filtros
        </button>
      </form>
      {query.error && (
        <Notice error retry={query.retry}>
          {items
            ? "Exibindo a última consulta deste grupo. Não foi possível atualizar as cobranças."
            : query.error}
        </Notice>
      )}
      {query.error && !items ? null : query.loading && !items ? (
        <Skeleton label="Consultando cobranças..." />
      ) : !items?.length ? (
        <Empty>
          <ReceiptText size={24} className="mx-auto mb-3" aria-hidden="true" />
          Nenhuma cobrança encontrada para esta consulta.
        </Empty>
      ) : (
        <section className={s.card} aria-label="Histórico de cobranças">
          <div className={s.desktopOnly}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col">Cobrança</th>
                  <th scope="col">Registro</th>
                  <th scope="col">Valor cobrado</th>
                  <th scope="col">Situação</th>
                  <th scope="col">
                    <span className="sr-only">Detalhamento</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoiceRef(invoice.id)}</strong>
                      <div className={s.small}>{methodLabel(invoice.paymentMethod)}</div>
                    </td>
                    <td>{date(invoice.createdAt)}</td>
                    <td className={s.money}>
                      {historicalMoney(invoice.chargedAmountCents, invoice.currency)}
                    </td>
                    <td>
                      <InvoiceStatus invoice={invoice} />
                    </td>
                    <td>
                      <button
                        className={s.linkButton}
                        aria-label={`Detalhar cobrança ${invoiceRef(invoice.id)}`}
                        onClick={() => setInvoice(invoice.id)}
                      >
                        Detalhes <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className={`${s.list} ${s.mobileOnly}`}>
            {items.map((invoice) => (
              <li key={invoice.id} className={s.row}>
                <div className="w-full min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3>Cobrança {invoiceRef(invoice.id)}</h3>
                    <InvoiceStatus invoice={invoice} />
                  </div>
                  <p className={s.muted}>
                    {date(invoice.createdAt)} · {methodLabel(invoice.paymentMethod)}
                  </p>
                  <p className={`${s.value} !text-xl`}>
                    {historicalMoney(invoice.chargedAmountCents, invoice.currency)}
                  </p>
                  <button
                    className={s.linkButton}
                    aria-label={`Detalhar cobrança ${invoiceRef(invoice.id)}`}
                    onClick={() => setInvoice(invoice.id)}
                  >
                    Ver detalhes da cobrança <ChevronRight size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className={s.pagination}>
            <button
              className={s.secondary}
              disabled={query.loading || cursor.number === 1}
              onClick={cursor.previous}
            >
              Anterior
            </button>
            <span className={s.small}>Página {cursor.number}</span>
            <button
              className={s.secondary}
              disabled={query.loading || !query.data?.page.hasMore}
              onClick={() => cursor.next(query.data!.page.nextCursor)}
            >
              Próxima
            </button>
          </div>
        </section>
      )}
      <InvoiceDetails
        key={`${c.scope}:${invoiceId}`}
        invoiceId={invoiceId}
        close={() => setInvoice(null)}
      />
    </>
  );
}
