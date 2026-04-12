"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { FaSearch, FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useSessionRefreshScheduler } from "@/hooks/useSessionRefreshScheduler";

type HubRacha = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
  logoUrl?: string | null;
  logo?: string | null;
  branding?: { logoUrl?: string | null } | null;
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

function getTenantInitials(name: string) {
  const normalized = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return normalized || "R";
}

function normalizeLogoUrl(value?: string | null) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const rewriteSignedSupabase = (raw: string) => {
    const signedRegex = /^\/storage\/v1\/object\/sign\/(?:public\/)?([^\/?#]+)\/([^?#]+)$/i;

    if (/^https?:\/\//i.test(raw)) {
      try {
        const url = new URL(raw);
        const match = url.pathname.match(signedRegex);
        if (!match) return null;
        const [, bucket, path] = match;
        url.pathname = `/storage/v1/object/public/${bucket}/${path}`;
        url.search = "";
        return url.toString();
      } catch {
        return null;
      }
    }

    const normalizedPath = raw.startsWith("/")
      ? raw
      : `/${raw.replace(/^\.\/+/, "").replace(/^\/+/, "")}`;
    const cleanPath = normalizedPath.split("?")[0].split("#")[0] || "";
    const match = cleanPath.match(signedRegex);
    if (!match) return null;
    const [, bucket, path] = match;
    return `/storage/v1/object/public/${bucket}/${path}`;
  };

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:")) return null;
  if (lower.startsWith("blob:")) return null;
  if (lower.startsWith("data:") && !lower.startsWith("data:image/")) return null;

  const rewrittenSigned = rewriteSignedSupabase(trimmed);
  if (rewrittenSigned) {
    if (/^https?:\/\//i.test(rewrittenSigned)) return rewrittenSigned;
    const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "")
      .trim()
      .replace(/\/+$/, "");
    if (apiBase) return `${apiBase}${rewrittenSigned}`;
    return rewrittenSigned;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:image/")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;

  const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const cleanedRelative = trimmed.replace(/^\.\/+/, "").replace(/^\/+/, "");

  if (!trimmed.startsWith("/")) {
    if (!cleanedRelative) return null;
    const normalizedRelativePath = `/${cleanedRelative}`;
    const isBackendRelativePath =
      /^(uploads|storage|files|public-media|private-media|temp-uploads)\//i.test(cleanedRelative);
    if (isBackendRelativePath && apiBase) {
      return `${apiBase}${normalizedRelativePath}`;
    }
    if (isBackendRelativePath) {
      return normalizedRelativePath;
    }
    if (/^(images|img|assets)\//i.test(cleanedRelative)) {
      return normalizedRelativePath;
    }
    return trimmed;
  }

  const backendPath = /^\/(uploads|storage|files|public-media|private-media|temp-uploads)\//i.test(
    trimmed
  );
  if (backendPath && apiBase) {
    return `${apiBase}${trimmed}`;
  }
  return trimmed;
}

function normalizeSignedStoragePath(value: string) {
  const match = value.match(/^\/storage\/v1\/object\/sign\/(?:public\/)?([^/]+)\/(.+)$/i);
  if (!match) return null;
  return `/storage/v1/object/public/${match[1]}/${match[2]}`;
}

function buildLogoCandidates(racha: HubRacha) {
  const seeds = [racha.logoUrl, racha.logo, racha.branding?.logoUrl];
  const candidates = new Set<string>();

  for (const seed of seeds) {
    const normalized = normalizeLogoUrl(seed);
    if (!normalized) continue;
    candidates.add(normalized);

    if (normalized.startsWith("http://")) {
      candidates.add(`https://${normalized.slice("http://".length)}`);
    }

    if (normalized.startsWith("/")) {
      const rewritten = normalizeSignedStoragePath(normalized);
      if (rewritten) {
        const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "")
          .trim()
          .replace(/\/+$/, "");
        candidates.add(apiBase ? `${apiBase}${rewritten}` : rewritten);
      }
      continue;
    }

    try {
      const parsed = new URL(normalized);
      const rewritten = normalizeSignedStoragePath(parsed.pathname);
      if (rewritten) {
        candidates.add(`${parsed.origin}${rewritten}`);
      }
    } catch {
      // ignore malformed URL and keep existing candidates
    }
  }

  return Array.from(candidates);
}

const LAST_TENANT_STORAGE = "fut7pro_last_tenants";
const PERF_FLAG_KEY = "fut7pro_admin_perf_enabled";
const PERF_START_KEY = "fut7pro_admin_perf_start";

const readLastTenantAccess = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAST_TENANT_STORAGE);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
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

type HubEntryResponse = {
  items: HubRacha[];
  count: number;
  redirectTo: string | null;
  blocked?: boolean;
  timing?: {
    hubMs?: number;
    accessMs?: number;
  };
};

