"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaLightbulb, FaPaperPlane, FaReply, FaSearch } from "react-icons/fa";
import { DEFAULT_PUBLIC_SLUG } from "@/config/tenant-public";
import { useAuth } from "@/hooks/useAuth";
import { useContactMessages } from "@/hooks/useContactMessages";

type StatusFiltro = "todos" | "novo" | "lido" | "respondido";

const SUGGESTION_TOPIC = "sugestao";

function formatarData(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indispon�vel";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SugestoesAdminPage() {
  const { user } = useAuth();
  const { mensagens, isLoading, isError, error } = useContactMessages({ limit: 200 });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>("todos");
  const [novaSugestao, setNovaSugestao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const sugestoes = useMemo(
    () =>
      mensagens.filter((mensagem) => mensagem.assunto?.toLowerCase().includes(SUGGESTION_TOPIC)),
    [mensagens]
  );

  const sugestoesFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return sugestoes.filter((mensagem) => {
      const atendeBusca =
        !termo ||
        mensagem.nome.toLowerCase().includes(termo) ||
        mensagem.email.toLowerCase().includes(termo) ||
        mensagem.mensagem.toLowerCase().includes(termo);
      const atendeStatus = statusFilter === "todos" || mensagem.status === statusFilter;
      return atendeBusca && atendeStatus;
    });
  }, [sugestoes, search, statusFilter]);

  const estatisticas = useMemo(() => {
    const total = sugestoes.length;
    const novos = sugestoes.filter((s) => s.status === "novo").length;
    const respondidos = sugestoes.filter((s) => s.status === "respondido").length;
    return [
      { label: "Total", value: total },
      { label: "Novos", value: novos },
      { label: "Respondidos", value: respondidos },
    ];
  }, [sugestoes]);

  const handleEnviarSugestaoAoFut7Pro = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!novaSugestao.trim()) {
      setFeedbackEnvio({ type: "error", message: "Descreva a sugest�o antes de enviar." });
      return;
    }

    setEnviando(true);
    setFeedbackEnvio(null);
    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: user?.name ?? "Administrador Fut7Pro",
          email: user?.email ?? "admin@fut7pro.com",
          assunto: "sugestao-admin",
          mensagem: novaSugestao.trim(),
          slug: DEFAULT_PUBLIC_SLUG,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error ?? "Falha ao enviar sugest�o para o Fut7Pro.");
      }

      setFeedbackEnvio({
        type: "success",
        message: "Sugest�o enviada para o Fut7Pro! Nossa equipe responder� por e-mail.",
      });
      setNovaSugestao("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "N�o conseguimos enviar sua sugest�o agora.";
      setFeedbackEnvio({ type: "error", message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sugest�es e Feedback | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Acompanhe as sugest�es enviadas pelos atletas e envie feedbacks diretamente para o time do Fut7Pro."
        />
      </Head>

      <main className="max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-10 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <FaLightbulb /> Sugest�es e Feedback
          </h1>
          <p className="text-sm text-zinc-300 max-w-3xl">
            Monitoramos as ideias enviadas pelos atletas e guiamos as pr�ximas melhorias do Fut7Pro.
            Use o painel para responder rapidamente e registre sugest�es para nossa equipe.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-stretch">
          <label className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail ou mensagem"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFiltro)}
            className="w-full md:w-48 rounded-xl bg-zinc-900 border border-zinc-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="todos">Todos os status</option>
            <option value="novo">Novos</option>
            <option value="lido">Lidos</option>
            <option value="respondido">Respondidos</option>
          </select>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {estatisticas.map((stat) => (
            <div key={stat.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{stat.label}</p>
              <p className="text-3xl font-bold text-yellow-300">{stat.value}</p>
            </div>
          ))}
        </section>

        {isError && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl text-red-200 px-4 py-3 text-sm">
            {error ?? "Falha ao carregar as sugest�es. Tente novamente em instantes."}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-4">
            <h2 className="text-xl font-semibold text-yellow-300">Sugest�es dos atletas</h2>
            {isLoading ? (
              <p className="text-zinc-400 text-sm">Carregando sugest�es...</p>
            ) : sugestoesFiltradas.length === 0 ? (
              <p className="text-zinc-400 text-sm">
                Nenhuma sugest�o encontrada para o filtro aplicado.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {sugestoesFiltradas.map((sugestao) => (
                  <li
                    key={sugestao.id}
                    className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 space-y-2"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm text-zinc-300">
                        <span className="font-semibold text-white">{sugestao.nome}</span>
                        <span>{formatarData(sugestao.dataEnvio)}</span>
                      </div>
                      <span className="text-xs text-yellow-400">{sugestao.email}</span>
                    </div>
                    <p className="text-sm text-zinc-100 whitespace-pre-wrap">{sugestao.mensagem}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Status: {sugestao.status}</span>
                      <button
                        className="inline-flex items-center gap-1 text-yellow-300 hover:text-white transition"
                        onClick={() =>
                          window.open(
                            `mailto:${sugestao.email}?subject=Resposta%20-%20Sugestao&body=${encodeURIComponent(
                              `Ol� ${sugestao.nome},\n\n`
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        <FaReply /> Responder
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-yellow-500/30 p-4 space-y-3 h-fit">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
              <FaPaperPlane /> Envie sugest�es ao Fut7Pro
            </h3>
            <p className="text-sm text-zinc-300">
              Encontrou uma oportunidade para evoluirmos o produto? Conte sua ideia para nossa
              equipe de produto e receba novidades diretamente no seu e-mail.
            </p>
            <form onSubmit={handleEnviarSugestaoAoFut7Pro} className="flex flex-col gap-3">
              <textarea
                value={novaSugestao}
                onChange={(event) => {
                  setNovaSugestao(event.target.value);
                  setFeedbackEnvio(null);
                }}
                rows={5}
                maxLength={600}
                placeholder="Descreva a melhoria, integra��o ou automa��o que ajudaria o seu racha."
                className="rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              {feedbackEnvio && (
                <div
                  className={`text-xs rounded-lg px-3 py-2 ${
                    feedbackEnvio.type === "success"
                      ? "bg-green-900/40 border border-green-500/40 text-green-200"
                      : "bg-red-900/40 border border-red-500/40 text-red-200"
                  }`}
                >
                  {feedbackEnvio.message}
                </div>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-black font-semibold hover:bg-yellow-300 transition disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar para o Fut7Pro"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
