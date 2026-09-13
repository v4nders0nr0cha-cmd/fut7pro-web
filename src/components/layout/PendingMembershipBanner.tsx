"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { resolveActiveTenantSlug } from "@/utils/active-tenant";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";

export default function PendingMembershipBanner() {
  const pathname = usePathname() ?? "";
  const { data: session, status } = useSession();
  const { publicHref } = usePublicLinks();
  const tenantSlug = resolveActiveTenantSlug(pathname) || "";
  const hasSession = hasUsableFut7ProSession(session, status);
  const { profile } = useGlobalProfile({ enabled: hasSession });
  const { me } = useMe({
    enabled: hasSession && Boolean(tenantSlug),
    tenantSlug,
    context: "athlete",
  });

  if (!tenantSlug || !hasSession) return null;

  const membershipStatus = String(
    me?.membership?.status ||
      profile?.memberships?.find((item) => item.tenantSlug === tenantSlug)?.status ||
      ""
  ).toUpperCase();

  if (membershipStatus !== "PENDENTE" && membershipStatus !== "PENDING") {
    return null;
  }

  const tenantName =
    profile?.memberships?.find((item) => item.tenantSlug === tenantSlug)?.tenantName || "";

  return (
    <section className="mx-auto mt-3 w-[min(1120px,calc(100%-24px))] rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-amber-50 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Solicitação em análise</h2>
          {tenantName ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-100/80">
              {tenantName}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-amber-50/90">
            Sua solicitação para participar deste grupo ainda está em análise. Enquanto isso, você
            pode continuar navegando pelo site e acessar sua Conta Fut7Pro normalmente.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/perfil"
            className="rounded-full bg-amber-200 px-4 py-2 text-center text-sm font-bold text-zinc-950"
          >
            Minha conta Fut7Pro
          </Link>
          <Link
            href={publicHref("/aguardando-aprovacao")}
            className="rounded-full border border-amber-200/60 px-4 py-2 text-center text-sm font-semibold text-amber-50"
          >
            Ver solicitação
          </Link>
        </div>
      </div>
    </section>
  );
}
