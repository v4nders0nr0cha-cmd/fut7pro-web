"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import ImageCropperModal from "@/components/ImageCropperModal";
import { slugify } from "@/utils/slugify";

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const BENEFITS = [
  {
    title: "100% multi-tenant",
    description: "Site publico exclusivo por racha via slug.",
  },
  {
    title: "Logo dinamica",
    description: "Aplicada no painel e no site publico.",
  },
  {
    title: "Perfil pronto",
    description: "Presidente com posicao e apelido.",
  },
  {
    title: "Slug publico",
    description: "https://app.fut7pro.com.br/<slug>",
  },
];

const SLUG_REGEX = /^[a-z0-9-]{3,30}$/;
const RESERVED_SLUGS = new Set([
  "admin",
  "superadmin",
  "superadmin-auth",
  "api",
  "auth",
  "login",
  "cadastrar-racha",
  "public",
  "images",
  "img",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "_next",
  "health",
  "revalidate",
  "app",
  "www",
]);

type UploadTarget = "logo" | "avatar";
type Step = 1 | 2;
type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "invalid" | "error";

type FieldErrors = Partial<{
  adminNome: string;
  adminApelido: string;
  adminPosicao: string;
  adminEmail: string;
  adminSenha: string;
  adminConfirmSenha: string;
  rachaNome: string;
  rachaSlug: string;
  cidade: string;
  estado: string;
}>;

