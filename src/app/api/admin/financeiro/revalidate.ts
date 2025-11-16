import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const FINANCE_EXTRA_PATHS = ["/sobre-nos/prestacao-de-contas"];

export function revalidateFinancePages(tenantSlug: string | null | undefined) {
  if (!tenantSlug || tenantSlug.trim().length === 0) {
    return;
  }

  try {
    revalidateTenantPublicPages(tenantSlug, {
      extraPaths: FINANCE_EXTRA_PATHS,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao revalidar páginas financeiras públicas:", error);
    }
  }
}
