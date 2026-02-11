"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import ImageCropperModal from "@/components/ImageCropperModal";
import type { PlanCatalog } from "@/lib/api/billing";
import { slugify } from "@/utils/slugify";
import { UF_LIST } from "@/data/br/ufs";
import { loadCitiesByUf, type CityOption } from "@/data/br/cidades";

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;

const BENEFITS = [
  {
    title: "100% multi-tenant",
    description: "Site público exclusivo por racha via slug.",
  },
  {
    title: "Logo dinâmica",
    description: "Aplicada no painel e no site público.",
  },
  {
    title: "Perfil pronto",
    description: "Presidente com posição e apelido.",
  },
  {
    title: "Slug público",
    description: "https://app.fut7pro.com.br/<slug>",
  },
];

const PLAN_MICRO_COPY: Record<
  string,
  { title?: string; blurb: string; bullets: string[]; marketingNote?: string }
> = {
  monthly_essential: {
    title: "Mensal Essencial",
    blurb: "Controle total do racha, com menos esforço e mais organização.",
    bullets: [
      "Sorteio inteligente e rankings automáticos",
      "Finanças e patrocínios organizados no site",
      "Painel completo para administrar o racha",
    ],
  },
  monthly_marketing: {
    title: "Mensal + Marketing",
    blurb: "Para rachas que querem crescer e monetizar com apoio profissional.",
    bullets: [
      "Tudo do Essencial",
      "Designers Fut7Pro para artes e kit patrocinador",
      "Apoio profissional para Instagram e identidade visual",
    ],
    marketingNote: "Serviços de marketing começam após o primeiro pagamento.",
  },
  yearly_essential: {
    title: "Anual Essencial",
    blurb: "Controle total do racha, com menos esforço e mais organização.",
    bullets: [
      "Sorteio inteligente e rankings automáticos",
      "Finanças e patrocínios organizados no site",
      "Painel completo para administrar o racha",
    ],
  },
  yearly_marketing: {
    title: "Anual + Marketing",
    blurb: "Para rachas que querem crescer e monetizar com apoio profissional.",
    bullets: [
      "Tudo do Essencial",
      "Designers Fut7Pro para artes e kit patrocinador",
      "Apoio profissional para Instagram e identidade visual",
    ],
    marketingNote: "Serviços de marketing começam após o primeiro pagamento.",
  },
};

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
type Step = 1 | 2 | 3;
type AccessFlow = "identify" | "existing-password" | "wizard";
type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "invalid" | "error";
type BillingInterval = "month" | "year";
type CouponStatus = "idle" | "loading" | "valid" | "invalid" | "error";
type LookupEmailResponse = {
  exists?: boolean;
  userExists?: boolean;
  providers?: string[];
  hasPassword?: boolean;
  availableAuthMethods?: Array<"google" | "password">;
  error?: string;
  message?: string;
};

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

const normalizeCityValue = (value: string) => value.replace(/\s+/g, " ").trim();
const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const resolveFirstName = (value?: string | null) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  const first = raw.split(/\s+/)[0] || "";
  return first.slice(0, 10);
};

const resolveFirstNameFromEmail = (email?: string | null) => {
  const local = (email || "").split("@")[0] || "";
  const normalized = local.replace(/[._-]+/g, " ").trim();
  return resolveFirstName(normalized);
};

function CadastroRachaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const isGoogle = (session?.user as any)?.authProvider === "google";
  const googleIntent = searchParams.get("google") === "1";
  const handledGoogleIntentRef = useRef(false);

  const [step, setStep] = useState<Step>(1);
  const [accessFlow, setAccessFlow] = useState<AccessFlow>("identify");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useExistingGlobalAccount, setUseExistingGlobalAccount] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [existingHasPassword, setExistingHasPassword] = useState(true);
  const [existingLoginLoading, setExistingLoginLoading] = useState(false);
  const [existingLoginError, setExistingLoginError] = useState("");
  const [showExistingSenha, setShowExistingSenha] = useState(false);

  const [adminNome, setAdminNome] = useState("");
  const [adminNomeTouched, setAdminNomeTouched] = useState(false);
  const [adminApelido, setAdminApelido] = useState("");
  const [adminPosicao, setAdminPosicao] = useState<string>(POSICOES[0]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminSenha, setAdminSenha] = useState("");
  const [adminConfirmSenha, setAdminConfirmSenha] = useState("");
  const [adminAvatar, setAdminAvatar] = useState<string>();

  const [rachaNome, setRachaNome] = useState("");
  const [rachaSlug, setRachaSlug] = useState("");
  const [cidadeNome, setCidadeNome] = useState("");
  const [cidadeIbgeCode, setCidadeIbgeCode] = useState("");
  const [estadoUf, setEstadoUf] = useState("");
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

  const [planCatalog, setPlanCatalog] = useState<PlanCatalog | null>(null);
  const [planInterval, setPlanInterval] = useState<BillingInterval>("month");
  const [selectedPlanKey, setSelectedPlanKey] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");
  const [couponBenefits, setCouponBenefits] = useState<{
    extraTrialDays: number;
    firstPaymentDiscountPercent: number;
  } | null>(null);
  const [cidadeOptions, setCidadeOptions] = useState<CityOption[]>([]);
  const [cidadeFilter, setCidadeFilter] = useState("");
  const [cidadeLoading, setCidadeLoading] = useState(false);

  const slugSugerido = useMemo(() => {
    if (!rachaNome) return "";
    return slugify(rachaNome).slice(0, 30);
  }, [rachaNome]);

  const filteredCities = useMemo(() => {
    if (!cidadeFilter.trim()) return cidadeOptions;
    const term = normalizeSearch(cidadeFilter);
    return cidadeOptions.filter((city) => normalizeSearch(city.nome).includes(term));
  }, [cidadeFilter, cidadeOptions]);

  useEffect(() => {
    if (!slugEdited) {
      setRachaSlug(slugSugerido);
    }
  }, [slugEdited, slugSugerido]);

  useEffect(() => {
    let active = true;
    setCidadeNome("");
    setCidadeIbgeCode("");
    setCidadeFilter("");
    setCidadeOptions([]);

    const uf = estadoUf.trim().toUpperCase();
    if (!uf) {
      setCidadeLoading(false);
      return;
    }

    setCidadeLoading(true);
    loadCitiesByUf(uf)
      .then((cities) => {
        if (!active) return;
        setCidadeOptions(cities);
      })
      .catch(() => {
        if (!active) return;
        setCidadeOptions([]);
      })
      .finally(() => {
        if (!active) return;
        setCidadeLoading(false);
      });

    return () => {
      active = false;
    };
  }, [estadoUf]);

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
    let active = true;
    setPlanLoading(true);
    setPlanError("");

    const loadPlans = async () => {
      try {
        const res = await fetch("/api/public/plans/catalog", { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          if (active) {
            setPlanError(text || "Nao foi possivel carregar os planos.");
          }
          return;
        }
        const data = (await res.json()) as PlanCatalog;
        if (active) {
          setPlanCatalog(data);
        }
      } catch {
        if (active) {
          setPlanError("Nao foi possivel carregar os planos.");
        }
      } finally {
        if (active) {
          setPlanLoading(false);
        }
      }
    };

    void loadPlans();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isGoogle) return;
    const googleEmailInner = (session?.user as any)?.email as string | undefined;
    const googleName = (session?.user as any)?.name as string | undefined;
    if (googleEmailInner && adminEmail !== googleEmailInner) {
      setAdminEmail(googleEmailInner);
    }
    if (googleEmailInner && lookupEmail !== googleEmailInner) {
      setLookupEmail(googleEmailInner);
    }
    if (googleName && !adminNome && !adminNomeTouched) {
      setAdminNome(googleName.split(" ")[0]);
    }
  }, [adminEmail, adminNome, adminNomeTouched, isGoogle, lookupEmail, session?.user]);

  useEffect(() => {
    if (!isGoogle) {
      setAdminNomeTouched(false);
    }
  }, [isGoogle]);

  useEffect(() => {
    if (!defineSenha && isGoogle) {
      setAdminSenha("");
      setAdminConfirmSenha("");
    }
  }, [defineSenha, isGoogle]);

  useEffect(() => {
    if (!googleIntent || handledGoogleIntentRef.current) return;
    if (sessionStatus !== "authenticated" || !isGoogle) return;

    const sessionEmail = String((session?.user as any)?.email || "")
      .trim()
      .toLowerCase();
    if (!sessionEmail) return;

    handledGoogleIntentRef.current = true;
    const sessionName = resolveFirstName((session?.user as any)?.name as string | undefined);
    const fallbackName = sessionName || resolveFirstNameFromEmail(sessionEmail);

    setLookupError("");
    setExistingLoginError("");
    setFormError("");
    setSucesso("Conta global conectada com Google. Continue com os dados do racha.");
    setUseExistingGlobalAccount(true);
    setAdminEmail(sessionEmail);
    setLookupEmail(sessionEmail);
    if (!adminNome) {
      setAdminNome(fallbackName);
    }
    if (!adminPosicao) {
      setAdminPosicao(POSICOES[0]);
    }
    setStep(2);
    setAccessFlow("wizard");
    router.replace("/cadastrar-racha");
  }, [adminNome, adminPosicao, googleIntent, isGoogle, router, session?.user, sessionStatus]);

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

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
    []
  );

  const availablePlans = useMemo(() => {
    if (!planCatalog?.plans?.length) return [];
    return planCatalog.plans
      .filter((plan) => plan.interval === planInterval)
      .filter((plan) => plan.active !== false && plan.ctaType !== "contact")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [planCatalog, planInterval]);

  const selectedPlan = useMemo(() => {
    if (!availablePlans.length) return null;
    return availablePlans.find((plan) => plan.key === selectedPlanKey) ?? availablePlans[0];
  }, [availablePlans, selectedPlanKey]);

  const baseTrialDays = useMemo(() => {
    if (selectedPlan?.trialDays !== undefined) return selectedPlan.trialDays;
    return planCatalog?.meta?.trialDaysDefault ?? 20;
  }, [planCatalog, selectedPlan]);

  const totalTrialDays = useMemo(() => {
    const extra = couponBenefits?.extraTrialDays ?? 0;
    return baseTrialDays + extra;
  }, [baseTrialDays, couponBenefits]);

  const discountPercent = couponBenefits?.firstPaymentDiscountPercent ?? 0;

  useEffect(() => {
    if (!availablePlans.length) return;
    if (availablePlans.some((plan) => plan.key === selectedPlanKey)) return;
    const preferred = availablePlans.find((plan) => plan.highlight) ?? availablePlans[0];
    setSelectedPlanKey(preferred.key);
  }, [availablePlans, selectedPlanKey]);

  useEffect(() => {
    if (couponStatus === "valid") {
      setCouponStatus("idle");
      setCouponBenefits(null);
    }
  }, [selectedPlanKey, couponStatus]);

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

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) {
      setCouponStatus("invalid");
      setCouponBenefits(null);
      return;
    }

    setCouponStatus("loading");
    setCouponBenefits(null);

    try {
      const res = await fetch("/api/public/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          planKey: selectedPlanKey || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (data?.valid) {
        setCouponStatus("valid");
        setCouponBenefits({
          extraTrialDays: Number(data.extraTrialDays || 0),
          firstPaymentDiscountPercent: Number(
            data.firstPaymentDiscountPercent || data.discountPct || 0
          ),
        });
        return;
      }

      setCouponStatus("invalid");
    } catch {
      setCouponStatus("error");
    }
  }

  async function handleLookupGlobalAccount() {
    const normalizedEmail = lookupEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setLookupError("Informe um e-mail válido.");
      return;
    }

    setLookupLoading(true);
    setLookupError("");
    setExistingLoginError("");
    setFormError("");
    setSucesso("");

    try {
      const response = await fetch("/api/auth/lookup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const body = (await response.json().catch(() => null)) as LookupEmailResponse | null;
      if (!response.ok) {
        setLookupError(body?.error || body?.message || "Não foi possível verificar o e-mail.");
        return;
      }

      const userExists = Boolean(body?.userExists ?? body?.exists);
      setAdminEmail(normalizedEmail);

      if (userExists) {
        const hasPassword = Boolean(body?.hasPassword);
        const methods = Array.isArray(body?.availableAuthMethods) ? body.availableAuthMethods : [];
        const passwordAllowed = hasPassword || methods.includes("password");

        setUseExistingGlobalAccount(true);
        setExistingHasPassword(passwordAllowed);
        setAdminSenha("");
        setAdminConfirmSenha("");
        setShowExistingSenha(false);
        setAccessFlow("existing-password");
        return;
      }

      const fallbackName = resolveFirstNameFromEmail(normalizedEmail);
      setUseExistingGlobalAccount(false);
      setExistingHasPassword(true);
      if (!adminNome) {
        setAdminNome(fallbackName);
      }
      if (!adminPosicao) {
        setAdminPosicao(POSICOES[0]);
      }
      setStep(1);
      setAccessFlow("wizard");
      setSucesso("Conta global não encontrada. Preencha os dados para criar sua conta.");
    } catch {
      setLookupError("Não foi possível verificar agora. Tente novamente.");
    } finally {
      setLookupLoading(false);
    }
  }

  function handleBackToIdentify() {
    setAccessFlow("identify");
    setUseExistingGlobalAccount(false);
    setExistingLoginError("");
    setLookupError("");
    setFormError("");
    setSucesso("");
    setAdminSenha("");
    setAdminConfirmSenha("");
    setShowExistingSenha(false);
  }

  async function handleExistingGlobalLogin() {
    const email = adminEmail.trim().toLowerCase();
    const password = adminSenha;

    if (!email || !password) {
      setExistingLoginError("Informe e-mail e senha da conta global.");
      return;
    }

    setExistingLoginLoading(true);
    setExistingLoginError("");
    setFormError("");
    setSucesso("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok || result.error) {
        setExistingLoginError("E-mail ou senha inválidos.");
        return;
      }

      const fallbackName = resolveFirstNameFromEmail(email) || "Administrador";

      if (!adminNome) {
        setAdminNome(fallbackName);
      }
      if (!adminPosicao) {
        setAdminPosicao(POSICOES[0]);
      }
      setUseExistingGlobalAccount(true);
      setStep(2);
      setErrors({});
      setAccessFlow("wizard");
      setSucesso("Conta global reconhecida. Continue com os dados do racha.");
    } catch {
      setExistingLoginError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setExistingLoginLoading(false);
    }
  }

  function buildStep1Errors(): FieldErrors {
    if (useExistingGlobalAccount) return {};

    const nextErrors: FieldErrors = {};
    const nome = adminNome.trim();
    if (!nome) nextErrors.adminNome = "Informe o primeiro nome.";
    if (nome && nome.split(" ").length > 1) nextErrors.adminNome = "Use apenas o primeiro nome.";
    if (nome && nome.length > 10) nextErrors.adminNome = "Maximo de 10 caracteres.";
    if (adminApelido.trim().length > 10) nextErrors.adminApelido = "Maximo de 10 caracteres.";
    if (!adminPosicao) nextErrors.adminPosicao = "Selecione a posição.";
    if (!adminEmail.trim()) nextErrors.adminEmail = "Informe o e-mail.";
    const wantsPassword = !isGoogle || defineSenha || adminSenha || adminConfirmSenha;
    if (wantsPassword) {
      if (!adminSenha || adminSenha.length < 6) nextErrors.adminSenha = "Minimo de 6 caracteres.";
      if (adminSenha !== adminConfirmSenha)
        nextErrors.adminConfirmSenha = "As senhas não conferem.";
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
    const uf = estadoUf.trim().toUpperCase();
    if (!uf) nextErrors.estado = "Selecione o estado.";
    const cityName = normalizeCityValue(cidadeNome);
    if (!cityName) {
      nextErrors.cidade = "Selecione a cidade.";
    } else if (uf && cidadeOptions.length > 0) {
      const isValid = cidadeOptions.some((city) => city.nome === cityName);
      if (!isValid) nextErrors.cidade = "Cidade invalida para o estado.";
    }
    return nextErrors;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleRegister() {
    setIsLoading(true);
    try {
      const normalizedEmail = adminEmail.trim().toLowerCase();
      const normalizedName =
        resolveFirstName(adminNome) ||
        resolveFirstName((session?.user as any)?.name as string | undefined) ||
        resolveFirstNameFromEmail(normalizedEmail);
      const normalizedPosition = adminPosicao || POSICOES[0];
      const normalizedPassword = adminSenha || undefined;

      if (!normalizedEmail) {
        setFormError("Informe o e-mail da conta global para continuar.");
        return;
      }
      if (!normalizedName) {
        setFormError("Não foi possível identificar o primeiro nome do administrador.");
        return;
      }
      if (useExistingGlobalAccount && !isGoogle && !normalizedPassword) {
        setAccessFlow("existing-password");
        setFormError("Confirme a senha da conta global para concluir o cadastro do racha.");
        return;
      }

      const endpoint = isGoogle ? "/api/admin/register-google" : "/api/admin/register";
      const payload = {
        rachaNome: rachaNome.trim(),
        rachaSlug: rachaSlug.trim(),
        cidadeNome: normalizeCityValue(cidadeNome),
        cidadeIbgeCode: cidadeIbgeCode || undefined,
        estadoUf: estadoUf.trim().toUpperCase(),
        rachaLogoBase64: rachaLogo,
        adminNome: normalizedName,
        adminApelido: adminApelido.trim() || undefined,
        adminPosicao: normalizedPosition,
        adminEmail: normalizedEmail,
        adminSenha: normalizedPassword,
        adminAvatarBase64: adminAvatar,
        planKey: selectedPlanKey,
        couponCode: couponStatus === "valid" ? couponCode.trim() : undefined,
        useExistingGlobalAccount,
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

      const emailParaConfirmar = (body?.email || normalizedEmail).toLowerCase();
      const slugParaConfirmar = body?.tenantSlug || rachaSlug.trim();
      const requiresEmailVerification = body?.requiresEmailVerification ?? !isGoogle;

      if (useExistingGlobalAccount && !isGoogle) {
        setSucesso("Racha cadastrado com conta global. Redirecionando para o painel.");
        const accessToken = body?.accessToken;
        const refreshToken = body?.refreshToken;

        if (accessToken && refreshToken) {
          const signInResult = await signIn("credentials", {
            redirect: false,
            accessToken,
            refreshToken,
            email: normalizedEmail,
            name: normalizedName,
            authProvider: "credentials",
          });

          if (signInResult?.error) {
            setFormError(
              "Racha cadastrado, mas não foi possível entrar automaticamente. Faça login para continuar."
            );
            setTimeout(() => router.push("/admin/login"), 1200);
            return;
          }
        }

        router.push("/admin/selecionar-racha");
        return;
      }

      if (!isGoogle && requiresEmailVerification) {
        setSucesso("Cadastro realizado! Enviamos um e-mail para confirmação.");
        const query = new URLSearchParams({
          email: emailParaConfirmar,
          slug: slugParaConfirmar,
        }).toString();
        router.push(`/cadastrar-racha/confirmar-email?${query}`);
        return;
      }

      if (isGoogle) {
        setSucesso("Cadastro realizado! Redirecionando para o painel.");
        const accessToken = body?.accessToken;
        const refreshToken = body?.refreshToken;
        if (accessToken && refreshToken) {
          const signInResult = await signIn("credentials", {
            redirect: false,
            accessToken,
            refreshToken,
            authProvider: "google",
          });
          if (signInResult?.error) {
            setFormError("Nao foi possivel finalizar o acesso. Tente novamente.");
            return;
          }
        }
        router.push("/admin/selecionar-racha");
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

    if (accessFlow === "identify") {
      await handleLookupGlobalAccount();
      return;
    }

    if (accessFlow === "existing-password") {
      if (!existingHasPassword) {
        setExistingLoginError("Esta conta não possui senha. Continue com Google para avançar.");
        return;
      }
      await handleExistingGlobalLogin();
      return;
    }

    if (step === 1) {
      if (useExistingGlobalAccount) {
        setErrors({});
        setStep(2);
        return;
      }

      const stepErrors = buildStep1Errors();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(2);
      return;
    }

    if (step === 2) {
      const stepErrors = buildStep2Errors();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(3);
      return;
    }

    const step1Errors = useExistingGlobalAccount ? {} : buildStep1Errors();
    const step2Errors = buildStep2Errors();
    const nextErrors = { ...step1Errors, ...step2Errors };
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(Object.keys(step1Errors).length > 0 ? 1 : 2);
      return;
    }

    if (planLoading) {
      setFormError("Aguarde carregar os planos.");
      return;
    }

    if (planError) {
      setFormError(planError);
      return;
    }

    if (!selectedPlanKey) {
      setFormError("Selecione um plano para continuar.");
      return;
    }

    if (couponStatus === "loading") {
      setFormError("Aguarde a validação do cupom.");
      return;
    }

    setErrors({});
    await handleRegister();
  }

  function handleWizardBack() {
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (useExistingGlobalAccount) {
        setAccessFlow("existing-password");
        return;
      }
      setStep(1);
    }
  }

  const primaryActionLabel =
    accessFlow === "identify"
      ? lookupLoading
        ? "Verificando..."
        : "Continuar"
      : accessFlow === "existing-password"
        ? !existingHasPassword
          ? "Use o Google para continuar"
          : existingLoginLoading
            ? "Entrando..."
            : "Entrar e ir para etapa 2"
        : step === 3
          ? isLoading
            ? "Finalizando..."
            : "Começar teste grátis"
          : "Continuar";

  const isPrimaryDisabled =
    accessFlow === "identify"
      ? lookupLoading
      : accessFlow === "existing-password"
        ? existingLoginLoading || !existingHasPassword || !adminSenha.trim()
        : isLoading;

  const showWizardBackButton = accessFlow === "wizard" && step > 1;

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
                {accessFlow === "wizard" ? `Etapa ${step} de 3` : "Acesso Fut7Pro"}
              </div>
              <h1 className="text-2xl font-bold text-white lg:hidden">Cadastre seu racha</h1>
              <p className="text-sm text-gray-400 lg:hidden">Leva menos de 2 min.</p>
            </div>
            {showWizardBackButton && (
              <button
                type="button"
                onClick={handleWizardBack}
                className="text-xs text-yellow-300 underline"
              >
                Voltar
              </button>
            )}
          </div>

          {accessFlow === "wizard" && (
            <div className="mt-4 h-1 w-full rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-yellow-400 transition-all ${
                  step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
                }`}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {accessFlow === "identify" && (
              <div className="space-y-4">
                <div className="mb-5 flex flex-col items-center gap-2 text-center">
                  <Image
                    src="/images/logos/logo_fut7pro.png"
                    alt="Fut7Pro"
                    width={52}
                    height={52}
                  />
                  <h2 className="text-2xl font-bold text-white">Entrar no Fut7Pro</h2>
                  <p className="text-sm text-gray-300">
                    Continue com Google ou informe seu e-mail para identificar o próximo passo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/cadastrar-racha?google=1" })}
                  disabled={sessionStatus === "loading"}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Image src="/images/Google-Logo.png" alt="Google" width={20} height={20} />
                    Continuar com Google
                  </span>
                </button>

                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gray-500">
                  <span className="h-px flex-1 bg-white/10" />
                  ou
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(event) => {
                    setLookupEmail(event.target.value);
                    setLookupError("");
                  }}
                  placeholder="ex: seuemail@dominio.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {lookupError && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {lookupError}
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                  Esta etapa identifica se você já possui conta global Fut7Pro ou se precisa criar
                  uma conta antes de cadastrar o racha.
                </div>
              </div>
            )}

            {accessFlow === "existing-password" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#23283a] bg-[#151821] p-4">
                  <h2 className="text-sm font-semibold text-white">Conta global encontrada</h2>
                  <p className="mt-1 text-xs text-gray-300">
                    E-mail identificado:{" "}
                    <span className="font-semibold text-white">{adminEmail}</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {existingHasPassword
                      ? "Informe sua senha para avançar direto para a etapa 2."
                      : "Esta conta não possui senha. Continue com Google para seguir."}
                  </p>
                </div>

                {existingHasPassword && (
                  <label className="text-xs text-gray-400">
                    Senha da conta global
                    <div className="relative mt-2">
                      <input
                        type={showExistingSenha ? "text" : "password"}
                        value={adminSenha}
                        onChange={(e) => {
                          setAdminSenha(e.target.value);
                          setExistingLoginError("");
                        }}
                        autoComplete="current-password"
                        className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Digite sua senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExistingSenha((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                      >
                        {showExistingSenha ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/cadastrar-racha?google=1" })}
                  disabled={sessionStatus === "loading"}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Image src="/images/Google-Logo.png" alt="Google" width={20} height={20} />
                    Entrar com Google
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToIdentify}
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-200 hover:border-white/20"
                >
                  Usar outro e-mail
                </button>

                {existingLoginError && (
                  <div className="rounded-lg border border-red-500/50 bg-red-600/20 px-3 py-2 text-xs text-red-200">
                    {existingLoginError}
                  </div>
                )}
              </div>
            )}

            {accessFlow === "wizard" && step === 1 && (
              <>
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-white">Conta do presidente</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs text-gray-400">
                      Primeiro nome *
                      <input
                        type="text"
                        value={adminNome}
                        onChange={(e) => {
                          setAdminNomeTouched(true);
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

            {accessFlow === "wizard" && step === 2 && (
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
                    Link público: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs text-gray-400">
                      Estado *
                      <select
                        value={estadoUf}
                        onChange={(e) => {
                          const nextUf = e.target.value.toUpperCase();
                          setEstadoUf(nextUf);
                          clearError("estado");
                          clearError("cidade");
                        }}
                        className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      >
                        <option value="">Selecione o estado</option>
                        {UF_LIST.map((estado) => (
                          <option key={estado.uf} value={estado.uf}>
                            {estado.nome} ({estado.uf})
                          </option>
                        ))}
                      </select>
                      {errors.estado && (
                        <span className="mt-1 block text-xs text-red-300">{errors.estado}</span>
                      )}
                    </label>
                    <label className="text-xs text-gray-400">
                      Cidade *
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={cidadeFilter}
                          onChange={(e) => setCidadeFilter(e.target.value)}
                          placeholder={
                            estadoUf ? "Buscar cidade..." : "Selecione o estado primeiro"
                          }
                          disabled={!estadoUf}
                          className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                        <select
                          value={cidadeNome}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCidadeNome(value);
                            const found = cidadeOptions.find((city) => city.nome === value);
                            setCidadeIbgeCode(found?.ibge ?? "");
                            clearError("cidade");
                          }}
                          className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
                          required
                          disabled={!estadoUf || cidadeLoading}
                        >
                          <option value="">
                            {!estadoUf
                              ? "Selecione o estado primeiro"
                              : cidadeLoading
                                ? "Carregando cidades..."
                                : "Selecione a cidade"}
                          </option>
                          {filteredCities.length === 0 && estadoUf && !cidadeLoading ? (
                            <option value="" disabled>
                              Nenhuma cidade encontrada
                            </option>
                          ) : null}
                          {filteredCities.map((city) => (
                            <option key={city.ibge} value={city.nome}>
                              {city.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.cidade && (
                        <span className="mt-1 block text-xs text-red-300">{errors.cidade}</span>
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

            {accessFlow === "wizard" && step === 3 && (
              <>
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-[#12151f] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-white">Escolha seu plano</h2>
                      <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-[11px] font-semibold text-yellow-300">
                        {baseTrialDays} dias grátis
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-300">
                      Teste grátis por {baseTrialDays} dias. O plano escolhido define apenas o valor
                      após o teste.
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Após o período grátis, será solicitada a confirmação da assinatura para manter
                      o painel do racha ativo.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#23283a] bg-[#10131b] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPlanInterval("month")}
                      className={`rounded-full px-4 py-2 font-semibold transition ${
                        planInterval === "month"
                          ? "bg-yellow-400 text-black"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanInterval("year")}
                      className={`rounded-full px-4 py-2 font-semibold transition ${
                        planInterval === "year"
                          ? "bg-yellow-400 text-black"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      Anual (2 meses grátis)
                    </button>
                  </div>

                  {planLoading && (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                      Carregando planos...
                    </div>
                  )}
                  {planError && (
                    <div className="rounded-lg border border-red-500/60 bg-red-600/20 px-3 py-2 text-xs text-red-200">
                      {planError}
                    </div>
                  )}

                  <div
                    role="radiogroup"
                    aria-label="Escolha do plano"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {availablePlans.map((plan) => {
                      const isSelected = plan.key === selectedPlanKey;
                      const copy = PLAN_MICRO_COPY[plan.key] ?? {
                        title: plan.label,
                        blurb: "Plano Fut7Pro para o seu racha.",
                        bullets: [],
                      };
                      const priceSuffix = plan.interval === "month" ? "mes" : "ano";

                      return (
                        <button
                          key={plan.key}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedPlanKey(plan.key)}
                          className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                            isSelected
                              ? "border-yellow-400 bg-[#1a1d2a] shadow-lg"
                              : "border-[#23283a] bg-[#151821] hover:border-yellow-400/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {copy.title ?? plan.label}
                              </div>
                              <p className="mt-1 text-[11px] text-gray-400">{copy.blurb}</p>
                            </div>
                            {plan.badge && (
                              <span className="rounded-full bg-yellow-400/20 px-2 py-1 text-[10px] font-semibold text-yellow-300">
                                {plan.badge}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-[11px] text-gray-400">
                            Após o teste: {priceFormatter.format(plan.amount)}/{priceSuffix}
                          </div>

                          {copy.bullets.length > 0 && (
                            <ul className="mt-3 list-disc list-inside space-y-1 text-[11px] text-gray-300">
                              {copy.bullets.slice(0, 3).map((item, index) => (
                                <li key={`${plan.key}-${index}`}>{item}</li>
                              ))}
                            </ul>
                          )}

                          {(copy.marketingNote || plan.marketingStartsAfterFirstPayment) && (
                            <p className="mt-3 text-[11px] text-gray-400">
                              {copy.marketingNote ||
                                "Serviços de marketing começam após o primeiro pagamento."}
                            </p>
                          )}

                          <div className="mt-4 flex items-center justify-end">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                                isSelected
                                  ? "bg-yellow-400 text-black"
                                  : "bg-white/10 text-gray-200"
                              }`}
                            >
                              {isSelected ? "Selecionado" : "Selecionar"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!planLoading && availablePlans.length === 0 && !planError && (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                      Nenhum plano disponivel no momento.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">
                      Cupom de embaixador ou influencer
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Aplique um cupom para ganhar +10 dias de teste e 35% de desconto na primeira
                      cobranca.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponStatus !== "idle") {
                          setCouponStatus("idle");
                          setCouponBenefits(null);
                        }
                      }}
                      placeholder="Digite seu cupom (ex: FUT7VIP)"
                      className="w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      disabled={couponStatus === "loading" || !couponCode.trim()}
                      className="rounded-lg bg-[#23283a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2c3146] disabled:opacity-70"
                    >
                      {couponStatus === "loading" ? "Aplicando..." : "Aplicar"}
                    </button>
                  </div>

                  {couponStatus === "valid" && (
                    <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                      Cupom aplicado. +{couponBenefits?.extraTrialDays ?? 0} dias e{" "}
                      {discountPercent}% na primeira cobranca.
                    </div>
                  )}
                  {couponStatus === "invalid" && (
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                      Cupom não encontrado. Você pode continuar sem cupom.
                    </div>
                  )}
                  {couponStatus === "error" && (
                    <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
                      Nao foi possivel validar agora. Tente novamente.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-xs text-gray-300">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>Seu teste grátis: {totalTrialDays} dias.</span>
                    {discountPercent > 0 && <span>{discountPercent}% na primeira cobranca.</span>}
                  </div>
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
              {showWizardBackButton && (
                <button
                  type="button"
                  onClick={handleWizardBack}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-300 hover:text-white"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={isPrimaryDisabled}
                className="flex-1 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {primaryActionLabel}
              </button>
            </div>

            <div className="text-center text-sm text-gray-300">
              Já tem cadastro?{" "}
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
              Crie seu racha e complete seu perfil. Em minutos você entra como presidente com painel
              e site público sincronizados.
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
          disabled={isPrimaryDisabled}
          className="w-full rounded-lg bg-yellow-400 px-4 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {primaryActionLabel}
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

export default function CadastroRachaPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-2xl bg-[#0f1118] border border-[#1c2030] p-6 text-sm text-gray-300">
            Carregando cadastro do racha...
          </div>
        </main>
      }
    >
      <CadastroRachaPageContent />
    </Suspense>
  );
}
