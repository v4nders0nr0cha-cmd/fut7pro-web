"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import ImageCropperModal from "@/components/ImageCropperModal";
import type { GlobalProfileMembership, GlobalTitle } from "@/types/global-profile";
import { getStoredTenantSlug, setStoredTenantSlug } from "@/utils/active-tenant";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
type Posicao = (typeof POSICOES)[number] | "";
const POSITION_LABELS: Record<string, Posicao> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

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

function normalizePositionLabel(value?: string | null): Posicao {
  const key = String(value || "").toLowerCase();
  return POSITION_LABELS[key] ?? "";
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
  const { profile, isLoading, isError, error, updateProfile, mutate } = useGlobalProfile({
    enabled: status === "authenticated",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    nickname: "",
    position: "" as Posicao,
    positionSecondary: "" as Posicao,
    birthDay: "",
    birthMonth: "",
    birthYear: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!profile?.user) return;
    setForm({
      firstName: profile.user.name || "",
      nickname: profile.user.nickname || "",
      position: normalizePositionLabel(profile.user.position),
      positionSecondary: normalizePositionLabel(profile.user.positionSecondary),
      birthDay: profile.user.birthDay ? String(profile.user.birthDay) : "",
      birthMonth: profile.user.birthMonth ? String(profile.user.birthMonth) : "",
      birthYear: profile.user.birthYear ? String(profile.user.birthYear) : "",
    });
    setAvatarPreview(profile.user.avatarUrl || DEFAULT_AVATAR);
    setAvatarFile(null);
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

  useEffect(() => {
    const stored = getStoredTenantSlug();
    if (stored) {
      setCurrentSlug(stored);
    }
  }, []);

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

  const hasPassword = Boolean(user?.hasPassword);
  const resolvedCurrentSlug =
    currentSlug || (membershipList.length === 1 ? membershipList[0]?.tenantSlug : null);

  function dataUrlToFile(dataUrl: string) {
    const [header, base64Data] = dataUrl.split(",");
    if (!base64Data) {
      throw new Error("Imagem invalida.");
    }
    const match = header?.match(/data:(.*);base64/);
    const mime = match?.[1] || "image/jpeg";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    if (blob.size > MAX_AVATAR_SIZE) {
      throw new Error("A imagem recortada ficou grande demais.");
    }
    const ext = mime.split("/")[1] || "jpg";
    return new File([blob], `avatar-${Date.now()}.${ext}`, { type: mime });
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setFormError("Envie uma imagem com ate 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropImage(String(reader.result));
    reader.onerror = () => setFormError("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  }

  async function handleCropApply(cropped: string) {
    try {
      const file = dataUrlToFile(cropped);
      setAvatarFile(file);
      setAvatarPreview(cropped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao preparar a imagem.";
      setFormError(message);
    } finally {
      setCropImage(null);
    }
  }

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = form.firstName.trim();
    if (!trimmedName) {
      setFormError("Informe o primeiro nome.");
      return;
    }
    if (trimmedName.length > 10) {
      setFormError("Nome com maximo de 10 letras.");
      return;
    }
    if (form.nickname.trim().length > 10) {
      setFormError("Apelido com maximo de 10 letras.");
      return;
    }
    if (!form.position) {
      setFormError("Selecione a posicao principal.");
      return;
    }
    if (form.positionSecondary && form.positionSecondary === form.position) {
      setFormError("Posicao secundaria nao pode ser igual a principal.");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess(false);

    try {
      let avatarUrl = user.avatarUrl ?? null;
      if (avatarFile) {
        const uploadSlug = resolvedCurrentSlug || membershipList[0]?.tenantSlug;
        if (!uploadSlug) {
          throw new Error("Nao foi possivel identificar o racha para enviar a foto.");
        }
        const formData = new FormData();
        formData.set("file", avatarFile);
        const uploadRes = await fetch("/api/uploads/avatar", {
          method: "POST",
          headers: {
            "x-tenant-slug": uploadSlug,
          },
          body: formData,
        });
        const uploadBody = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok) {
          throw new Error(uploadBody?.message || uploadBody?.error || "Falha ao enviar a foto.");
        }
        avatarUrl = uploadBody?.url || avatarUrl;
      }

      await updateProfile({
        firstName: trimmedName,
        nickname: form.nickname.trim() || null,
        avatarUrl,
        position: form.position || undefined,
        positionSecondary: form.positionSecondary || null,
        birthDay: toOptionalInt(form.birthDay),
        birthMonth: toOptionalInt(form.birthMonth),
        birthYear: toOptionalInt(form.birthYear),
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
      setStoredTenantSlug(membership.tenantSlug);
      router.push(`/${membership.tenantSlug}`);
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
            const isCurrent =
              Boolean(resolvedCurrentSlug) && membership.tenantSlug === resolvedCurrentSlug;
            const canSwitch = membership.status === "APROVADO" && !isCurrent;
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

                {isCurrent ? (
                  <span className="mt-auto inline-flex items-center justify-center rounded-full border border-brand/40 px-4 py-2 text-xs font-semibold text-brand-soft">
                    Racha atual
                  </span>
                ) : (
                  <button
                    onClick={() => handleSwitch(membership)}
                    disabled={!canSwitch || isSwitching}
                    className="mt-auto w-full rounded-full bg-brand text-black font-semibold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSwitching ? "Trocando..." : "Trocar para este racha"}
                  </button>
                )}
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
          <h2 className="text-lg font-bold text-white mb-4">Perfil Global</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-max">
              <img
                src={avatarPreview || DEFAULT_AVATAR}
                alt="Foto do perfil"
                width={120}
                height={120}
                className="rounded-full border-2 border-brand object-cover"
                onError={() => setAvatarPreview(DEFAULT_AVATAR)}
              />
              <label className="absolute -bottom-2 right-0 cursor-pointer rounded-full bg-brand px-2 py-1 text-[10px] font-bold text-black shadow">
                Alterar foto
                <input
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                />
              </label>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-zinc-300">
                Nome *
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  maxLength={10}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-zinc-300">
                Apelido
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, nickname: event.target.value }))
                  }
                  maxLength={10}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-zinc-300">
                Posicao principal *
                <select
                  value={form.position}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, position: event.target.value as Posicao }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                >
                  <option value="">Selecione</option>
                  {POSICOES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-zinc-300">
                Posicao secundaria
                <select
                  value={form.positionSecondary}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      positionSecondary: event.target.value as Posicao,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                >
                  <option value="">Nenhuma</option>
                  {POSICOES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
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
          <h2 className="text-lg font-bold text-white">Senha e Seguranca</h2>
          <p className="text-sm text-zinc-400">
            Gerencie sua senha e metodos de login sem impactar os dados do perfil global.
          </p>
          <div className="space-y-2 text-sm text-zinc-300">
            <div>
              <span className="text-zinc-400">Email verificado:</span>{" "}
              {user.emailVerified ? "Sim" : "Nao"}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-zinc-400">Metodos:</span>
              {hasPassword && (
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                  Email/Senha
                </span>
              )}
              {providerLabel === "Google" && (
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                  Google
                </span>
              )}
            </div>
          </div>

          {!securityExpanded ? (
            <button
              type="button"
              onClick={() => setSecurityExpanded(true)}
              className="w-full rounded-full bg-white/10 text-white font-semibold py-2 hover:bg-white/20 transition"
            >
              Deseja trocar sua senha?
            </button>
          ) : (
            <div className="space-y-3">
              {hasPassword && (
                <label className="text-sm text-zinc-300">
                  Senha atual
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                  />
                </label>
              )}
              <label className="text-sm text-zinc-300">
                Nova senha
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-zinc-300">
                Confirmar nova senha
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-white"
                />
              </label>

              {securityError && <div className="text-sm text-red-300">{securityError}</div>}
              {securitySuccess && <div className="text-sm text-green-300">{securitySuccess}</div>}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setSecurityError("");
                    setSecuritySuccess("");
                    if (!newPassword || newPassword.length < 6) {
                      setSecurityError("A senha deve ter ao menos 6 caracteres.");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setSecurityError("A confirmacao da senha nao confere.");
                      return;
                    }
                    if (hasPassword && !currentPassword) {
                      setSecurityError("Informe a senha atual.");
                      return;
                    }
                    setSecurityLoading(true);
                    try {
                      const endpoint = hasPassword
                        ? "/api/perfil/security/change-password"
                        : "/api/perfil/security/set-password";
                      const payload = hasPassword
                        ? { currentPassword, newPassword }
                        : { newPassword };
                      const res = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const body = await res.json().catch(() => null);
                      if (!res.ok) {
                        throw new Error(
                          body?.message || body?.error || "Falha ao atualizar senha."
                        );
                      }
                      await mutate();
                      setSecuritySuccess(
                        hasPassword ? "Senha alterada com sucesso." : "Senha criada."
                      );
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    } catch (err) {
                      setSecurityError(
                        err instanceof Error ? err.message : "Falha ao atualizar senha."
                      );
                    } finally {
                      setSecurityLoading(false);
                    }
                  }}
                  disabled={securityLoading}
                  className="w-full rounded-full bg-brand text-black font-semibold py-2 disabled:opacity-60"
                >
                  {securityLoading ? "Salvando..." : hasPassword ? "Alterar senha" : "Criar senha"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityExpanded(false);
                    setSecurityError("");
                    setSecuritySuccess("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full rounded-full border border-white/10 text-white py-2 hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <ImageCropperModal
        open={!!cropImage}
        imageSrc={cropImage || ""}
        aspect={1}
        shape="round"
        title="Ajustar foto do perfil"
        onCancel={() => setCropImage(null)}
        onApply={handleCropApply}
      />
    </div>
  );
}
