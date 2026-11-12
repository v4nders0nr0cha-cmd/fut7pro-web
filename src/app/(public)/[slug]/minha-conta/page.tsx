"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaUser, FaPen, FaChartLine, FaExchangeAlt, FaClock, FaSignOutAlt } from "react-icons/fa";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import PublicMembershipCard from "@/components/layout/PublicMembershipCard";
import { usePublicPersonalArea } from "@/hooks/usePublicPersonalArea";
import { useOwnerAthletePremiumProfile } from "@/hooks/useAthletePremiumProfile";
import { buildPublicHref } from "@/utils/public-links";
import { DEFAULT_ATHLETE_AVATAR } from "@/utils/avatar";

const icons = {
  account: FaUser,
  edit: FaPen,
  performance: FaChartLine,
  switch: FaExchangeAlt,
  pending: FaClock,
};

export default function MinhaContaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const personal = usePublicPersonalArea(slug);
  const [requested, setRequested] = useState(false);
  const { premiumProfile } = useOwnerAthletePremiumProfile({
    tenantSlug: slug,
    enabled: personal.approved,
    statsPeriod: "current",
  });
  const groupName = premiumProfile?.tenant.name?.trim() || slug;
  const administrativeRole = personal.me?.membership?.role;
  const isMonthly =
    Boolean(personal.me?.athlete?.mensalista) ||
    ["PRESIDENTE", "VICE_PRESIDENTE", "DIRETOR_FUTEBOL", "DIRETOR_FINANCEIRO"].includes(
      administrativeRole ?? ""
    );
  const pendingMonthly = requested || personal.me?.athlete?.mensalistaRequestStatus === "PENDING";

  async function requestMonthly() {
    if (!personal.authenticated || !personal.approved || isMonthly || pendingMonthly) return;
    try {
      const response = await fetch(`/api/public/${encodeURIComponent(slug)}/mensalistas/request`, {
        method: "POST",
        cache: "no-store",
      });
      const text = await response.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      if (!response.ok) {
        const payload = typeof body === "object" && body ? (body as Record<string, unknown>) : null;
        throw new Error(
          (typeof payload?.message === "string" && payload.message) ||
            (typeof payload?.error === "string" && payload.error) ||
            (typeof body === "string" && body) ||
            "Não foi possível enviar sua solicitação agora."
        );
      }
      setRequested(true);
      void personal.mutateMe();
    } catch (error) {
      const latest = await personal.mutateMe().catch(() => null);
      if (latest?.athlete?.mensalistaRequestStatus === "PENDING") {
        setRequested(true);
        return;
      }
      throw error;
    }
  }

  if (personal.loading && !personal.me)
    return (
      <p className="mx-auto max-w-3xl px-4 py-12 text-zinc-300">Carregando sua área pessoal...</p>
    );
  if (!personal.authenticated)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-white">
        <h1 className="text-2xl font-bold">Minha área pessoal</h1>
        <p className="mt-3 text-zinc-300">Entre na sua Conta Fut7Pro para consultar seus dados.</p>
        <Link
          href={`${buildPublicHref("/entrar", slug)}?callbackUrl=${encodeURIComponent(buildPublicHref("/minha-conta", slug))}`}
          className="mt-5 inline-flex rounded-lg bg-brand px-5 py-3 font-bold text-black"
        >
          Entrar
        </Link>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-[max(5rem,env(safe-area-inset-bottom))] text-white sm:px-6">
      <header className="mb-6 rounded-2xl border border-brand/25 bg-[#17191e] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Área pessoal</p>
        <h1 className="mt-1 text-2xl font-extrabold">Minha conta</h1>
        <div className="mt-5 flex min-w-0 items-center gap-4">
          <AvatarFut7Pro
            src={personal.avatar}
            alt={personal.name}
            width={56}
            height={56}
            fallbackSrc={DEFAULT_ATHLETE_AVATAR}
            className="shrink-0 rounded-full border-2 border-brand"
          />
          <div className="min-w-0">
            <p className="truncate font-bold" title={personal.name}>
              {personal.name}
            </p>
            <p className="truncate text-sm text-zinc-400" title={personal.email}>
              {personal.email}
            </p>
          </div>
        </div>
      </header>
      <div className="space-y-5">
        {personal.sections.map((section) => (
          <section
            key={section.title}
            aria-label={section.title}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#17191e]"
          >
            <h2 className="px-5 pb-2 pt-4 text-xs font-bold uppercase tracking-widest text-brand">
              {section.title}
            </h2>
            <div className="divide-y divide-white/10">
              {section.items.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex min-h-12 items-center gap-3 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  >
                    <Icon className="shrink-0 text-brand" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
        {personal.approved && (
          <section id="mensalista" aria-label="Situação de mensalista">
            <PublicMembershipCard
              variant={isMonthly ? "active" : pendingMonthly ? "pending" : "request"}
              groupName={groupName}
              monthlyExempt={personal.me?.athlete?.monthlyExempt === true}
              onConfirm={requestMonthly}
            />
          </section>
        )}
        <section aria-label="Conta" className="rounded-2xl border border-white/10 bg-[#17191e] p-4">
          <h2 className="px-1 text-xs font-bold uppercase tracking-widest text-brand">Conta</h2>
          <button
            type="button"
            onClick={() => {
              void signOut({ callbackUrl: buildPublicHref("/", slug) });
            }}
            className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-lg px-1 text-left text-sm font-semibold text-red-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <FaSignOutAlt aria-hidden="true" />
            Sair da conta
          </button>
        </section>
      </div>
    </div>
  );
}
