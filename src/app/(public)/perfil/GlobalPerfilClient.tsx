"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import type { GlobalProfileMembership, GlobalTitle } from "@/types/global-profile";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Administrador",
  ATLETA: "Atleta",
};

const STATUS_LABELS: Record<string, string> = {
  APROVADO: "Ativo",
  PENDENTE: "Pendente",
  SUSPENSO: "Suspenso",
  REJEITADO: "Rejeitado",
};

const PLAN_STATUS_LABELS: Record<string, string> = {
  ATIVO: "Plano ativo",
  ALERTA: "Pagamento pendente",
  BLOQUEADO: "Bloqueado",
};

function normalizeRoleLabel(role?: string | null) {
  const key = String(role || "").toUpperCase();
  return ROLE_LABELS[key] ?? role ?? "Atleta";
}

function normalizeStatusLabel(status?: string | null) {
  const key = String(status || "").toUpperCase();
  return STATUS_LABELS[key] ?? status ?? "Pendente";
}

function normalizePlanLabel(status?: string | null) {
  const key = String(status || "").toUpperCase();
  return PLAN_STATUS_LABELS[key] ?? status ?? "Sem plano";
}

function toOptionalInt(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function renderConquistaItem(item: GlobalTitle) {
  const quadrimestre = typeof item.quadrimestre === "number" ? `Q${item.quadrimestre}` : null;
  return (
    <li key={`${item.tenantId}-${item.descricao}-${item.ano}-${quadrimestre || ""}`}>
      <div className="text-sm text-white font-semibold">
        {item.descricao} {quadrimestre ? `(${quadrimestre})` : ""} ({item.ano})
      </div>
      <div className="text-xs text-zinc-400">{item.tenantName}</div>
    </li>
  );
}

function ConquistasLista({ titulo, items }: { titulo: string; items: GlobalTitle[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="text-sm uppercase tracking-[0.2em] text-brand-soft mb-3">{titulo}</div>
      {items.length ? (
        <ul className="space-y-3">{items.map(renderConquistaItem)}</ul>
      ) : (
        <p className="text-sm text-zinc-400">Nenhuma conquista registrada.</p>
      )}
    </div>
  );
}

export default function GlobalPerfilClient() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, isLoading, isError, error, updateProfile } = useGlobalProfile({
    enabled: status === "authenticated",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    nickname: "",
    avatarUrl: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    cidadeNome: "",
    estadoUf: "",
  });

  useEffect(() => {
    if (!profile?.user) return;
    setForm({
      firstName: profile.user.name || "",
      nickname: profile.user.nickname || "",
      avatarUrl: profile.user.avatarUrl || "",
      birthDay: profile.user.birthDay ? String(profile.user.birthDay) : "",
      birthMonth: profile.user.birthMonth ? String(profile.user.birthMonth) : "",
      birthYear: profile.user.birthYear ? String(profile.user.birthYear) : "",
      cidadeNome: profile.user.cidadeNome || "",
      estadoUf: profile.user.estadoUf || "",
    });
  }, [profile?.user]);

  useEffect(() => {
    const target = searchParams?.get("tab");
    if (target === "rachas") {
      const el = document.getElementById("meus-rachas");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [searchParams]);

  const stats = profile?.stats;
  const totalTitulos = profile?.totalTitulos ?? 0;
  const membershipList = profile?.memberships ?? [];
  const user = profile?.user;

  const providerLabel = useMemo(() => {
    const raw = String(user?.authProvider || "").toLowerCase();
    if (raw === "google") return "Google";
    if (raw) return raw;
    return "E-mail/Senha";
  }, [user?.authProvider]);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = form.firstName.trim();
    if (!trimmedName) {
      setFormError("Informe o primeiro nome.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess(false);

    try {
      await updateProfile({
        firstName: trimmedName,
        nickname: form.nickname.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        birthDay: toOptionalInt(form.birthDay),
        birthMonth: toOptionalInt(form.birthMonth),
        birthYear: toOptionalInt(form.birthYear),
        cidadeNome: form.cidadeNome.trim() || null,
        estadoUf: form.estadoUf.trim().toUpperCase() || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1600);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleSwitch = async (membership: GlobalProfileMembership) => {
    if (!membership?.tenantSlug) return;
    if (membership.status !== "APROVADO") return;

    setSwitchingSlug(membership.tenantSlug);
    try {
      const res = await fetch("/api/rachas/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: membership.tenantSlug }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || body?.error || "Falha ao trocar racha.");
      }
      const redirectTo = body?.redirectTo || `/${membership.tenantSlug}/perfil`;
      router.push(redirectTo);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Falha ao trocar racha.");
    } finally {
      setSwitchingSlug(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-gray-300">
        Carregando perfil global...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16 text-gray-200">
        <h1 className="sr-only">Perfil Global Fut7Pro</h1>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-8 text-center">
          <p className="text-lg font-semibold text-white mb-3">Voce precisa entrar.</p>
          <p className="text-sm text-zinc-400 mb-6">
            Acesse sua conta Fut7Pro pelo painel admin ou pelo link do seu racha.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/admin/login"
              className="px-5 py-2 rounded-full bg-brand text-black font-semibold"
            >
              Entrar como admin
            </a>
            <span className="text-xs text-zinc-400 sm:self-center">
              Use /{`{slug}`}/login para entrar como atleta
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile || !user) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-red-200">
        Nao foi possivel carregar o perfil global. {error || "Tente novamente mais tarde."}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20">
      <h1 className="sr-only">Perfil Global Fut7Pro</h1>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Image
                src={user.avatarUrl || DEFAULT_AVATAR}
                alt={user.name}
                width={96}
                height={96}
                className="rounded-full border-2 border-brand object-cover"
              />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-brand-soft">
                Perfil Global
              </div>
              <h2 className="text-3xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-zinc-400">{user.email || "Email nao informado"}</p>
              {user.nickname ? (
                <p className="text-sm text-brand-soft mt-1">Apelido: {user.nickname}</p>
              ) : null}
            </div>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Jogos", value: stats?.jogos ?? 0 },
              { label: "Vitorias", value: stats?.vitorias ?? 0 },
              { label: "Empates", value: stats?.empates ?? 0 },
              { label: "Derrotas", value: stats?.derrotas ?? 0 },
              { label: "Gols", value: stats?.gols ?? 0 },
              { label: "Assistencias", value: stats?.assistencias ?? 0 },
              { label: "Pontos", value: stats?.pontos ?? 0 },
              { label: "Titulos", value: totalTitulos },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-center"
              >
                <div className="text-xl font-bold text-brand">{item.value}</div>
                <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="meus-rachas" className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Meus Rachas</h2>
          <span className="text-xs text-zinc-400">{membershipList.length} rachas</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {membershipList.map((membership) => {
            const roleLabel = normalizeRoleLabel(membership.role);
            const statusLabel = normalizeStatusLabel(membership.status);
            const planLabel = normalizePlanLabel(membership.subscription?.status || null);
            const canSwitch = membership.status === "APROVADO";
            const isSwitching = switchingSlug === membership.tenantSlug;
            return (
              <div
                key={membership.tenantId}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={membership.logoUrl || "/images/logos/logo_fut7pro.png"}
                    alt={membership.tenantName}
                    width={48}
                    height={48}
                    className="rounded-xl border border-white/10 bg-black/20 object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-white">{membership.tenantName}</div>
                    <div className="text-xs text-zinc-400">/{membership.tenantSlug}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-zinc-300">
                    {roleLabel}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span>Status: {statusLabel}</span>
                  <span>Plano: {planLabel}</span>
                  {membership.isAdmin ? <span>Acesso admin</span> : <span>Atleta</span>}
                </div>

                <button
                  onClick={() => handleSwitch(membership)}
                  disabled={!canSwitch || isSwitching}
                  className="mt-auto w-full rounded-full bg-brand text-black font-semibold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwitching ? "Trocando..." : "Trocar para este racha"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Conquistas Globais</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ConquistasLista
            titulo="Grandes Torneios"
            items={profile.conquistas.titulosGrandesTorneios}
          />
          <ConquistasLista titulo="Titulos Anuais" items={profile.conquistas.titulosAnuais} />
          <ConquistasLista
            titulo="Titulos Quadrimestrais"
            items={profile.conquistas.titulosQuadrimestrais}
          />
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Configuracoes da conta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-300">
              Nome
              <input
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Apelido
              <input
                type="text"
                value={form.nickname}
                onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Foto (URL)
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Cidade
              <input
                type="text"
                value={form.cidadeNome}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cidadeNome: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Estado (UF)
              <input
                type="text"
                value={form.estadoUf}
                onChange={(event) => setForm((prev) => ({ ...prev, estadoUf: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white uppercase"
                maxLength={2}
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-sm text-zinc-300">
                Dia
                <input
                  type="number"
                  value={form.birthDay}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, birthDay: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-zinc-300">
                Mes
                <input
                  type="number"
                  value={form.birthMonth}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, birthMonth: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-zinc-300">
                Ano
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, birthYear: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
            </div>
          </div>
          {formError && <div className="mt-4 text-sm text-red-300">{formError}</div>}
          {success && <div className="mt-4 text-sm text-green-300">Dados salvos.</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 rounded-full bg-brand text-black font-semibold px-6 py-2 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar dados globais"}
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Seguranca & Providers</h2>
          <div className="space-y-2 text-sm text-zinc-300">
            <div>
              <span className="text-zinc-400">Email verificado:</span>{" "}
              {user.emailVerified ? "Sim" : "Nao"}
            </div>
            <div>
              <span className="text-zinc-400">Provider:</span> {providerLabel}
            </div>
            <div>
              <span className="text-zinc-400">Ultima verificacao:</span>{" "}
              {user.emailVerifiedAt || "Nao informado"}
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Para alterar senha ou metodos de login, use o fluxo de seguranca do painel.
          </div>
        </div>
      </section>
    </div>
  );
}
