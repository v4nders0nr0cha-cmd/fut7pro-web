"use client";
import { useCentral } from "./CentralProvider";
import useCentralResource from "./useCentralResource";
import useCursor from "./useCursor";
import {
  historyRequest,
  type BenefitRecord,
  type BenefitSummary,
  type HistoryEvent,
  type Page,
} from "@/lib/api/subscription-central";
import { Empty, HistoryCoverage, Notice, Pill, Restricted, Skeleton } from "./Common";
import { date, money } from "./presentation";
import s from "./central.module.css";

export default function BenefitsPanel() {
  const c = useCentral(),
    id = c.subscription?.id;
  const permitted = c.capabilities.data?.capabilities.canViewHistory;
  const cursor = useCursor(`${c.scope}:benefits:${id}`);
  const couponCursor = useCursor(`${c.scope}:coupons:${id}`);
  const query = useCentralResource(
    id && permitted ? `${c.scope}:benefits:${id}:${cursor.cursor}` : null,
    (signal) =>
      historyRequest<Page<BenefitRecord> & BenefitSummary>(
        id!,
        "benefits",
        { limit: 10, cursor: cursor.cursor },
        signal
      ),
    c.revision
  );
  const coupons = useCentralResource(
    id && permitted ? `${c.scope}:coupons:${id}:${couponCursor.cursor}` : null,
    (signal) =>
      historyRequest<Page<HistoryEvent> & BenefitSummary>(
        id!,
        "benefits",
        { kind: "coupons", limit: 10, cursor: couponCursor.cursor },
        signal
      ),
    c.revision
  );
  if (c.capabilities.loading || (c.subscriptionLoading && !c.subscription)) return <Skeleton />;
  if (c.capabilities.error)
    return (
      <Notice error retry={c.capabilities.retry}>
        {c.capabilities.error}
      </Notice>
    );
  if (!permitted) return <Restricted />;
  if (!id) return <Empty>Não há assinatura registrada para consultar benefícios.</Empty>;
  if (query.loading && !query.data) return <Skeleton label="Consultando benefícios do grupo..." />;
  if (query.error && !query.data)
    return (
      <Notice error retry={query.retry}>
        {query.error}
      </Notice>
    );
  const data = query.data;
  if (!data) return null;
  const trial = data.initialTrial,
    coupon = data.currentCouponTerms;
  return (
    <>
      <div className={s.sectionTitle}>
        <h2>Benefícios do grupo</h2>
      </div>
      <p className={s.muted}>
        Confira as concessões registradas e as condições comerciais da assinatura. Dias antigos não
        representam um saldo disponível.
      </p>
      {query.error && (
        <Notice error retry={query.retry}>
          Exibindo a última consulta deste grupo. Não foi possível atualizar o histórico.
        </Notice>
      )}
      <div className={s.grid}>
        <section className={s.card}>
          <h3>Teste gratuito inicial</h3>
          <strong className={s.value}>
            {trial.originalDays === null
              ? "Duração original não registrada"
              : trial.originalDays === 0
                ? "Sem dias de teste"
                : `${trial.originalDays} dias registrados`}
          </strong>
          {trial.evidence === "UNAVAILABLE" ? (
            <p className={s.muted}>
              A duração original do teste não foi registrada. Não é possível informar quantos dias
              foram concedidos sem essa confirmação.
            </p>
          ) : (
            <dl className={s.details}>
              <div>
                <dt>Início do teste</dt>
                <dd>{date(trial.start)}</dd>
              </div>
              <div>
                <dt>Término originalmente previsto</dt>
                <dd>{date(trial.originalEnd)}</dd>
              </div>
            </dl>
          )}
        </section>
        <section className={s.card}>
          <h3>Cupom e condições comerciais</h3>
          {coupon ? (
            <>
              <Pill>{coupon.code}</Pill>
              <p className={`${s.muted} mt-4`}>
                Cupom aplicado ao contrato. A aplicação não comprova, por si só, dias recebidos ou
                desconto utilizado.
              </p>
              <dl className={s.details}>
                {coupon.offeredExtraDays !== null && (
                  <div>
                    <dt>Dias adicionais oferecidos</dt>
                    <dd>{coupon.offeredExtraDays}</dd>
                  </div>
                )}
                <div>
                  <dt>Condição do desconto</dt>
                  <dd>{coupon.appliesToRecurring ? "Recorrente" : "Conforme cobrança elegível"}</dd>
                </div>
                {coupon.discountPct !== null && (
                  <div>
                    <dt>Percentual registrado</dt>
                    <dd>{coupon.discountPct.toLocaleString("pt-BR")}%</dd>
                  </div>
                )}
                {coupon.appliesToRecurring && coupon.recurringAmountCents !== null && (
                  <div>
                    <dt>Valor recorrente registrado</dt>
                    <dd>{money(coupon.recurringAmountCents)}</dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <p className={s.muted}>Nenhum cupom está aplicado à assinatura atual.</p>
          )}
        </section>
      </div>
      <div className={s.sectionTitle}>
        <h2>Dias concedidos e compensações</h2>
      </div>
      <section className={s.card}>
        {!data.items.length ? (
          <Empty>Nenhuma concessão de dias foi registrada neste histórico.</Empty>
        ) : (
          <ol className={s.list}>
            {data.items.map((item) => (
              <li className={s.row} key={item.id}>
                <span className={s.dot} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h3>
                    {item.source === "GUIDE_REWARD"
                      ? "Recompensa do Guia Interativo"
                      : item.customerReason}
                  </h3>
                  <p className={s.muted}>
                    {date(item.appliedAt)} · {item.days} dias concedidos
                  </p>
                  <dl className={s.details}>
                    <div>
                      <dt>Prazo anterior</dt>
                      <dd>{date(item.previousAccessUntil)}</dd>
                    </div>
                    <div>
                      <dt>Novo prazo registrado</dt>
                      <dd>{date(item.newAccessUntil)}</dd>
                    </div>
                  </dl>
                  {item.grantStatus === "REVERTED" && (
                    <p className={s.small}>
                      Concessão revertida em {date(item.revertedAt)}. O registro original foi
                      preservado.
                    </p>
                  )}
                </div>
                <Pill
                  tone={
                    item.validity === "REVERTED"
                      ? "danger"
                      : item.validity === "EXPIRED"
                        ? "neutral"
                        : item.validity === "UNAVAILABLE"
                          ? "warn"
                          : "good"
                  }
                >
                  {
                    {
                      APPLIED: "Concedido",
                      EXPIRED: "Prazo encerrado",
                      REVERTED: "Revertido",
                      UNAVAILABLE: "Prazo não informado",
                    }[item.validity]
                  }
                </Pill>
              </li>
            ))}
          </ol>
        )}
        <HistoryCoverage incomplete={data.coverage?.earlierEventsUnavailable} />
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
            disabled={query.loading || !data.page.hasMore}
            onClick={() => cursor.next(data.page.nextCursor)}
          >
            Próxima
          </button>
        </div>
      </section>
      <div className={s.sectionTitle}>
        <h2>Aplicações de cupons</h2>
      </div>
      {coupons.loading && !coupons.data ? (
        <Skeleton label="Consultando aplicações de cupons..." />
      ) : coupons.error ? (
        <Notice error retry={coupons.retry}>
          {coupons.error}
        </Notice>
      ) : (
        <section className={s.card}>
          {!coupons.data?.items.length ? (
            <Empty>
              {coupon ? (
                <>
                  O cupom <strong>{coupon.code}</strong> consta no contrato.{" "}
                  {coupons.data?.coverage?.recordedFrom
                    ? `Este histórico começou em ${date(coupons.data.coverage.recordedFrom)} e pode não incluir aplicações anteriores.`
                    : "As aplicações anteriores podem não estar disponíveis neste histórico."}{" "}
                  A ausência de um evento não comprova que o benefício deixou de funcionar.
                </>
              ) : (
                "Ainda não há aplicações de cupom registradas neste histórico."
              )}
            </Empty>
          ) : (
            <ol className={s.list}>
              {coupons.data.items.map((event) => (
                <li className={s.row} key={event.id}>
                  <div>
                    <h3>
                      Cupom{" "}
                      {typeof event.facts.after?.couponCode === "string"
                        ? event.facts.after.couponCode
                        : "registrado"}
                    </h3>
                    <p className={s.muted}>{date(event.occurredAt)}</p>
                    <p className={s.small}>
                      {typeof event.facts.grantedDays === "number"
                        ? `${event.facts.grantedDays} dias adicionais comprovados neste registro.`
                        : "Este registro não comprova prorrogação de dias."}{" "}
                      O uso de desconto é confirmado nas cobranças pagas.
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {coupons.data?.page.hasMore && (
            <button
              className={s.secondary}
              onClick={() => couponCursor.next(coupons.data!.page.nextCursor)}
              disabled={coupons.loading}
            >
              Próximas aplicações
            </button>
          )}
          {couponCursor.number > 1 && (
            <button className={s.linkButton} onClick={couponCursor.previous}>
              Aplicações anteriores
            </button>
          )}
        </section>
      )}
    </>
  );
}
