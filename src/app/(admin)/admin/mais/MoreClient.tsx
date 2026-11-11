"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { ChevronRight, LogOut } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";
import { setStoredTenantSlug } from "@/utils/active-tenant";
import { getAdminProfileSections } from "../adminProfileNavigation";

type HubRacha = { tenantId: string; tenantSlug: string };
const hubFetcher = async (url: string): Promise<HubRacha[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];
  const result = await response.json().catch(() => null);
  return Array.isArray(result) ? result : [];
};

export default function MoreClient() {
  const { data: session } = useSession();
  const { me } = useMe({ context: "admin" });
  const { tenantSlug: contextSlug } = useRacha();
  const { data: groups } = useSWR<HubRacha[]>(session?.user ? "/api/admin/hub" : null, hubFetcher, {
    revalidateOnFocus: false,
  });
  const tenantSlug = contextSlug || me?.tenant?.tenantSlug || null;
  const athleteKey = me?.athlete?.slug || me?.athlete?.id || null;
  const rememberGroup = () => {
    if (tenantSlug) setStoredTenantSlug(tenantSlug);
  };
  const rowClass =
    "flex min-h-12 items-center gap-3 px-4 py-3 text-sm text-zinc-100 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300";

  const sections = getAdminProfileSections({
    tenantSlug,
    athleteKey,
    canSwitchGroup: !!groups && groups.length > 1,
  });

  return (
    <div className="mx-auto w-full max-w-xl pb-[env(safe-area-inset-bottom)] text-white">
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold">Mais</h1>
        <p className="mt-2 text-zinc-300">
          No computador, use o menu do perfil e o botão Ajuda Fut7Pro.
        </p>
      </div>
      <div className="pt-2 lg:hidden">
        <h1 className="sr-only">Mais</h1>
        {sections.map((section) => (
          <section key={section.id} className="mb-6" aria-label={section.title}>
            <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
              {section.title}
            </h2>
            <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#23272F]">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={rowClass}
                  onClick={
                    item.id === "global-profile" || item.id === "group-profile"
                      ? rememberGroup
                      : undefined
                  }
                  target={"external" in item && item.external ? "_blank" : undefined}
                  rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                >
                  <item.icon size={19} aria-hidden="true" className="shrink-0 text-yellow-300" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <ChevronRight size={16} aria-hidden="true" className="text-zinc-400" />
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section aria-label="Conta">
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
            Conta
          </h2>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className={`${rowClass} w-full rounded-xl border border-red-500/20 bg-[#23272F] text-left text-red-300`}
          >
            <LogOut size={19} aria-hidden="true" /> Sair da conta
          </button>
        </section>
      </div>
    </div>
  );
}
