"use client";

import { useState, useMemo } from "react";
import Head from "next/head";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaUserClock,
  FaRedo,
} from "react-icons/fa";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import type { AthleteRequest, AthleteRequestStatus } from "@/types/solicitacao";

type FilterOption = AthleteRequestStatus | "TODAS";

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "Pendentes", value: "PENDENTE" },
  { label: "Aprovadas", value: "APROVADA" },
  { label: "Rejeitadas", value: "REJEITADA" },
  { label: "Todas", value: "TODAS" },
];

const STATUS_CONFIG: Record<
  AthleteRequestStatus,
  { label: string; badgeClass: string; icon: JSX.Element }
> = {
  PENDENTE: {
    label: "Pendente",
    badgeClass: "bg-yellow-800 text-yellow-200 border-yellow-500/40",
    icon: <FaUserClock className="text-yellow-300" />,
  },
  APROVADA: {
    label: "Aprovada",
    badgeClass: "bg-green-800 text-green-200 border-green-500/40",
    icon: <FaCheckCircle className="text-green-300" />,
  },
  REJEITADA: {
    label: "Rejeitada",
    badgeClass: "bg-red-800 text-red-200 border-red-500/40",
    icon: <FaTimesCircle className="text-red-300" />,
  },
};

function formatDate(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateIso;
  }
}

export default function SolicitacoesAdminPage() {
  const [statusFilter, setStatusFilter] = useState<FilterOption>("PENDENTE");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const { solicitacoes, isLoading, isError, error, approve, reject, exportCsv, resetState } =
    useSolicitacoes(statusFilter === "TODAS" ? undefined : statusFilter);

  const hasPendingActions = useMemo(() => statusFilter === "PENDENTE", [statusFilter]);

  const handleApprove = async (request: AthleteRequest) => {
    setFeedback(null);
    try {
      await approve(request.id);
      setFeedback({ type: "success", message: `${request.name} aprovado com sucesso.` });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : (error ?? "Não foi possível aprovar a solicitação.");
      setFeedback({ type: "error", message });
    }
  };

  const handleReject = async (request: AthleteRequest) => {
    setFeedback(null);
    try {
      await reject(request.id);
      setFeedback({ type: "success", message: `${request.name} rejeitado.` });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : (error ?? "Não foi possível rejeitar a solicitação.");
      setFeedback({ type: "error", message });
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportCsv(statusFilter === "TODAS" ? undefined : (statusFilter as any));
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileSuffix = statusFilter === "TODAS" ? "todas" : statusFilter.toLowerCase();
      link.href = url;
      link.setAttribute("download", `solicitacoes-${fileSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({ type: "success", message: "Exportação iniciada com sucesso." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao exportar CSV.";
      setFeedback({ type: "error", message });
    }
  };

  return (
    <>
      <Head>
        <title>Solicitações de Atletas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie as solicitações de novos atletas. Aprove ou rejeite pedidos e mantenha o fluxo do seu racha organizado."
        />
      </Head>

      <div className="pt-20 pb-24 md:pt-8 md:pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-yellow-400 flex items-center gap-3">
              <FaUserClock aria-hidden />
              Solicitações de Atletas
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl">
              Aprove pedidos de novos atletas, mantenha um registro completo e agilize a integração.
              Todos os registros vêm diretamente do formulário público de cadastro.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                resetState();
                setFeedback(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-600 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition"
            >
              <FaRedo aria-hidden />
              Atualizar
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold transition"
            >
              <FaDownload aria-hidden />
              Exportar CSV
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 mb-6">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFeedback(null);
                setStatusFilter(option.value);
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                statusFilter === option.value
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-zinc-900 text-yellow-300 border-yellow-500/40 hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-md px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-green-900/40 border border-green-500/40 text-green-200"
                : "bg-red-900/40 border border-red-500/40 text-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <FaCheckCircle aria-hidden />
            ) : (
              <FaTimesCircle aria-hidden />
            )}
            {feedback.message}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-yellow-300 bg-yellow-900/20 border border-yellow-500/30 px-4 py-3 rounded-md">
            <FaClock className="animate-spin" aria-hidden />
            Carregando solicitações...
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col gap-3 bg-red-900/30 border border-red-500/30 px-4 py-4 rounded-md text-red-200">
            <span>Não foi possível carregar as solicitações.</span>
            {error && <span className="text-sm opacity-75">Detalhes: {error}</span>}
          </div>
        )}

        {!isLoading && !isError && solicitacoes.length === 0 && (
          <div className="bg-zinc-900/60 border border-zinc-700/60 px-6 py-8 rounded-xl text-center text-zinc-300">
            Nenhuma solicitação encontrada para o filtro selecionado.
          </div>
        )}

        <div className="grid gap-4">
          {solicitacoes.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status];
            return (
              <article
                key={item.id}
                className="bg-zinc-900/80 border border-zinc-700/60 rounded-2xl p-6 shadow-lg flex flex-col gap-4"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{item.name}</h2>
                    <p className="text-sm text-zinc-300">{item.email}</p>
                    {item.nickname && (
                      <p className="text-sm text-zinc-400">
                        Apelido preferencial: <span className="font-medium">{item.nickname}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${statusConfig.badgeClass}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300">
                  <div>
                    <span className="text-zinc-400 block text-xs uppercase tracking-wide mb-1">
                      Posição
                    </span>
                    <span className="font-semibold">{item.position}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-xs uppercase tracking-wide mb-1">
                      Recebida em
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.approvedAt && (
                    <div>
                      <span className="text-zinc-400 block text-xs uppercase tracking-wide mb-1">
                        Aprovada em
                      </span>
                      <span>{formatDate(item.approvedAt)}</span>
                    </div>
                  )}
                  {item.rejectedAt && (
                    <div>
                      <span className="text-zinc-400 block text-xs uppercase tracking-wide mb-1">
                        Rejeitada em
                      </span>
                      <span>{formatDate(item.rejectedAt)}</span>
                    </div>
                  )}
                </div>

                {item.message && (
                  <div className="bg-zinc-950/70 border border-zinc-700/50 rounded-lg p-4 text-sm text-zinc-200">
                    <span className="block text-xs uppercase tracking-wide text-zinc-400 mb-2">
                      Mensagem do atleta
                    </span>
                    {item.message}
                  </div>
                )}

                {hasPendingActions && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold text-sm transition"
                    >
                      <FaCheckCircle aria-hidden />
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold text-sm transition"
                    >
                      <FaTimesCircle aria-hidden />
                      Rejeitar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
