import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const PLAYER_EXTRA_PATHS = ["/atletas"];

export function revalidatePlayerPages(tenantSlug: string | null | undefined) {
  if (!tenantSlug || tenantSlug.trim().length === 0) {
    return;
  }

  try {
    revalidateTenantPublicPages(tenantSlug, {
      extraPaths: PLAYER_EXTRA_PATHS,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao revalidar páginas públicas de atletas:", error);
    }
  }
}
