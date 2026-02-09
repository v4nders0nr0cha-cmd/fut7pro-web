"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  FaBook,
  FaFire,
  FaInfoCircle,
  FaRegQuestionCircle,
  FaSearch,
  FaYoutube,
} from "react-icons/fa";
import { DEFAULT_HELP_CENTER_CONFIG } from "@/lib/help-center-defaults";
import { normalizeHelpCenterConfig, topicMatchesSearch } from "@/lib/help-center";
import type { HelpCenterConfig, HelpCenterTopic } from "@/types/help-center";

const CATEGORY_ORDER = [
  "Primeiros passos",
  "Dashboard",
  "Partidas",
  "Jogadores",
  "Conquistas",
  "Financeiro",
  "Personalização",
  "Administração",
  "Comunicação",
  "Configurações e plano",
  "Boas práticas",
  "Dúvidas frequentes",
];

function formatTopicPreview(topic: HelpCenterTopic) {
  const text = topic.conteudo.replace(/\n+/g, " ").trim();
  if (text.length <= 240) return text;
  return `${text.slice(0, 240).trimEnd()}...`;
}

function splitTopicParagraphs(topic: HelpCenterTopic) {
  return topic.conteudo
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CentralAjudaPage() {
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<HelpCenterConfig>(DEFAULT_HELP_CENTER_CONFIG);

  useEffect(() => {
    let alive = true;

    async function loadConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/help-center/config", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível carregar a central de ajuda.";
          throw new Error(message);
        }

        const normalized = normalizeHelpCenterConfig((payload as { data?: unknown })?.data, {
          applyFallbackWhenEmpty: true,
        });

        if (alive) {
          setConfig(normalized);
        }
      } catch (err) {
        if (!alive) return;
        setConfig(DEFAULT_HELP_CENTER_CONFIG);
        setError(err instanceof Error ? err.message : "Erro ao carregar a central de ajuda.");
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    void loadConfig();

    return () => {
      alive = false;
    };
  }, []);

  const topicosFiltrados = useMemo(
    () => config.topics.filter((topic) => topicMatchesSearch(topic, busca)),
    [config.topics, busca]
  );

  const topicosDestaque = useMemo(
    () => topicosFiltrados.filter((topic) => topic.destaque),
    [topicosFiltrados]
  );

  const categoriasOrdenadas = useMemo(() => {
    const categorias = Array.from(new Set(topicosFiltrados.map((topic) => topic.categoria)));
    return categorias.sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      if (safeA !== safeB) return safeA - safeB;
      return a.localeCompare(b, "pt-BR");
    });
  }, [topicosFiltrados]);

  const topicosPorCategoria = useMemo(() => {
    const map = new Map<string, HelpCenterTopic[]>();
    categoriasOrdenadas.forEach((categoria) => {
      map.set(
        categoria,
        topicosFiltrados.filter((topic) => topic.categoria === categoria)
      );
    });
    return map;
  }, [categoriasOrdenadas, topicosFiltrados]);

  const shouldShowVideos = config.showVideos && config.videos.length > 0;

  return (
    <>
      <Head>
        <title>Central de Ajuda | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Guia completo do painel admin Fut7Pro com processos operacionais, financeiro, comunicação, partidas e boas práticas de gestão do racha."
        />
        <meta
          name="keywords"
          content="fut7pro, central de ajuda, painel admin, tutorial racha, gestão futebol 7"
        />
      </Head>

      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-7xl mx-auto w-full space-y-6">
        <header className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <FaBook /> Central de Ajuda
          </h1>

          <div className="rounded-lg bg-[#232323] border-l-4 border-red-500 shadow p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FaYoutube className="text-red-500 text-2xl" />
              <span className="font-bold text-red-500 text-lg">{config.youtubeChannelLabel}</span>
            </div>
            <p className="text-sm text-zinc-300 md:flex-1 md:px-3">
              Conteúdo em vídeo será publicado em breve. Enquanto isso, use este guia completo para
              operar o painel admin com segurança e padronização.
            </p>
            <a
              href={config.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 transition shadow"
              title="Acessar canal oficial do Fut7Pro"
            >
              <FaYoutube className="text-xl" /> Ir para o YouTube
            </a>
          </div>

          <div className="rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow p-4 text-sm text-zinc-200">
            <p className="font-semibold text-yellow-300">
              Base operacional completa do painel admin Fut7Pro
            </p>
            <p className="mt-1">
              Esta central foi estruturada para reduzir dúvidas recorrentes e padronizar a gestão do
              racha: rotina diária, partidas, jogadores, financeiro, comunicação, segurança e boas
              práticas.
            </p>
          </div>

          <div className="flex items-center rounded bg-[#181818] border border-yellow-400">
            <FaSearch className="mx-3 text-yellow-400" />
            <input
              id="busca-ajuda"
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Digite uma dúvida, palavra-chave ou módulo..."
              className="bg-transparent border-none outline-none py-2 pr-3 w-full text-gray-200"
              autoComplete="off"
            />
          </div>

          <div className="rounded border border-zinc-700 bg-[#171717] px-3 py-2 text-xs text-zinc-400 flex items-center gap-2">
            <FaInfoCircle className="text-yellow-400" />
            {isLoading
              ? "Carregando base de ajuda..."
              : `${topicosFiltrados.length} tópico(s) disponível(is) para sua busca.`}
          </div>

          {error && (
            <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </header>

        {shouldShowVideos && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              <FaYoutube /> Vídeos rápidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {config.videos.map((video) => (
                <article key={video.id} className="rounded-lg bg-[#232323] p-3 shadow">
                  <iframe
                    width="100%"
                    height="200"
                    src={video.url}
                    title={video.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded mb-2"
                  />
                  <p className="text-zinc-100 font-semibold">{video.titulo}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <FaFire /> Tópicos em destaque
          </h2>

          {topicosDestaque.length === 0 ? (
            <p className="rounded border border-zinc-700 bg-[#1a1a1a] px-3 py-3 text-sm text-zinc-400">
              Nenhum tópico em destaque para o filtro atual.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {topicosDestaque.map((topic) => (
                <article
                  key={topic.id}
                  className="bg-[#232323] rounded-lg p-4 shadow border-l-4 border-yellow-400"
                >
                  <p className="font-bold text-yellow-300 mb-1">{topic.titulo}</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {formatTopicPreview(topic)}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">{topic.categoria}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <FaRegQuestionCircle /> Guia completo por módulo
          </h2>

          {categoriasOrdenadas.length === 0 ? (
            <p className="rounded border border-zinc-700 bg-[#1a1a1a] px-3 py-3 text-sm text-zinc-400">
              Nenhum tópico encontrado para a busca informada.
            </p>
          ) : (
            categoriasOrdenadas.map((categoria) => {
              const topicos = topicosPorCategoria.get(categoria) || [];
              return (
                <section key={categoria} className="space-y-3">
                  <h3 className="text-base font-bold text-zinc-200 border-l-4 border-yellow-400 pl-2">
                    {categoria}
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {topicos.map((topic) => (
                      <article key={topic.id} className="bg-[#181818] rounded-lg p-4 shadow">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="font-bold text-yellow-300">{topic.titulo}</p>
                          {topic.destaque && (
                            <span className="rounded bg-yellow-400/20 px-2 py-0.5 text-[11px] font-semibold text-yellow-200">
                              Destaque
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-zinc-200 leading-relaxed">
                          {splitTopicParagraphs(topic).map((paragraph, index) => (
                            <p key={`${topic.id}-line-${index}`}>{paragraph}</p>
                          ))}
                        </div>

                        {(topic.tags?.length ?? 0) > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {(topic.tags || []).map((tag) => (
                              <span
                                key={`${topic.id}-${tag}`}
                                className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}
