import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

export function revalidateTorneios(tenantSlug: string | null | undefined, torneioSlug?: string) {
  revalidateTenantPublicPages(tenantSlug, {
    extraPaths: [
      tenantSlug ? `/${tenantSlug}/grandes-torneios` : null,
      tenantSlug && torneioSlug ? `/${tenantSlug}/grandes-torneios/${torneioSlug}` : null,
    ].filter(Boolean) as string[],
  });
}
