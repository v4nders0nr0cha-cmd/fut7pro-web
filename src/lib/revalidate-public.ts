import { revalidatePath } from "next/cache";
import { DEFAULT_PUBLIC_SLUG } from "@/config/tenant-public";

const BASE_PUBLIC_PATHS = [
  "",
  "/sobre-nos",
  "/sobre-nos/nossos-parceiros",
  "/sobre-nos/prestacao-de-contas",
  "/estatisticas",
  "/estatisticas/ranking-geral",
  "/estatisticas/artilheiros",
  "/estatisticas/assistencias",
  "/estatisticas/melhores-por-posicao",
  "/partidas",
];

type RevalidateOptions = {
  extraPaths?: string[];
};

function normalizePath(segment: string) {
  if (!segment) return "";
  return segment.startsWith("/") ? segment : `/${segment}`;
}

function buildPathForSlug(slug: string, suffix: string) {
  const normalizedSlug = slug.replace(/^\//, "").replace(/\/$/, "");
  if (!normalizedSlug) {
    return normalizePath(suffix || "");
  }
  const normalizedSuffix = normalizePath(suffix || "");
  return normalizedSuffix ? `/${normalizedSlug}${normalizedSuffix}` : `/${normalizedSlug}`;
}

function sanitizeSlug(slug: string | null | undefined) {
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim().replace(/^\//, "").replace(/\/$/, "");
  if (!trimmed) return null;
  return trimmed;
}

export function revalidateTenantPublicPages(
  slug: string | null | undefined,
  options?: RevalidateOptions
) {
  const normalizedSlug = sanitizeSlug(slug);
  if (!normalizedSlug) {
    return;
  }

  const paths = new Set<string>([...BASE_PUBLIC_PATHS, ...(options?.extraPaths ?? [])]);

  paths.forEach((suffix) => {
    const path = buildPathForSlug(normalizedSlug, suffix);
    try {
      revalidatePath(path);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Falha ao revalidar ${path}:`, error);
      }
    }
  });

  if (normalizedSlug === sanitizeSlug(DEFAULT_PUBLIC_SLUG)) {
    paths.forEach((suffix) => {
      const path = normalizePath(suffix || "");
      try {
        revalidatePath(path || "/");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`Falha ao revalidar caminho padrao ${path}:`, error);
        }
      }
    });
  }
}
