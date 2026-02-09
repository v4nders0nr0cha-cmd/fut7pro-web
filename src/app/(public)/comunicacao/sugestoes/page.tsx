"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type SuggestionCategory =
  | "PLATFORM_IMPROVEMENT"
  | "BUG_REPORT"
  | "QUESTION"
  | "RACHA_IDEA"
  | "FINANCE_SPONSORSHIP"
  | "OTHER";

type SuggestionStatus =
  | "RECEIVED"
  | "READ_BY_ADMIN"
  | "FORWARDED"
  | "READ_BY_FUT7PRO"
  | "IN_REVIEW"
  | "PLANNED"
  | "DONE"
  | "REJECTED";

type SuggestionItem = {
  id: string;
  category: SuggestionCategory;
  status: SuggestionStatus;
  message: string;
  superAdminResponse?: string | null;
  createdAt: string;
};

const categoryOptions: Array<{ value: SuggestionCategory; label: string }> = [
  { value: "PLATFORM_IMPROVEMENT", label: "Melhoria da plataforma" },
  { value: "BUG_REPORT", label: "Informar bug" },
  { value: "QUESTION", label: "Dúvida" },
  { value: "RACHA_IDEA", label: "Ideia para o racha" },
  { value: "FINANCE_SPONSORSHIP", label: "Financeiro e patrocínios" },
  { value: "OTHER", label: "Outro" },
];

const statusLabels: Record<SuggestionStatus, string> = {
  RECEIVED: "Recebida pelo admin",
  READ_BY_ADMIN: "Lida pelo admin",
  FORWARDED: "Encaminhada ao Fut7Pro",
  READ_BY_FUT7PRO: "Lida pela equipe Fut7Pro",
  IN_REVIEW: "Em avaliação",
  PLANNED: "Planejada",
  DONE: "Concluída",
  REJECTED: "Rejeitada",
};

const statusStyles: Record<SuggestionStatus, string> = {
  RECEIVED: "bg-zinc-700 text-zinc-100",
  READ_BY_ADMIN: "bg-blue-900/60 text-blue-200",
  FORWARDED: "bg-yellow-900/60 text-yellow-200",
  READ_BY_FUT7PRO: "bg-sky-900/60 text-sky-200",
  IN_REVIEW: "bg-orange-900/60 text-orange-200",
  PLANNED: "bg-purple-900/60 text-purple-200",
  DONE: "bg-emerald-900/60 text-emerald-200",
  REJECTED: "bg-red-900/60 text-red-200",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("pt-BR");
}

function resolveResults(payload: unknown): SuggestionItem[] {
  if (Array.isArray(payload)) return payload as SuggestionItem[];
  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results: unknown }).results)
  ) {
    return (payload as { results: SuggestionItem[] }).results;
  }
  return [];
}

export default function SugestoesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { publicSlug, publicHref } = usePublicLinks();
  const role = String((session?.user as { role?: string } | undefined)?.role || "").toUpperCase();
  const shouldLoadMe =
    sessionStatus === "authenticated" && role === "ATLETA" && Boolean(publicSlug);
  const { me, isLoading: isLoadingMe } = useMe({
    enabled: shouldLoadMe,
    tenantSlug: publicSlug,
    context: "athlete",
  });

  const isAthleteLoggedIn = Boolean(me?.athlete?.id);
  const [category, setCategory] = useState<SuggestionCategory>("PLATFORM_IMPROVEMENT");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const endpoint = useMemo(() => {
    if (!publicSlug) return null;
    return `/api/public/${publicSlug}/suggestions`;
  }, [publicSlug]);

  const loadMine = useCallback(async () => {
    if (!endpoint || !isAthleteLoggedIn) {
      setSuggestions([]);
      return;
    }

    setIsLoadingList(true);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível carregar suas sugestões."
        );
      }
      setSuggestions(resolveResults(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar sugestões.");
      setSuggestions([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [endpoint, isAthleteLoggedIn]);

  useEffect(() => {
    if (!isAthleteLoggedIn) {
      setSuggestions([]);
      return;
    }
    loadMine();
  }, [isAthleteLoggedIn, loadMine]);

  async function handleSubmit() {
    if (!endpoint) {
      setError("Racha não identificado.");
      return;
    }

    const normalized = message.trim();
    if (normalized.length < 10) {
      setError("Digite uma mensagem com pelo menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: normalized,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível enviar a sugestão."
        );
      }

      setMessage("");
      setFeedback("Sugestão enviada com sucesso.");
      await loadMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar sugestão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isCheckingAuth = sessionStatus === "loading" || (shouldLoadMe && isLoadingMe);

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-3xl mx-auto w-full px-4">
      <h1 className="text-2xl font-bold text-zinc-100 mb-4">Sugestões e Feedback</h1>

      <div className="mb-6 bg-zinc-800 rounded-lg p-4 border-l-4 border-brand">
        <p className="text-zinc-100 font-semibold">
          Envie sua sugestão para o administrador do seu racha.
        </p>
        <p className="text-zinc-300 text-sm mt-1">
          Se for uma ideia para melhorar o Fut7Pro, o admin pode encaminhar para a nossa equipe, e
          você acompanha o andamento por aqui.
        </p>
      </div>

      {isCheckingAuth ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
          Verificando sua sessão...
        </div>
      ) : !isAthleteLoggedIn ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-5">
          <p className="text-zinc-100 font-semibold mb-3">Faça login para enviar sugestão.</p>
          <Link
            href={publicHref("/login")}
            className="inline-flex items-center rounded bg-brand px-4 py-2 text-sm font-bold text-black hover:bg-brand-strong transition"
          >
            Ir para login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-3">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-zinc-200 mb-1">
                Assunto
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value as SuggestionCategory)}
                className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-brand"
                disabled={isSubmitting}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-zinc-200 mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escreva sua sugestão..."
                className="w-full min-h-[130px] rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-brand"
                maxLength={2000}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded bg-brand px-4 py-2 font-bold text-black transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar sugestão"}
            </button>

            {feedback && <div className="text-sm text-emerald-400">{feedback}</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
          </div>

          <section>
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">Minhas sugestões</h2>
            {isLoadingList ? (
              <div className="text-sm text-zinc-400">Carregando suas sugestões...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-sm text-zinc-400">Você ainda não enviou sugestões.</div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-zinc-400">{formatDate(item.createdAt)}</span>
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-100 whitespace-pre-wrap">{item.message}</p>

                    {item.superAdminResponse && (
                      <div className="rounded border border-emerald-700/50 bg-emerald-900/20 p-3">
                        <p className="text-xs font-semibold text-emerald-300 mb-1">
                          Resposta da equipe Fut7Pro
                        </p>
                        <p className="text-sm text-emerald-100 whitespace-pre-wrap">
                          {item.superAdminResponse}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
