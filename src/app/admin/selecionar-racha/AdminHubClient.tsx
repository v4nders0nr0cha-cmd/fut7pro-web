"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { FaSearch, FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

type HubRacha = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
  logoUrl?: string | null;
  subscription?: {
    status?: "ATIVO" | "ALERTA" | "BLOQUEADO";
    blocked?: boolean;
    reason?: string | null;
    daysRemaining?: number | null;
    trialEnd?: string | null;
    currentPeriodEnd?: string | null;
    planKey?: string | null;
  } | null;
};

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

const setActiveTenantCookie = (slug: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${ACTIVE_TENANT_COOKIE}=${slug}; path=/; SameSite=Lax`;
};

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-presidente",
  DIRETOR_FUTEBOL: "Dir. Futebol",
  DIRETOR_FINANCEIRO: "Dir. Financeiro",
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
};

const ROLE_BADGES: Record<string, string> = {
  PRESIDENTE: "bg-yellow-400/20 text-yellow-200 border-yellow-400/30",
  VICE_PRESIDENTE: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  DIRETOR_FUTEBOL: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  DIRETOR_FINANCEIRO: "bg-purple-500/20 text-purple-200 border-purple-400/30",
  ADMIN: "bg-zinc-500/20 text-zinc-200 border-zinc-400/30",
  SUPERADMIN: "bg-red-500/20 text-red-200 border-red-400/30",
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  ALERTA: "Alerta",
  BLOQUEADO: "Bloqueado",
};

const STATUS_BADGES: Record<string, string> = {
  ATIVO: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  ALERTA: "bg-yellow-500/15 text-yellow-200 border-yellow-400/30",
  BLOQUEADO: "bg-red-500/15 text-red-200 border-red-400/30",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  ATIVO: <FaCheckCircle className="text-emerald-300" />,
  ALERTA: <FaExclamationTriangle className="text-yellow-300" />,
  BLOQUEADO: <FaLock className="text-red-300" />,
};

const fetcher = async (url: string): Promise<HubRacha[]> => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const error = new Error(body?.message || "Falha ao carregar rachas") as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }
  return Array.isArray(body) ? body : [];
};

export default function AdminHubClient() {
  const router = useRouter();
  const { status } = useSession();
  const { data, error, isLoading } = useSWR<HubRacha[]>("/api/admin/hub", fetcher, {
    revalidateOnFocus: false,
  });

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isLoading && !error && data && data.length === 1 && data[0]?.tenantSlug) {
      const only = data[0];
      const blocked = only.subscription?.blocked || only.subscription?.status === "BLOQUEADO";
      setActiveTenantCookie(only.tenantSlug);
      router.replace(blocked ? "/admin/status-assinatura" : "/admin/dashboard");
    }
  }, [data, error, isLoading, router]);

  const filtered = useMemo(() => {
    if (!data || !debouncedQuery) return data || [];
    return data.filter((racha) => {
      const target =
        `${racha.tenantName} ${racha.tenantSlug} ${ROLE_LABELS[racha.role] || racha.role}`.toLowerCase();
      return target.includes(debouncedQuery);
    });
  }, [data, debouncedQuery]);

  const hasResults = filtered.length > 0;

  return (
    <main className="min-h-screen bg-[#0b0f16] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">Painel Fut7Pro</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Meus Rachas</h1>
            <p className="mt-2 text-sm text-gray-300">
              Selecione o racha que deseja administrar. O acesso fica 100% isolado por racha.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-200 transition hover:border-white/20"
          >
            Sair
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <label className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, slug ou cargo..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            />
          </label>
          <p className="text-xs text-gray-400">{filtered.length} racha(s) encontrado(s).</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Nao foi possivel carregar seus rachas. Tente novamente em instantes.
          </div>
        ) : null}

        {!isLoading && !error && !hasResults ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center">
            <h2 className="text-lg font-semibold text-white">Nenhum racha encontrado</h2>
            <p className="mt-2 text-sm text-gray-300">
              Você ainda não possui acesso administrativo em nenhum racha.
            </p>
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push("/cadastrar-racha")}
                className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
              >
                Criar novo racha
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "mailto:social@fut7pro.com.br";
                  }
                }}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200"
              >
                Falar com suporte
              </button>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && hasResults ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((racha) => {
              const roleKey = racha.role?.toUpperCase() || "ADMIN";
              const roleLabel = ROLE_LABELS[roleKey] || racha.role;
              const statusKey = racha.subscription?.status || "ATIVO";
              const statusLabel = STATUS_LABELS[statusKey] || statusKey;
              const statusBadge = STATUS_BADGES[statusKey] || STATUS_BADGES.ATIVO;
              const roleBadge = ROLE_BADGES[roleKey] || ROLE_BADGES.ADMIN;
              const blocked = racha.subscription?.blocked || statusKey === "BLOQUEADO";
              const actionHref = blocked ? "/admin/status-assinatura" : "/admin/dashboard";

              return (
                <div
                  key={racha.tenantId}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={racha.logoUrl || "/images/logos/logo_fut7pro.png"}
                        alt={racha.tenantName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-base font-semibold text-white">{racha.tenantName}</h3>
                        <p className="text-xs text-gray-400">@{racha.tenantSlug}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${statusBadge}`}
                    >
                      {STATUS_ICONS[statusKey]}
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${roleBadge}`}
                    >
                      {roleLabel}
                    </span>
                    {racha.subscription?.reason ? (
                      <p className="text-xs text-gray-400">{racha.subscription.reason}</p>
                    ) : null}
                    {typeof racha.subscription?.daysRemaining === "number" ? (
                      <p className="text-xs text-gray-400">
                        {racha.subscription.daysRemaining >= 0
                          ? `Restam ${racha.subscription.daysRemaining} dia(s) no ciclo.`
                          : "Ciclo expirado."}
                      </p>
                    ) : null}
                  </div>

                  <a
                    href={actionHref}
                    onClick={() => setActiveTenantCookie(racha.tenantSlug)}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      blocked
                        ? "border border-red-400/40 text-red-200 hover:border-red-300"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}
                  >
                    {blocked ? "Status da assinatura" : "Acessar painel"}
                  </a>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
