import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { rachaConfig } from "@/config/racha.config";
import { resolvePublicTenantSlug } from "@/utils/public-links";

export default function TimesDoDiaRedirect() {
  const ref = headers().get("referer");
  let slug = "";

  if (ref) {
    try {
      const refUrl = new URL(ref);
      slug = resolvePublicTenantSlug(refUrl.pathname) ?? "";
    } catch {
      slug = "";
    }
  }

  const fallback =
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG?.trim().toLowerCase() || rachaConfig.slug;
  const targetSlug = slug || fallback;

  redirect(`/${targetSlug}/partidas/times-do-dia`);
}