const normalizeEntryResponse = (body: any): HubEntryResponse => {
  if (Array.isArray(body)) {
    return { items: body as HubRacha[], count: body.length, redirectTo: null };
  }

  const items = Array.isArray(body?.items) ? (body.items as HubRacha[]) : [];
  const count = typeof body?.count === "number" ? body.count : items.length;
  const redirectTo = typeof body?.redirectTo === "string" ? body.redirectTo : null;
  const timing = typeof body?.timing === "object" ? body.timing : undefined;

  return {
    items,
    count,
    redirectTo,
    blocked: Boolean(body?.blocked),
    timing,
  };
};

const fetcher = async (url: string): Promise<HubEntryResponse> => {
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
  return normalizeEntryResponse(body);
};

export default function AdminHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update: updateSession } = useSession();
  const perfEnabled = searchParams?.get("perf") === "1";
  const requestStartRef = useRef<number | null>(null);
  const authRecoveryAttemptedRef = useRef(false);

  const entryFetcher = async (url: string) => {
    requestStartRef.current = typeof performance !== "undefined" ? performance.now() : null;
    return fetcher(url);
  };

  const { data, error, isLoading, mutate } = useSWR<HubEntryResponse>(
    "/api/admin/hub/entry",
    entryFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [lastAccessMap, setLastAccessMap] = useState<Record<string, number>>({});
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null);
  const [selectError, setSelectError] = useState("");
  const autoRedirectedRef = useRef(false);
  const [logoAttemptIndex, setLogoAttemptIndex] = useState<Record<string, number>>({});

  useSessionRefreshScheduler({
    status: status as "loading" | "authenticated" | "unauthenticated",
    session: session as any,
    refreshSession: updateSession as any,
    enabled: status === "authenticated",
    onRefreshFailed: () => {
      router.replace("/admin/login?expired=1");
    },
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const count = typeof data?.count === "number" ? data.count : items.length;
  const shouldAutoRedirect =
    !isLoading && !error && count === 1 && items[0]?.tenantSlug && data?.redirectTo;

  const trackLastTenantAccess = (slug: string) => {
    if (typeof window === "undefined") return;
    setLastAccessMap((prev) => {
      const next = { ...prev, [slug]: Date.now() };
      window.localStorage.setItem(LAST_TENANT_STORAGE, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setLastAccessMap(readLastTenantAccess());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!error || (error as { status?: number })?.status !== 401) {
      authRecoveryAttemptedRef.current = false;
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/admin/login?expired=1");
      return;
    }

    if (authRecoveryAttemptedRef.current) {
      router.replace("/admin/login?expired=1");
      return;
    }

    authRecoveryAttemptedRef.current = true;
    void (async () => {
      try {
        const nextSession = await updateSession();
        const nextToken = String((nextSession as any)?.user?.accessToken || "").trim();
        if (nextToken) {
          await mutate();
          authRecoveryAttemptedRef.current = false;
          return;
        }
      } catch {
        // fallback redirect below
      }
      router.replace("/admin/login?expired=1");
    })();
  }, [error, mutate, router, status, updateSession]);

  useEffect(() => {
    if (!shouldAutoRedirect || autoRedirectedRef.current) return;
    if (items[0]?.tenantSlug && data?.redirectTo) {
      autoRedirectedRef.current = true;
      const slug = items[0].tenantSlug;
      trackLastTenantAccess(slug);
      if (typeof window !== "undefined") {
        if (perfEnabled) {
          window.sessionStorage.setItem(PERF_FLAG_KEY, "1");
        }
        window.sessionStorage.setItem(PERF_START_KEY, String(performance.now()));
      }
      if (typeof window !== "undefined") {
        window.location.replace(data.redirectTo);
        return;
      }
      router.replace(data.redirectTo);
    }
  }, [data?.redirectTo, items, perfEnabled, router, shouldAutoRedirect]);

  useEffect(() => {
    if (!perfEnabled || isLoading || !data) return;
    const hubMs = data.timing?.hubMs;
    const accessMs = data.timing?.accessMs;
    const clientMs =
      requestStartRef.current && typeof performance !== "undefined"
        ? Math.max(0, performance.now() - requestStartRef.current)
        : null;
    console.info("[Perf] hub", {
      hubMs,
      accessMs,
      clientMs,
      count,
    });
  }, [count, data, isLoading, perfEnabled]);

  const filtered = useMemo(() => {
    const base = items ? [...items] : [];
    const byQuery = debouncedQuery
      ? base.filter((racha) => {
          const target =
            `${racha.tenantName} ${racha.tenantSlug} ${ROLE_LABELS[racha.role] || racha.role}`.toLowerCase();
          return target.includes(debouncedQuery);
        })
      : base;

    return byQuery.sort((a, b) => {
      const aTime = lastAccessMap[a.tenantSlug] ?? 0;
      const bTime = lastAccessMap[b.tenantSlug] ?? 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.tenantName.localeCompare(b.tenantName);
    });
  }, [items, debouncedQuery, lastAccessMap]);

  const hasResults = filtered.length > 0;
  const autoRedirecting = Boolean(shouldAutoRedirect);
  const showLoading = isLoading && !autoRedirecting;
  const showCount = !showLoading && !autoRedirecting;

  const handleSelect = async (racha: HubRacha) => {
    if (selectingSlug) return;
    setSelectError("");
    setSelectingSlug(racha.tenantSlug);

    if (typeof window !== "undefined") {
      if (perfEnabled) {
        window.sessionStorage.setItem(PERF_FLAG_KEY, "1");
      }
      window.sessionStorage.setItem(PERF_START_KEY, String(performance.now()));
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/admin/hub/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: racha.tenantSlug }),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error || "Falha ao acessar painel");
      }
      trackLastTenantAccess(racha.tenantSlug);
      const redirectTo =
        typeof body?.redirectTo === "string" ? body.redirectTo : "/admin/dashboard";
      if (typeof window !== "undefined") {
        window.location.assign(redirectTo);
        return;
      }
      router.replace(redirectTo);
    } catch {
      setSelectError("Não foi possível acessar o painel agora.");
    } finally {
      window.clearTimeout(timeout);
      setSelectingSlug(null);
    }
  };

  if (autoRedirecting) {
    return (
      <main className="min-h-screen bg-[#0b0f16] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-3 px-4">
          <div className="h-10 w-10 rounded-full border-2 border-yellow-400/40 border-t-yellow-400 animate-spin" />
          <p className="text-sm text-gray-300">Entrando no painel...</p>
        </div>
      </main>
    );
  }

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
              data-testid="admin-hub-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, slug ou cargo..."
              disabled={showLoading}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-11 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
            />
          </label>
          <p className="text-xs text-gray-400">
            {showCount ? `${filtered.length} racha(s) encontrado(s).` : "Carregando seus rachas..."}
          </p>
        </div>

        {showLoading ? (
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
            Não foi possível carregar seus rachas. Tente novamente em instantes.
          </div>
        ) : null}

        {selectError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {selectError}
          </div>
        ) : null}

        {!showLoading && !error && !hasResults ? (
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

        {!showLoading && !error && hasResults ? (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="admin-hub-list"
          >
            {filtered.map((racha) => {
              const roleKey = racha.role?.toUpperCase() || "ADMIN";
              const roleLabel = ROLE_LABELS[roleKey] || racha.role;
              const statusKey = racha.subscription?.status || "ATIVO";
              const statusLabel = STATUS_LABELS[statusKey] || statusKey;
              const statusBadge = STATUS_BADGES[statusKey] || STATUS_BADGES.ATIVO;
              const roleBadge = ROLE_BADGES[roleKey] || ROLE_BADGES.ADMIN;
              const blocked = racha.subscription?.blocked || statusKey === "BLOQUEADO";
              const isSelecting = selectingSlug === racha.tenantSlug;
              const logoCandidates = buildLogoCandidates(racha);
              const attemptIndex = logoAttemptIndex[racha.tenantId] ?? 0;
              const logoUrl = logoCandidates[attemptIndex] || null;
              const initials = getTenantInitials(racha.tenantName);

              return (
                <div
                  key={racha.tenantId}
                  data-testid={`admin-hub-card-${racha.tenantSlug}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`Logo do ${racha.tenantName}`}
                          className="h-12 w-12 rounded-xl object-cover"
                          onError={() => {
                            if (attemptIndex >= logoCandidates.length - 1) {
                              setLogoAttemptIndex((prev) => ({
                                ...prev,
                                [racha.tenantId]: logoCandidates.length,
                              }));
                              return;
                            }
                            setLogoAttemptIndex((prev) => ({
                              ...prev,
                              [racha.tenantId]: attemptIndex + 1,
                            }));
                          }}
                        />
                      ) : (
                        <div
                          aria-label={`Sem logo cadastrada para ${racha.tenantName}`}
                          title="Sem logo cadastrada para este racha"
                          className="h-12 w-12 rounded-xl border border-white/15 bg-white/10 text-brand-soft font-bold text-sm flex items-center justify-center"
                        >
                          {initials}
                        </div>
                      )}
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
                    {blocked ? (
                      <span className="inline-flex rounded-full border border-red-400/30 bg-red-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200">
                        Bloqueado
                      </span>
                    ) : null}
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

                  <button
                    type="button"
                    data-testid={`admin-hub-select-${racha.tenantSlug}`}
                    disabled={isSelecting}
                    onClick={() => handleSelect(racha)}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      blocked
                        ? "border border-red-400/40 text-red-200 hover:border-red-300"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}
                  >
                    {isSelecting ? "Entrando..." : blocked ? "Ver status" : "Acessar painel"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
