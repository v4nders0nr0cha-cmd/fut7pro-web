"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Headset,
  LogOut,
  MessageCircle,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";
import { buildPublicHref } from "@/utils/public-links";
import { setStoredTenantSlug } from "@/utils/active-tenant";
import { buildFut7ProOfficialWhatsAppUrl } from "@/config/fut7pro-contact";

type HubRacha = { tenantId: string; tenantSlug: string };
const hubFetcher = async (url: string): Promise<HubRacha[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];
  const result = await response.json().catch(() => null);
  return Array.isArray(result) ? result : [];
};

const whatsappHref = buildFut7ProOfficialWhatsAppUrl("Olá! Preciso de ajuda com o Fut7Pro.");

export default function MoreClient() {
  const { data: session } = useSession();
  const { me } = useMe({ context: "admin" });
  const { tenantSlug: contextSlug } = useRacha();
  const { data: groups } = useSWR<HubRacha[]>(session?.user ? "/api/admin/hub" : null, hubFetcher, {
    revalidateOnFocus: false,
  });
  const tenantSlug = contextSlug || me?.tenant?.tenantSlug || null;
  const athleteKey = me?.athlete?.slug || me?.athlete?.id || null;
  const profileHref = tenantSlug ? buildPublicHref("/perfil", tenantSlug) : null;
  const publicHref =
    tenantSlug && athleteKey ? buildPublicHref(`/atletas/${athleteKey}`, tenantSlug) : null;
  const rememberGroup = () => {
    if (tenantSlug) setStoredTenantSlug(tenantSlug);
  };
  const rowClass =
    "flex min-h-12 items-center gap-3 px-4 py-3 text-sm text-zinc-100 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300";

  const sections = [
    {
      title: "Minha conta",
      items: [
        {
          label: "Perfil Global Fut7Pro",
          href: "/perfil",
          icon: UserRound,
          onClick: rememberGroup,
        },
        ...(profileHref
          ? [
              {
                label: "Meu perfil neste grupo",
                href: profileHref,
                icon: UsersRound,
                onClick: rememberGroup,
              },
            ]
          : []),
        ...(groups && groups.length > 1
          ? [{ label: "Trocar de grupo", href: "/admin/selecionar-racha", icon: RefreshCw }]
          : []),
        ...(publicHref
          ? [{ label: "Ver perfil público", href: publicHref, icon: ExternalLink, external: true }]
          : []),
      ],
    },
    {
      title: "Ajuda e orientação",
      items: [
        { label: "Guia Interativo", href: "/admin/guia-fut7pro", icon: BookOpen },
        { label: "Central de Ajuda", href: "/admin/comunicacao/ajuda", icon: CircleHelp },
        { label: "Suporte Fut7Pro", href: "/admin/comunicacao/suporte", icon: Headset },
        { label: "Falar pelo WhatsApp", href: whatsappHref, icon: MessageCircle, external: true },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-xl pb-[env(safe-area-inset-bottom)] text-white">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold">Mais</h1>
        <p className="mt-2 text-zinc-300">
          No computador, use o menu do perfil e o botão Ajuda Fut7Pro.
        </p>
      </div>
      <div className="pt-2 md:hidden">
        <h1 className="sr-only">Mais</h1>
        {sections.map((section) => (
          <section key={section.title} className="mb-6" aria-label={section.title}>
            <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-yellow-300">
              {section.title}
            </h2>
            <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#23272F]">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={rowClass}
                  onClick={"onClick" in item ? item.onClick : undefined}
                  target={"external" in item && item.external ? "_blank" : undefined}
                  rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                >
                  <item.icon size={19} aria-hidden="true" className="shrink-0 text-yellow-300" />
                  <span className="flex-1">{item.label}</span>
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