export default function CadastroRachaPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isGoogle = (session?.user as any)?.authProvider === "google";
  const googleEmail = (session?.user as any)?.email as string | undefined;

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [adminNome, setAdminNome] = useState("");
  const [adminApelido, setAdminApelido] = useState("");
  const [adminPosicao, setAdminPosicao] = useState<string>(POSICOES[0]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [adminConfirmSenha, setAdminConfirmSenha] = useState("");
  const [adminAvatar, setAdminAvatar] = useState<string>();

  const [rachaNome, setRachaNome] = useState("");
  const [rachaSlug, setRachaSlug] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [rachaLogo, setRachaLogo] = useState<string>();

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [defineSenha, setDefineSenha] = useState(false);
  const [showAdminUploads, setShowAdminUploads] = useState(false);
  const [showRachaUploads, setShowRachaUploads] = useState(false);

  const [cropImage, setCropImage] = useState<string>();
  const [cropTarget, setCropTarget] = useState<UploadTarget | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");

  const slugSugerido = useMemo(() => {
    if (!rachaNome) return "";
    return slugify(rachaNome).slice(0, 30);
  }, [rachaNome]);

  useEffect(() => {
    if (!slugEdited) {
      setRachaSlug(slugSugerido);
    }
  }, [slugEdited, slugSugerido]);

  useEffect(() => {
    const slug = rachaSlug.trim().toLowerCase();
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    if (!SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/slug?value=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        const data = await res.json().catch(() => null);
        if (!data || typeof data.available !== "boolean") {
          setSlugStatus("error");
          return;
        }
        setSlugStatus(data.available ? "available" : "unavailable");
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setSlugStatus("error");
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [rachaSlug]);

  useEffect(() => {
    if (!isGoogle) return;
    const googleEmail = (session?.user as any)?.email as string | undefined;
    const googleName = (session?.user as any)?.name as string | undefined;
    if (googleEmail && adminEmail !== googleEmail) {
      setAdminEmail(googleEmail);
    }
    if (googleName && !adminNome) {
      setAdminNome(googleName.split(" ")[0]);
    }
  }, [adminEmail, adminNome, isGoogle, session?.user]);

  useEffect(() => {
    if (!defineSenha && isGoogle) {
      setAdminSenha("");
      setAdminConfirmSenha("");
    }
  }, [defineSenha, isGoogle]);

  const slugInfo = useMemo(() => {
    if (!rachaSlug) {
      return { text: "Use letras minusculas, numeros e hifen (3-30).", tone: "muted" };
    }
    if (slugStatus === "checking") {
      return { text: "Verificando disponibilidade...", tone: "muted" };
    }
    if (slugStatus === "available") {
      return { text: "Slug disponivel.", tone: "success" };
    }
    if (slugStatus === "unavailable") {
      return { text: "Slug indisponivel.", tone: "error" };
    }
    if (slugStatus === "invalid") {
      return { text: "Slug invalido ou reservado.", tone: "error" };
    }
    if (slugStatus === "error") {
      return { text: "Nao foi possivel verificar agora.", tone: "warning" };
    }
    return { text: "", tone: "muted" };
  }, [rachaSlug, slugStatus]);

  async function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>, target: UploadTarget) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isTooBig = file.size > 1_000_000;
    if (!isImage || isTooBig) {
      setFormError("Envie uma imagem PNG ou JPG de ate 1MB.");
      return;
    }
    try {
      const base64 = await toBase64(file);
      setCropImage(base64);
      setCropTarget(target);
      setFormError("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao processar a imagem");
    }
  }

  function buildStep1Errors(): FieldErrors {
    const nextErrors: FieldErrors = {};
    const nome = adminNome.trim();
    if (!nome) nextErrors.adminNome = "Informe o primeiro nome.";
    if (nome && nome.split(" ").length > 1) nextErrors.adminNome = "Use apenas o primeiro nome.";
    if (nome && nome.length > 10) nextErrors.adminNome = "Maximo de 10 caracteres.";
    if (adminApelido.trim().length > 10) nextErrors.adminApelido = "Maximo de 10 caracteres.";
    if (!adminPosicao) nextErrors.adminPosicao = "Selecione a posicao.";
    if (!adminEmail.trim()) nextErrors.adminEmail = "Informe o e-mail.";
    const wantsPassword = !isGoogle || defineSenha || adminSenha || adminConfirmSenha;
    if (wantsPassword) {
      if (!adminSenha || adminSenha.length < 6) nextErrors.adminSenha = "Minimo de 6 caracteres.";
      if (adminSenha !== adminConfirmSenha)
        nextErrors.adminConfirmSenha = "As senhas nao conferem.";
    }
    return nextErrors;
  }

  function buildStep2Errors(): FieldErrors {
    const nextErrors: FieldErrors = {};
    if (!rachaNome.trim() || rachaNome.trim().length < 3)
      nextErrors.rachaNome = "Nome minimo de 3 caracteres.";
    const slug = rachaSlug.trim().toLowerCase();
    if (!slug) {
      nextErrors.rachaSlug = "Informe o slug.";
    } else if (!SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
      nextErrors.rachaSlug = "Slug invalido ou reservado.";
    } else if (slugStatus === "unavailable") {
      nextErrors.rachaSlug = "Slug indisponivel.";
    } else if (slugStatus === "checking") {
      nextErrors.rachaSlug = "Aguarde a verificacao.";
    } else if (slugStatus === "error") {
      nextErrors.rachaSlug = "Nao foi possivel verificar agora.";
    }
    if (!cidade.trim()) nextErrors.cidade = "Informe a cidade.";
    if (!estado.trim()) nextErrors.estado = "Selecione o estado.";
    return nextErrors;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleRegister() {
    setIsLoading(true);
    try {
      const endpoint = isGoogle ? "/api/admin/register-google" : "/api/admin/register";
      const payload = {
        rachaNome: rachaNome.trim(),
        rachaSlug: rachaSlug.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        rachaLogoBase64: rachaLogo,
        adminNome: adminNome.trim(),
        adminApelido: adminApelido.trim() || undefined,
        adminPosicao,
        adminEmail: adminEmail.trim(),
        adminSenha: adminSenha || undefined,
        adminAvatarBase64: adminAvatar,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = body?.message || "Erro ao cadastrar. Tente novamente.";
        setFormError(msg);
        return;
      }

      if (isGoogle && body?.accessToken) {
        await signIn("credentials", {
          redirect: false,
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
          tenantSlug: body.tenantSlug,
          tenantId: body.tenantId,
          role: body.role,
          name: adminNome.trim(),
          email: adminEmail.trim(),
          authProvider: "google",
        });
        setSucesso("Racha criado! Redirecionando para o painel...");
        setTimeout(() => router.push("/admin/dashboard"), 800);
        return;
      }

      setSucesso("Cadastro realizado! Agora faca login para acessar o painel.");
      setTimeout(() => router.push("/admin/login"), 1200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePrimaryAction() {
    setFormError("");
    setSucesso("");

    if (step === 1) {
      const stepErrors = buildStep1Errors();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(2);
      return;
    }

    const step1Errors = buildStep1Errors();
    const step2Errors = buildStep2Errors();
    const nextErrors = { ...step1Errors, ...step2Errors };
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(Object.keys(step1Errors).length > 0 ? 1 : 2);
      return;
    }

    setErrors({});
    await handleRegister();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void handlePrimaryAction();
  }

  const slugToneClass =
    slugInfo.tone === "success"
      ? "text-emerald-300"
      : slugInfo.tone === "error"
        ? "text-red-300"
        : slugInfo.tone === "warning"
          ? "text-yellow-300"
          : "text-gray-400";

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 lg:flex-row lg:gap-10 pb-24 sm:pb-10">
      <section className="order-1 w-full lg:order-2 lg:w-[460px]">
        <div className="rounded-2xl bg-[#0f1118] border border-[#1c2030] shadow-2xl p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.25em] text-yellow-300 font-semibold">
                Etapa {step} de 2
              </div>
              <h1 className="text-2xl font-bold text-white lg:hidden">Cadastre seu racha</h1>
              <p className="text-sm text-gray-400 lg:hidden">Leva menos de 2 min.</p>
            </div>
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-yellow-300 underline"
              >
                Voltar
              </button>
            )}
          </div>

          <div className="mt-4 h-1 w-full rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-yellow-400 transition-all ${
                step === 1 ? "w-1/2" : "w-full"
              }`}
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/cadastrar-racha?google=1" })}
                    disabled={sessionStatus === "loading" || isGoogle}
                    className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                      isGoogle
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white hover:border-white/20"
                    }`}
                  >
                    {isGoogle ? "Google conectado" : "Continuar com Google"}
                  </button>
                  {isGoogle ? (
                    <p className="text-xs text-emerald-200 text-center">
                      Conectado como {googleEmail}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 text-center">
                      Use sua conta Google para entrar sem senha.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-white">Conta do presidente</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs text-gray-400">
                      Primeiro nome *
                      <input
                        type="text"
                        value={adminNome}
                        onChange={(e) => {
                          setAdminNome(e.target.value);
                          clearError("adminNome");
                        }}
                        maxLength={10}
                        autoComplete="given-name"
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      />
                      {errors.adminNome && (
                        <span className="mt-1 block text-xs text-red-300">{errors.adminNome}</span>
                      )}
                    </label>
                    <label className="text-xs text-gray-400">
                      Apelido (opcional)
                      <input
                        type="text"
                        value={adminApelido}
                        onChange={(e) => {
                          setAdminApelido(e.target.value);
                          clearError("adminApelido");
                        }}
                        maxLength={10}
                        autoComplete="nickname"
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      {errors.adminApelido && (
                        <span className="mt-1 block text-xs text-red-300">
                          {errors.adminApelido}
                        </span>
                      )}
                    </label>
                    <label className="text-xs text-gray-400">
                      Posicao *
                      <select
                        value={adminPosicao}
                        onChange={(e) => {
                          setAdminPosicao(e.target.value);
                          clearError("adminPosicao");
                        }}
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      >
                        {POSICOES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {errors.adminPosicao && (
                        <span className="mt-1 block text-xs text-red-300">
                          {errors.adminPosicao}
                        </span>
                      )}
                    </label>
                    <label className="text-xs text-gray-400">
                      E-mail *
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          clearError("adminEmail");
                        }}
                        readOnly={isGoogle}
                        autoCapitalize="none"
                        autoComplete="email"
                        inputMode="email"
                        spellCheck={false}
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      />
                      {errors.adminEmail && (
                        <span className="mt-1 block text-xs text-red-300">{errors.adminEmail}</span>
                      )}
                    </label>
                  </div>
                  {isGoogle && !defineSenha ? (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-xs text-gray-300">
                      <div className="flex items-center justify-between gap-3">
                        <span>Senha opcional para login por e-mail.</span>
                        <button
                          type="button"
                          onClick={() => setDefineSenha(true)}
                          className="text-yellow-300 underline"
                        >
                          Definir senha agora
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isGoogle && (
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Senha opcional para login por e-mail.</span>
                          <button
                            type="button"
                            onClick={() => setDefineSenha(false)}
                            className="text-yellow-300 underline"
                          >
                            Remover senha
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-xs text-gray-400">
                          Senha {isGoogle ? "(opcional)" : "*"}
                          <div className="relative mt-2">
                            <input
                              type={showSenha ? "text" : "password"}
                              value={adminSenha}
                              onChange={(e) => {
                                setAdminSenha(e.target.value);
                                clearError("adminSenha");
                                clearError("adminConfirmSenha");
                              }}
                              autoComplete="new-password"
                              className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              required={!isGoogle || defineSenha}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSenha((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                            >
                              {showSenha ? "Ocultar" : "Mostrar"}
                            </button>
                          </div>
                          {errors.adminSenha && (
                            <span className="mt-1 block text-xs text-red-300">
                              {errors.adminSenha}
                            </span>
                          )}
                        </label>
                        <label className="text-xs text-gray-400">
                          Confirmar senha {isGoogle ? "(opcional)" : "*"}
                          <div className="relative mt-2">
                            <input
                              type={showConfirmSenha ? "text" : "password"}
                              value={adminConfirmSenha}
                              onChange={(e) => {
                                setAdminConfirmSenha(e.target.value);
                                clearError("adminConfirmSenha");
                              }}
                              autoComplete="new-password"
                              className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              required={!isGoogle || defineSenha}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmSenha((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                            >
                              {showConfirmSenha ? "Ocultar" : "Mostrar"}
                            </button>
                          </div>
                          {errors.adminConfirmSenha && (
                            <span className="mt-1 block text-xs text-red-300">
                              {errors.adminConfirmSenha}
                            </span>
                          )}
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
                  <button
                    type="button"
                    onClick={() => setShowAdminUploads((prev) => !prev)}
                    className="text-yellow-300 underline"
                  >
                    {showAdminUploads ? "Ocultar foto do presidente" : "Adicionar foto (opcional)"}
                  </button>
                  {showAdminUploads && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleUpload(e, "avatar")}
                        className="w-full text-xs text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer"
                      />
                      {adminAvatar && (
                        <img
                          src={adminAvatar}
                          alt="Preview do presidente"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-white">Dados do racha</h2>
                  <label className="text-xs text-gray-400">
                    Nome do racha *
                    <input
                      type="text"
                      value={rachaNome}
                      onChange={(e) => {
                        setRachaNome(e.target.value);
                        clearError("rachaNome");
                      }}
                      maxLength={50}
                      className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                    {errors.rachaNome && (
                      <span className="mt-1 block text-xs text-red-300">{errors.rachaNome}</span>
                    )}
                  </label>

                  <label className="text-xs text-gray-400">
                    Slug (ex: quarta-fc) *
                    <input
                      type="text"
                      value={rachaSlug}
                      onChange={(e) => {
                        const nextValue = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .replace(/--+/g, "-")
                          .slice(0, 30);
                        setRachaSlug(nextValue);
                        setSlugEdited(nextValue.length > 0);
                        clearError("rachaSlug");
                      }}
                      autoCapitalize="none"
                      pattern="[a-z0-9-]{3,30}"
                      spellCheck={false}
                      className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                    {errors.rachaSlug ? (
                      <span className="mt-1 block text-xs text-red-300">{errors.rachaSlug}</span>
                    ) : (
                      <span className={`mt-1 block text-xs ${slugToneClass}`}>{slugInfo.text}</span>
                    )}
                  </label>

                  <div className="text-xs text-gray-400">
                    Link publico: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs text-gray-400">
                      Cidade *
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => {
                          setCidade(e.target.value);
                          clearError("cidade");
                        }}
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      />
                      {errors.cidade && (
                        <span className="mt-1 block text-xs text-red-300">{errors.cidade}</span>
                      )}
                    </label>
                    <label className="text-xs text-gray-400">
                      Estado *
                      <select
                        value={estado}
                        onChange={(e) => {
                          setEstado(e.target.value);
                          clearError("estado");
                        }}
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      >
                        <option value="">Estado</option>
                        {ESTADOS_BR.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                      {errors.estado && (
                        <span className="mt-1 block text-xs text-red-300">{errors.estado}</span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
                  <button
                    type="button"
                    onClick={() => setShowRachaUploads((prev) => !prev)}
                    className="text-yellow-300 underline"
                  >
                    {showRachaUploads ? "Ocultar logo do racha" : "Adicionar logo (opcional)"}
                  </button>
                  {showRachaUploads && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleUpload(e, "logo")}
                        className="w-full text-xs text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 cursor-pointer"
                      />
                      {rachaLogo && (
                        <img
                          src={rachaLogo}
                          alt="Preview do logo"
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {formError && (
              <div className="rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-sm text-red-200">
                {formError}
              </div>
            )}
            {sucesso && (
              <div className="rounded-lg border border-emerald-500/60 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200">
                {sucesso}
              </div>
            )}

            <div className="hidden sm:flex items-center gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-300 hover:text-white"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {step === 1 ? "Continuar" : isLoading ? "Cadastrando..." : "Criar racha"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-300">
              Ja tem painel?{" "}
              <a href="/admin/login" className="text-yellow-300 underline hover:text-yellow-200">
                Entrar
              </a>
            </div>
          </form>
        </div>
      </section>

      <section className="order-2 w-full lg:order-1 lg:w-1/2">
        <div className="lg:sticky lg:top-8 space-y-5">
          <div className="hidden lg:block space-y-3">
            <div className="text-xs uppercase tracking-[0.25em] text-yellow-400 font-semibold">
              Experimente o Fut7Pro
            </div>
            <h1 className="text-3xl font-bold text-white">Cadastre seu racha</h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Crie seu racha e complete seu perfil. Em minutos voce entra como presidente com painel
              e site publico sincronizados.
            </p>
          </div>

          <details className="lg:hidden rounded-xl border border-[#1f2230] bg-[#151821] p-4 text-sm text-gray-300">
            <summary className="cursor-pointer font-semibold text-white">
              Por que usar o Fut7Pro?
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              {BENEFITS.map((item) => (
                <div key={item.title}>
                  <span className="font-semibold text-white">{item.title}:</span> {item.description}
                </div>
              ))}
            </div>
          </details>

          <div className="hidden lg:grid grid-cols-2 gap-3 text-sm text-gray-300">
            {BENEFITS.map((item) => (
              <div key={item.title} className="bg-[#1b1e29] border border-[#24283a] rounded-lg p-3">
                <div className="text-yellow-300 font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-gray-400 mt-1">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#0f1118]/95 px-4 py-3 backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={() => void handlePrimaryAction()}
          disabled={isLoading}
          className="w-full rounded-lg bg-yellow-400 px-4 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {step === 1 ? "Continuar" : isLoading ? "Cadastrando..." : "Criar racha"}
        </button>
      </div>

      <ImageCropperModal
        open={!!cropImage && !!cropTarget}
        imageSrc={cropImage || ""}
        aspect={1}
        shape={cropTarget === "avatar" ? "round" : "rect"}
        title={cropTarget === "logo" ? "Ajustar logo do racha" : "Ajustar foto do presidente"}
        onCancel={() => {
          setCropImage(undefined);
          setCropTarget(null);
        }}
        onApply={(cropped) => {
          if (cropTarget === "logo") setRachaLogo(cropped);
          if (cropTarget === "avatar") setAdminAvatar(cropped);
          setCropImage(undefined);
          setCropTarget(null);
        }}
      />
    </main>
  );
}
