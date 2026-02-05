"use client";

import { useRouter } from "next/navigation";
import { usePublicEnquetes } from "@/hooks/usePublicEnquetes";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { PollPublicItem, PollStatus } from "@/types/poll";

type EnquetesListProps = {
  enabled?: boolean;
  compact?: boolean;
};

const statusLabels: Record<PollStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  ACTIVE: "Ativa",
  CLOSED: "Encerrada",
  ARCHIVED: "Arquivada",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

const resolveTimeLabel = (poll: PollPublicItem) => {
  if (poll.status === "SCHEDULED" && poll.startAt) {
    return `Inicia em ${formatDateTime(poll.startAt)}`;
  }
  if (poll.status === "ACTIVE" && poll.endAt) {
    return `Encerra em ${formatDateTime(poll.endAt)}`;
  }
  if (poll.status === "CLOSED" && poll.endAt) {
    return `Encerrada em ${formatDateTime(poll.endAt)}`;
  }
  return null;
};

export default function EnquetesList({ enabled = true, compact = false }: EnquetesListProps) {
  const router = useRouter();
  const { publicHref } = usePublicLinks();
  const { enquetes, isLoading, isError, error } = usePublicEnquetes({ enabled });

  if (isLoading) {
    return <div className="text-center text-gray-400">Carregando enquetes...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-400">
        Falha ao carregar enquetes.
        {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
      </div>
    );
  }

  if (enquetes.length === 0) {
    return <div className="text-center text-gray-400">Nenhuma enquete disponível no momento.</div>;
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {enquetes.map((poll) => {
        const timeLabel = resolveTimeLabel(poll);
        const actionLabel = poll.status === "ACTIVE" && poll.canVote ? "Votar" : "Ver detalhes";
        return (
          <div
            key={poll.id}
            className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-yellow-200">{poll.title}</div>
                {poll.description && (
                  <div className="text-gray-200 text-sm">{poll.description}</div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Status: <span className="text-yellow-200">{statusLabels[poll.status]}</span>
                  {timeLabel ? ` • ${timeLabel}` : ""}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                {poll.hasVoted && (
                  <span className="text-xs bg-emerald-900/50 text-emerald-200 px-2 py-1 rounded">
                    Você já votou
                  </span>
                )}
                {poll.resultsVisible ? (
                  <span className="text-xs text-gray-300">
                    Total de votos: <span className="text-yellow-200">{poll.totalVotes ?? 0}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Resultados após encerrar</span>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push(publicHref(`/comunicacao/enquetes/${poll.id}`))}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-3 py-1 rounded text-sm"
              >
                {actionLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
