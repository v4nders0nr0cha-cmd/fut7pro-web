"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCheckCircle, FaPoll } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { usePublicEnquete } from "@/hooks/usePublicEnquete";
import type { PollOption, PollStatus } from "@/types/poll";

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

const computePercent = (votes: number, total: number) => {
  if (!total) return 0;
  return Math.round((votes / total) * 100);
};

export default function EnquetePage() {
  const params = useParams();
  const router = useRouter();
  const enqueteId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref, publicSlug } = usePublicLinks();
  const { enquete, isLoading, isError, error, mutate } = usePublicEnquete(enqueteId, {
    enabled: isAuthenticated,
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(() => {
    if (!enquete) return;
    setSelectedOptions(enquete.myVotes ?? []);
  }, [enquete]);

  useEffect(() => {
    if (!enquete || enquete.status !== "ACTIVE") return;
    const interval = setInterval(() => {
      mutate();
    }, 4000);
    return () => clearInterval(interval);
  }, [enquete, mutate]);

  const totalVotes = enquete?.totalVotes ?? 0;
  const resultsVisible = Boolean(enquete?.resultsVisible);

  const handleSelect = (optionId: string) => {
    if (!enquete) return;
    setVoteError(null);
    if (enquete.allowMultiple) {
      setSelectedOptions((prev) => {
        const exists = prev.includes(optionId);
        if (exists) return prev.filter((id) => id !== optionId);
        if (enquete.maxChoices && prev.length >= enquete.maxChoices) {
          setVoteError(`Selecione no máximo ${enquete.maxChoices} opções.`);
          return prev;
        }
        return [...prev, optionId];
      });
      return;
    }
    setSelectedOptions([optionId]);
  };

  const handleVote = async () => {
    if (!enquete || !publicSlug || !enqueteId) return;
    if (!selectedOptions.length) {
      setVoteError("Selecione pelo menos uma opção.");
      return;
    }

    setVoteLoading(true);
    setVoteError(null);

    const previousVotes = enquete.myVotes ?? [];
    const toAdd = selectedOptions.filter((id) => !previousVotes.includes(id));
    const toRemove = previousVotes.filter((id) => !selectedOptions.includes(id));

    await mutate((current) => {
      if (!current) return current;
      const nextOptions = current.options.map((option) => {
        if (!resultsVisible || option.voteCount === null || option.voteCount === undefined) {
          return option;
        }
        if (toAdd.includes(option.id)) {
          return { ...option, voteCount: option.voteCount + 1 };
        }
        if (toRemove.includes(option.id)) {
          return { ...option, voteCount: Math.max(0, option.voteCount - 1) };
        }
        return option;
      });
      const nextTotal =
        current.totalVotes !== null && current.totalVotes !== undefined
          ? current.totalVotes + toAdd.length - toRemove.length
          : current.totalVotes;
      return {
        ...current,
        myVotes: selectedOptions,
        hasVoted: true,
        canVote: current.allowChangeVote ? true : false,
        totalVotes: nextTotal,
        options: nextOptions,
      };
    }, false);

    try {
      const response = await fetch(`/api/public/${publicSlug}/enquetes/${enqueteId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selectedOptions }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || body?.message || "Falha ao registrar voto");
      }
      await mutate();
    } catch (err) {
      await mutate();
      setVoteError(err instanceof Error ? err.message : "Falha ao registrar voto.");
    } finally {
      setVoteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Enquete</h1>
          <p className="text-gray-300 mb-4">Entre para acessar esta enquete.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/entrar"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (isError || !enquete) {
    return (
      <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-red-400">
          Falha ao carregar a enquete.
          {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
        </div>
      </main>
    );
  }

  const statusLabel = statusLabels[enquete.status];
  const periodLabel = enquete.startAt
    ? `${formatDateTime(enquete.startAt)} até ${enquete.endAt ? formatDateTime(enquete.endAt) : "sem fim"}`
    : "Início imediato";
  const canVote = enquete.status === "ACTIVE" && enquete.canVote;
  const voteButtonLabel = enquete.hasVoted
    ? enquete.allowChangeVote
      ? "Atualizar voto"
      : "Voto registrado"
    : "Enviar voto";

  return (
    <>
      <Head>
        <title>{`Enquete | ${enquete.title}`}</title>
        <meta
          name="description"
          content={
            enquete.description
              ? enquete.description
              : `Participe da enquete ${enquete.title} no Fut7Pro.`
          }
        />
      </Head>
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        <h1 className="text-2xl font-bold text-brand mb-4 flex items-center gap-2">
          <FaPoll /> {enquete.title}
        </h1>
        {enquete.description && <div className="mb-4 text-gray-200">{enquete.description}</div>}
        <div className="text-xs text-gray-400 mb-4">
          Status: <span className="text-yellow-200">{statusLabel}</span> • {periodLabel}
        </div>

        {enquete.status === "SCHEDULED" && (
          <div className="mb-4 text-sm text-yellow-200">
            Enquete agendada. O voto será liberado na data de início.
          </div>
        )}

        {enquete.status === "CLOSED" && (
          <div className="mb-4 text-sm text-red-200">Enquete encerrada. Votação bloqueada.</div>
        )}

        <div className="space-y-3">
          {enquete.options.map((option: PollOption) => {
            const isSelected = selectedOptions.includes(option.id);
            const votes = option.voteCount ?? 0;
            const percent = resultsVisible ? computePercent(votes, totalVotes) : 0;
            return (
              <label
                key={option.id}
                className={`flex flex-col gap-2 rounded-lg border px-4 py-3 ${
                  isSelected ? "border-yellow-400 bg-yellow-400/10" : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type={enquete.allowMultiple ? "checkbox" : "radio"}
                    name="enquete-opcao"
                    checked={isSelected}
                    disabled={!canVote}
                    onChange={() => handleSelect(option.id)}
                  />
                  <span className="text-gray-200 font-medium">{option.text}</span>
                </div>
                {resultsVisible && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>{votes} votos</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {!resultsVisible && (
          <div className="text-xs text-gray-400 mt-4">
            Os resultados serão exibidos após o encerramento.
          </div>
        )}

        {voteError && <div className="text-sm text-red-300 mt-4">{voteError}</div>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleVote}
            disabled={!canVote || voteLoading}
            className={`px-4 py-2 rounded font-semibold ${
              canVote
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-zinc-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {voteLoading ? "Salvando..." : voteButtonLabel}
          </button>
          {enquete.hasVoted && (
            <span className="text-xs text-emerald-200 flex items-center gap-2">
              <FaCheckCircle /> Voto registrado
            </span>
          )}
        </div>
      </main>
    </>
  );
}
