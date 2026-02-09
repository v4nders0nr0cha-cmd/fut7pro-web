import { normalizeYouTubeUrl } from "@/utils/youtube";
import {
  DEFAULT_HELP_CENTER_CONFIG,
  DEFAULT_HELP_CENTER_TOPICS,
  OFFICIAL_YOUTUBE_CHANNEL_URL,
} from "@/lib/help-center-defaults";
import type { HelpCenterConfig, HelpCenterTopic, HelpCenterVideo } from "@/types/help-center";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function toText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function normalizeTopic(input: unknown, index: number): HelpCenterTopic | null {
  if (!isRecord(input)) return null;
  const titulo = toText(input.titulo);
  const conteudo = toText(input.conteudo);
  const categoria = toText(input.categoria, "Geral");
  if (!titulo || !conteudo) return null;

  return {
    id: toText(input.id, `topic-${index + 1}`),
    categoria,
    titulo,
    conteudo,
    destaque: toBoolean(input.destaque, false),
    ordem: typeof input.ordem === "number" ? input.ordem : index + 1,
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => toText(tag)).filter(Boolean) : [],
  };
}

function normalizeVideo(input: unknown, index: number): HelpCenterVideo | null {
  if (!isRecord(input)) return null;
  const titulo = toText(input.titulo);
  const rawUrl = toText(input.url);
  if (!titulo || !rawUrl) return null;

  return {
    id: toText(input.id, `video-${index + 1}`),
    titulo,
    url: normalizeYouTubeUrl(rawUrl),
    publishedAt: toText(input.publishedAt),
    ordem: typeof input.ordem === "number" ? input.ordem : index + 1,
  };
}

export function normalizeHelpCenterConfig(
  payload: unknown,
  options?: {
    fallbackTopics?: HelpCenterTopic[];
    fallbackVideos?: HelpCenterVideo[];
    applyFallbackWhenEmpty?: boolean;
  }
): HelpCenterConfig {
  const source = isRecord(payload) ? payload : {};
  const fallbackTopics = options?.fallbackTopics ?? DEFAULT_HELP_CENTER_TOPICS;
  const fallbackVideos = options?.fallbackVideos ?? DEFAULT_HELP_CENTER_CONFIG.videos;
  const applyFallbackWhenEmpty = options?.applyFallbackWhenEmpty !== false;

  const topicList = Array.isArray(source.topics)
    ? source.topics.map((item, index) => normalizeTopic(item, index)).filter(Boolean)
    : [];

  const videoList = Array.isArray(source.videos)
    ? source.videos.map((item, index) => normalizeVideo(item, index)).filter(Boolean)
    : [];

  const normalizedTopics =
    applyFallbackWhenEmpty && topicList.length === 0
      ? fallbackTopics
      : (topicList as HelpCenterTopic[]);
  const normalizedVideos =
    applyFallbackWhenEmpty && videoList.length === 0
      ? fallbackVideos
      : (videoList as HelpCenterVideo[]);

  return {
    youtubeChannelUrl: toText(source.youtubeChannelUrl, OFFICIAL_YOUTUBE_CHANNEL_URL),
    youtubeChannelLabel: toText(source.youtubeChannelLabel, "Canal oficial Fut7Pro"),
    showVideos: toBoolean(source.showVideos, false),
    topics: [...normalizedTopics].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    videos: [...normalizedVideos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    updatedAt: toText(source.updatedAt),
  };
}

export function topicMatchesSearch(topic: HelpCenterTopic, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [topic.categoria, topic.titulo, topic.conteudo, ...(topic.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}
