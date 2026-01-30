export function extractYouTubeId(url: string) {
  const normalized = url.trim();
  if (!normalized) return null;
  const match =
    normalized.match(/v=([a-zA-Z0-9_-]{6,})/) ||
    normalized.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
    normalized.match(/embed\/([a-zA-Z0-9_-]{6,})/) ||
    normalized.match(/shorts\/([a-zA-Z0-9_-]{6,})/);
  return match?.[1] || null;
}

export function normalizeYouTubeUrl(url: string) {
  const id = extractYouTubeId(url);
  if (!id) return url.trim();
  return `https://www.youtube.com/embed/${id}`;
}

export function youtubeThumb(url: string) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
