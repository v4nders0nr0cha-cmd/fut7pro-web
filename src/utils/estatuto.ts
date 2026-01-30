import { ESTATUTO_TOPICOS_PADRAO } from "@/config/estatuto.defaults";
import type { EstatutoTopico } from "@/types/estatuto";

const defaultByTitle = new Map(
  ESTATUTO_TOPICOS_PADRAO.map((topico) => [normalizeKey(topico.titulo), topico])
);

function normalizeKey(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugify(value?: string) {
  const normalized = normalizeKey(value);
  if (!normalized) return "";
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ensureContent(
  titulo: string,
  conteudo: string[] | undefined,
  fallbackEmpty: string[] = [""]
) {
  const cleaned = (conteudo || []).map((linha) => linha.trim()).filter(Boolean);
  if (cleaned.length > 0) return cleaned;
  const defaultMatch = defaultByTitle.get(normalizeKey(titulo));
  if (defaultMatch?.conteudo?.length) return [...defaultMatch.conteudo];
  return fallbackEmpty;
}

export function normalizeEstatutoTopicos(
  input?: EstatutoTopico[] | null,
  fallback: EstatutoTopico[] = ESTATUTO_TOPICOS_PADRAO
) {
  const source =
    Array.isArray(input) && input.length > 0
      ? input
      : fallback.map((topico) => ({ ...topico, conteudo: [...topico.conteudo] }));

  const normalized = source.map((topico, index) => {
    const titulo = topico?.titulo?.toString().trim() || `Topico ${index + 1}`;
    const id = topico?.id?.toString().trim() || slugify(titulo) || `topico-${index + 1}`;
    return {
      ...topico,
      id,
      titulo,
      conteudo: ensureContent(titulo, topico?.conteudo),
    } satisfies EstatutoTopico;
  });

  const hasOrder = normalized.every((topico) => typeof topico.ordem === "number");
  if (hasOrder) {
    return [...normalized].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  }
  return normalized;
}
