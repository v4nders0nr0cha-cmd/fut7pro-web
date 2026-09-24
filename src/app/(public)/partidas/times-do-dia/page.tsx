import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { resolvePublicTenantSlug } from "@/utils/public-links";

export default async function TimesDoDiaRedirect() {
  const [headerStore, cookieStore] = await Promise.all([await headers(), await cookies()]);
  const ref = headerStore.get("referer");
  const cookieSlug = cookieStore.get("f7_active_slug")?.value?.trim().toLowerCase() || "";
  let slug = "";

  if (ref) {
    try {
      const refUrl = new URL(ref);
      slug = resolvePublicTenantSlug(refUrl.pathname) ?? "";
    } catch {
      slug = "";
    }
  }

  const targetSlug = slug || cookieSlug;

  if (!targetSlug) {
    redirect("/partidas");
  }

  redirect(`/${targetSlug}/partidas/times-do-dia`);
}
