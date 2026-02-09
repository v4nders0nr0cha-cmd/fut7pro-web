"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaPlus,
  FaSave,
  FaTimesCircle,
  FaTrash,
  FaYoutube,
} from "react-icons/fa";
import {
  DEFAULT_HELP_CENTER_CONFIG,
  DEFAULT_HELP_CENTER_TOPICS,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from "@/lib/help-center-defaults";
import { normalizeHelpCenterConfig } from "@/lib/help-center";
import type { HelpCenterConfig, HelpCenterTopic, HelpCenterVideo } from "@/types/help-center";

type SuperAdminConfigResponse = {
  centralAjudaConfig?: unknown;
};

function createTopic(order: number): HelpCenterTopic {
  return {
    id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    categoria: "Geral",
    titulo: "",
    conteudo: "",
    destaque: false,
    ordem: order,
    tags: [],
  };
}

function createVideo(order: number): HelpCenterVideo {
  return {
    id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    titulo: "",
    url: "",
    ordem: order,
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function toErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as { message?: string }).message;
  if (typeof message === "string" && message.trim()) return message;
  const error = (payload as { error?: string }).error;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function normalizeTopicsForSave(topics: HelpCenterTopic[]) {
  return topics
    .map((topic, index) => ({
      ...topic,
      categoria: topic.categoria.trim() || "Geral",
      titulo: topic.titulo.trim(),
      conteudo: topic.conteudo.trim(),
      ordem: index + 1,
      tags: (topic.tags || []).map((tag) => tag.trim()).filter(Boolean),
    }))
    .filter((topic) => topic.titulo.length > 0 && topic.conteudo.length > 0);
}

function normalizeVideosForSave(videos: HelpCenterVideo[]) {
  return videos
    .map((video, index) => ({
      ...video,
      titulo: video.titulo.trim(),
      url: video.url.trim(),
      ordem: index + 1,
    }))
    .filter((video) => video.titulo.length > 0 && video.url.length > 0);
}

export default function SuperAdminAjudaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [config, setConfig] = useState<HelpCenterConfig>(DEFAULT_HELP_CENTER_CONFIG);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/superadmin/config", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as SuperAdminConfigResponse;

        if (!response.ok) {
          throw new Error(toErrorMessage(payload, "Não foi possível carregar a configuração."));
        }

        const normalized = normalizeHelpCenterConfig(payload.centralAjudaConfig, {
          fallbackTopics: DEFAULT_HELP_CENTER_TOPICS,
          applyFallbackWhenEmpty: true,
        });

        if (alive) {
          setConfig(normalized);
        }
      } catch (err) {
        if (!alive) return;
        setConfig(DEFAULT_HELP_CENTER_CONFIG);
        setError(err instanceof Error ? err.message : "Erro ao carregar a configuração.");
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    void loadConfig();

    return () => {
      alive = false;
    };
  }, []);

  const filteredTopics = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return config.topics;
    return config.topics.filter((topic) => {
      const text = `${topic.categoria} ${topic.titulo} ${topic.conteudo}`.toLowerCase();
      return text.includes(query);
    });
  }, [config.topics, filter]);

  async function saveConfig() {
    setIsSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const topics = normalizeTopicsForSave(config.topics);
      const videos = normalizeVideosForSave(config.videos);

      const centralAjudaConfig: HelpCenterConfig = {
        youtubeChannelUrl: config.youtubeChannelUrl.trim() || OFFICIAL_YOUTUBE_CHANNEL_URL,
        youtubeChannelLabel: config.youtubeChannelLabel.trim() || "Canal oficial Fut7Pro",
        showVideos: config.showVideos,
        topics,
        videos,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/superadmin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centralAjudaConfig }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(toErrorMessage(payload, "Não foi possível salvar a configuração."));
      }

      setConfig(
        normalizeHelpCenterConfig((payload as SuperAdminConfigResponse).centralAjudaConfig, {
          fallbackTopics: DEFAULT_HELP_CENTER_TOPICS,
          applyFallbackWhenEmpty: true,
        })
      );

      setFeedback({
        success: true,
        message: "Central de Ajuda global salva com sucesso.",
      });
    } catch (err) {
      setFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Erro ao salvar configuração.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Central de Ajuda Global | Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Configure os tópicos e vídeos da Central de Ajuda exibida no painel admin dos rachas Fut7Pro."
        />
      </Head>

      <div className="space-y-5">
        <header className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-2">
          <h1 className="text-2xl font-semibold text-yellow-300">Central de Ajuda Global</h1>
          <p className="text-sm text-zinc-300">
            Esta configuração alimenta a página <code>/admin/comunicacao/ajuda</code> dos rachas.
            Você pode editar tópicos, ativar/desativar vídeos e ajustar o canal oficial.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded border border-zinc-700 bg-[#171717] p-4 text-sm text-zinc-400">
            Carregando configuração da central de ajuda...
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            {feedback && (
              <div
                className={`rounded px-3 py-2 text-sm font-semibold ${
                  feedback.success
                    ? "border border-emerald-700 bg-emerald-900/30 text-emerald-200"
                    : "border border-red-700 bg-red-900/30 text-red-200"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
                  {feedback.message}
                </span>
              </div>
            )}

            <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-4">
              <h2 className="text-lg font-semibold text-yellow-300">Canal e vídeos</h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">URL do canal oficial</label>
                  <input
                    value={config.youtubeChannelUrl}
                    onChange={(event) =>
                      setConfig((prev) => ({ ...prev, youtubeChannelUrl: event.target.value }))
                    }
                    placeholder="https://www.youtube.com/@Fut7Pro_app"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Texto do canal</label>
                  <input
                    value={config.youtubeChannelLabel}
                    onChange={(event) =>
                      setConfig((prev) => ({ ...prev, youtubeChannelLabel: event.target.value }))
                    }
                    placeholder="Canal oficial Fut7Pro"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={config.showVideos}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, showVideos: event.target.checked }))
                  }
                  className="accent-yellow-400"
                />
                Exibir seção “Vídeos rápidos” no painel admin
              </label>

              <div className="space-y-3 rounded border border-zinc-800 bg-[#121212] p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-200">Lista de vídeos</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        videos: [...prev.videos, createVideo(prev.videos.length + 1)],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-yellow-300"
                  >
                    <FaPlus /> Adicionar vídeo
                  </button>
                </div>

                {config.videos.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum vídeo cadastrado. Quando você publicar no canal, adicione os links aqui.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {config.videos.map((video, index) => (
                      <article
                        key={video.id}
                        className="rounded border border-zinc-700 bg-zinc-900 p-3"
                      >
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end">
                          <div>
                            <label className="mb-1 block text-xs text-zinc-400">Título</label>
                            <input
                              value={video.titulo}
                              onChange={(event) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  videos: prev.videos.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, titulo: event.target.value }
                                      : item
                                  ),
                                }))
                              }
                              className="w-full rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-zinc-400">URL</label>
                            <input
                              value={video.url}
                              onChange={(event) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  videos: prev.videos.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, url: event.target.value }
                                      : item
                                  ),
                                }))
                              }
                              className="w-full rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  videos: moveItem(prev.videos, index, -1),
                                }))
                              }
                              className="rounded border border-zinc-600 p-2 text-zinc-300 hover:bg-zinc-800"
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  videos: moveItem(prev.videos, index, 1),
                                }))
                              }
                              className="rounded border border-zinc-600 p-2 text-zinc-300 hover:bg-zinc-800"
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  videos: prev.videos.filter((_, itemIndex) => itemIndex !== index),
                                }))
                              }
                              className="rounded border border-red-700 p-2 text-red-200 hover:bg-red-900/30"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-yellow-300">
                  Tópicos da Central de Ajuda
                </h2>
                <div className="flex gap-2">
                  <input
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Filtrar tópicos"
                    className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        topics: [...prev.topics, createTopic(prev.topics.length + 1)],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-yellow-300"
                  >
                    <FaPlus /> Adicionar tópico
                  </button>
                </div>
              </div>

              <div className="rounded border border-zinc-800 bg-[#121212] p-3 text-xs text-zinc-400">
                Tópicos cadastrados:{" "}
                <span className="text-zinc-200 font-semibold">{config.topics.length}</span>
                {" · "}
                Em destaque:{" "}
                <span className="text-zinc-200 font-semibold">
                  {config.topics.filter((topic) => topic.destaque).length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredTopics.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum tópico encontrado para o filtro atual.
                  </p>
                ) : (
                  filteredTopics.map((topic, index) => (
                    <article
                      key={topic.id}
                      className="rounded border border-zinc-700 bg-zinc-900 p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-[170px_1fr_auto] md:items-end">
                        <div>
                          <label className="mb-1 block text-xs text-zinc-400">Categoria</label>
                          <input
                            value={topic.categoria}
                            onChange={(event) =>
                              setConfig((prev) => ({
                                ...prev,
                                topics: prev.topics.map((item) =>
                                  item.id === topic.id
                                    ? { ...item, categoria: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            className="w-full rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-zinc-400">Título</label>
                          <input
                            value={topic.titulo}
                            onChange={(event) =>
                              setConfig((prev) => ({
                                ...prev,
                                topics: prev.topics.map((item) =>
                                  item.id === topic.id
                                    ? { ...item, titulo: event.target.value }
                                    : item
                                ),
                              }))
                            }
                            className="w-full rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                topics: moveItem(prev.topics, index, -1),
                              }))
                            }
                            className="rounded border border-zinc-600 p-2 text-zinc-300 hover:bg-zinc-800"
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                topics: moveItem(prev.topics, index, 1),
                              }))
                            }
                            className="rounded border border-zinc-600 p-2 text-zinc-300 hover:bg-zinc-800"
                          >
                            <FaArrowDown />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                topics: prev.topics.filter((item) => item.id !== topic.id),
                              }))
                            }
                            className="rounded border border-red-700 p-2 text-red-200 hover:bg-red-900/30"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          checked={Boolean(topic.destaque)}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              topics: prev.topics.map((item) =>
                                item.id === topic.id
                                  ? { ...item, destaque: event.target.checked }
                                  : item
                              ),
                            }))
                          }
                          className="accent-yellow-400"
                        />
                        Mostrar em “Tópicos em destaque”
                      </label>

                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">
                          Conteúdo completo
                        </label>
                        <textarea
                          value={topic.conteudo}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              topics: prev.topics.map((item) =>
                                item.id === topic.id
                                  ? { ...item, conteudo: event.target.value }
                                  : item
                              ),
                            }))
                          }
                          rows={7}
                          placeholder="Descreva passo a passo, regras e boas práticas."
                          className="w-full rounded border border-zinc-700 bg-[#101010] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                        />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveConfig()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
              >
                <FaSave />
                {isSaving ? "Salvando..." : "Salvar Central de Ajuda"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
