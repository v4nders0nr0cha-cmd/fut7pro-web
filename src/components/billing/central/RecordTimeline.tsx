"use client";
import Link from "next/link";
import { useCentral } from "./CentralProvider";
import useCentralResource from "./useCentralResource";
import useCursor from "./useCursor";
import { historyRequest, type HistoryEvent, type Page } from "@/lib/api/subscription-central";
import { Empty, HistoryCoverage, Notice, Skeleton } from "./Common";
import { date, eventLabel } from "./presentation";
import s from "./central.module.css";
export default function RecordTimeline() {
  const c = useCentral(),
    id = c.subscription?.id;
  const cursor = useCursor(`${c.scope}:events:${id}`);
  const query = useCentralResource(
    c.capabilities.data?.capabilities.canViewHistory && id
      ? `${c.scope}:events:${id}:${cursor.cursor}`
      : null,
    (signal) =>
      historyRequest<Page<HistoryEvent>>(
        id!,
        "events",
        { limit: 5, cursor: cursor.cursor },
        signal
      ),
    c.revision
  );
  if (query.loading && !query.data)
    return <Skeleton label="Consultando histórico da assinatura..." />;
  if (query.error && !query.data)
    return (
      <Notice error retry={query.retry}>
        {query.error}
      </Notice>
    );
  if (!query.data) return null;
  return (
    <section className={s.card} aria-label="Histórico da assinatura">
      <h3>Acontecimentos da assinatura</h3>
      {!query.data.items.length ? (
        <Empty>Ainda não há acontecimentos registrados neste histórico.</Empty>
      ) : (
        <ol className={s.list}>
          {query.data.items.map((event) => (
            <li className={s.row} key={event.id}>
              <span className={s.dot} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3>{eventLabel(event.eventType)}</h3>
                <p className={s.muted}>{date(event.occurredAt)}</p>
                {event.source.type === "Invoice" && (
                  <Link
                    className={s.linkButton}
                    href={`/admin/assinatura/pagamentos?cobranca=${encodeURIComponent(event.source.id)}`}
                  >
                    Consultar cobrança
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      <HistoryCoverage incomplete={query.data.coverage?.earlierEventsUnavailable} />
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
          disabled={query.loading || !query.data.page.hasMore}
          onClick={() => cursor.next(query.data!.page.nextCursor)}
        >
          Próxima
        </button>
      </div>
    </section>
  );
}
