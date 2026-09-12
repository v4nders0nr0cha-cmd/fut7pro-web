"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useMe } from "@/hooks/useMe";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import {
  clearPublicAuthContext,
  isFut7ProAccountComplete,
  persistPublicAuthContext,
  readPublicAuthContext,
} from "@/utils/public-auth-flow";
import {
  PUBLIC_AUTH_SUCCESS_MESSAGE,
  getHumanAuthErrorMessage,
  showPublicAuthSuccessToast,
} from "@/utils/public-auth-feedback";
import { syncPublicAuthState } from "@/utils/public-session-sync";
import TurnstileWidget, {
  AUTH_APP_TURNSTILE_ENABLED,
  AUTH_APP_TURNSTILE_SITE_KEY,
  TURNSTILE_REQUIRED_MESSAGE,
  TURNSTILE_UNAVAILABLE_MESSAGE,
  isTurnstileErrorCode,
  resolveTurnstileErrorMessage,
} from "@/components/security/TurnstileWidget";

type LoginClientProps = {
  entryPath?: "/login" | "/entrar";
  variant?: "login" | "entry";
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const VITRINE_AUTH_BLOCKED_MESSAGE =
  "Este ambiente de demonstração é apenas demonstrativo. Login e cadastro de atletas estão desabilitados.";
const MAX_JOIN_MESSAGE_LENGTH = 500;

function normalizeJoinMessage(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_JOIN_MESSAGE_LENGTH);
}

function resolveRedirect(target: string | null, fallback: string) {
  if (!target) return fallback;
  if (target.startsWith("/")) return target;
  try {
    const url = new URL(target);
    if (url.origin === APP_URL) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // ignore invalid urls
  }
  return fallback;
}

function maskEmail(value: string) {
  const normalized = value.trim().toLowerCase();
  const [localPart, domain] = normalized.split("@");
  if (!localPart || !domain) return normalized;
  const visibleStart = localPart.slice(0, Math.min(2, localPart.length));
  return `${visibleStart}***@${domain}`;
}

export default function LoginClient({ entryPath = "/login", variant = "login" }: LoginClientProps) {
  const { nome } = useTema();
  const nomeDoRacha = nome?.trim() || "seu grupo";
  const { publicHref, publicSlug } = usePublicLinks();
  const isVitrineSlug = publicSlug?.toLowerCase() === "vitrine";
  const isEntryVariant = variant === "entry";

  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestJoinIntent = searchParams.get("intent") === "request-join";
  const returningFromGoogleLogin = searchParams.get("oauth") === "google";
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() || "";
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const prefillAppliedRef = useRef(false);
  const completedNavigationRef = useRef(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [usarSenha, setUsarSenha] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [notMemberModalOpen, setNotMemberModalOpen] = useState(false);
  const [requestJoinInProgress, setRequestJoinInProgress] = useState(false);
  const [requestJoinLoading, setRequestJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [notMemberMessage, setNotMemberMessage] = useState("");
  const [canRequestJoin, setCanRequestJoin] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileProof, setTurnstileProof] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(60);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);
  const turnstileEnabled = AUTH_APP_TURNSTILE_ENABLED;
  const turnstileSiteKey = AUTH_APP_TURNSTILE_SITE_KEY;

  const redirectTo = useMemo(
    () => resolveRedirect(searchParams.get("callbackUrl"), publicHref("/")),
    [searchParams, publicHref]
  );
  const googleCallbackHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", redirectTo);
    params.set("oauth", "google");
    return `${publicHref(entryPath)}?${params.toString()}`;
  }, [entryPath, publicHref, redirectTo]);

  const shouldLoadMe = status === "authenticated" && Boolean(publicSlug);
  const {
    me,
    isLoading: isLoadingMe,
    isError: isErrorMe,
  } = useMe({
    enabled: shouldLoadMe,
    tenantSlug: publicSlug,
    context: "athlete",
  });
  const {
    profile: globalProfile,
    isLoading: isLoadingGlobalProfile,
    isError: isErrorGlobalProfile,
  } = useGlobalProfile({ enabled: status === "authenticated" });
  const accountComplete =
    isFut7ProAccountComplete(me?.athlete) || isFut7ProAccountComplete(globalProfile?.user);
  const accountStateResolved =
    status !== "authenticated" ||
    Boolean(globalProfile) ||
    isErrorGlobalProfile ||
    !isLoadingGlobalProfile;

  const navigateWithRefresh = useCallback(
    (href: string) => {
      router.replace(href);
      router.refresh();
    },
    [router]
  );

  const finalizeSuccessfulLogin = useCallback(
    async (targetHref: string, successMessage = PUBLIC_AUTH_SUCCESS_MESSAGE) => {
      if (completedNavigationRef.current) return;
      completedNavigationRef.current = true;

      try {
        await syncPublicAuthState({
          publicSlug,
          refreshSession: update,
        });
      } catch {
        // Mantem a navegacao mesmo se a revalidacao falhar.
      }

      clearPublicAuthContext();
      showPublicAuthSuccessToast(successMessage);
      navigateWithRefresh(targetHref);
    },
    [navigateWithRefresh, publicSlug, update]
  );

  const buildRegisterHref = useCallback(
    (emailValue?: string | null) => {
      const params = new URLSearchParams();
      params.set("callbackUrl", redirectTo);
      const normalizedEmail = emailValue?.trim().toLowerCase();
      if (normalizedEmail) {
        params.set("email", normalizedEmail);
      }
      return `${publicHref("/register")}?${params.toString()}`;
    },
    [publicHref, redirectTo]
  );
  const normalizedJoinMessage = useMemo(() => normalizeJoinMessage(joinMessage), [joinMessage]);
  const buildCompleteProfileHref = useCallback(
    (emailValue?: string | null) => {
      const params = new URLSearchParams();
      if (publicSlug) {
        params.set("intent", "request-join");
        params.set("racha", publicSlug);
      }
      const normalizedEmail = emailValue?.trim().toLowerCase();
      if (normalizedEmail && publicSlug) {
        persistPublicAuthContext({
          email: normalizedEmail,
          slug: publicSlug,
          joinMessage: normalizedJoinMessage || null,
        });
      }
      const queryString = params.toString();
      return queryString ? `/perfil?${queryString}` : "/perfil";
    },
    [normalizedJoinMessage, publicSlug]
  );

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetSignal((value) => value + 1);
  };

  const requireTurnstile = (token: string | null, setMessage: (message: string) => void) => {
    if (!turnstileEnabled) return true;
    if (!turnstileSiteKey) {
      setMessage(TURNSTILE_UNAVAILABLE_MESSAGE);
      return false;
    }
    if (!token) {
      setMessage(TURNSTILE_REQUIRED_MESSAGE);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const context = publicSlug ? readPublicAuthContext(publicSlug) : null;
    if (context?.joinMessage) {
      setJoinMessage((previous) => previous || context.joinMessage || "");
    }
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      prefillAppliedRef.current = true;
      requestAnimationFrame(() => passwordInputRef.current?.focus());
      return;
    }
    if (!publicSlug) return;
    if (!context?.email) return;

    setEmail((previous) => previous || context.email);
    setJoinMessage((previous) => previous || context.joinMessage || "");
    prefillAppliedRef.current = true;
    requestAnimationFrame(() => passwordInputRef.current?.focus());
  }, [emailFromQuery, publicSlug]);

  useEffect(() => {
    setCodigo("");
    setCodigoEnviado(false);
    setInfoMessage("");
    setCanRequestJoin(false);
    setTurnstileProof(null);
    setResendRemainingSeconds(0);
  }, [email]);

  useEffect(() => {
    if (resendRemainingSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setResendRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendRemainingSeconds]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (requestJoinInProgress) return;
    if (completedNavigationRef.current) return;

    if (!publicSlug) {
      navigateWithRefresh(buildCompleteProfileHref(session?.user?.email || email));
      return;
    }

    if (shouldLoadMe && isLoadingMe) return;
    if (!accountStateResolved || isLoadingGlobalProfile) return;

    if (!accountComplete) {
      navigateWithRefresh(buildCompleteProfileHref(session?.user?.email || email));
      return;
    }

    if (shouldLoadMe && isLoadingMe) return;

    const membershipStatus = String(me?.membership?.status || "").toUpperCase();
    if (requestJoinIntent) {
      if (membershipStatus === "APROVADO") {
        void finalizeSuccessfulLogin(redirectTo);
        return;
      }
      if (membershipStatus === "PENDENTE") {
        navigateWithRefresh(publicHref("/aguardando-aprovacao"));
        return;
      }
      setCanRequestJoin(true);
      setNotMemberModalOpen(true);
      return;
    }

    if (membershipStatus === "PENDENTE") {
      navigateWithRefresh(publicHref("/aguardando-aprovacao"));
      return;
    }

    if (membershipStatus === "APROVADO") {
      void finalizeSuccessfulLogin(redirectTo);
      return;
    }

    if (membershipStatus === "SUSPENSO" || membershipStatus === "REJEITADO") {
      setErro(`Seu acesso a ${nomeDoRacha} não está liberado. Fale com o administrador.`);
      return;
    }

    if (isErrorMe) {
      setCanRequestJoin(true);
      setNotMemberModalOpen(true);
      setNotMemberMessage("");
      return;
    }

    if (returningFromGoogleLogin || !membershipStatus || membershipStatus === "NONE") {
      setCanRequestJoin(true);
      setNotMemberModalOpen(true);
      setNotMemberMessage("");
      return;
    }

    setCanRequestJoin(true);
    setNotMemberModalOpen(true);
    setNotMemberMessage("");
  }, [
    status,
    redirectTo,
    publicHref,
    publicSlug,
    shouldLoadMe,
    isLoadingMe,
    isErrorMe,
    me,
    nomeDoRacha,
    accountComplete,
    accountStateResolved,
    isLoadingGlobalProfile,
    requestJoinIntent,
    requestJoinInProgress,
    returningFromGoogleLogin,
    finalizeSuccessfulLogin,
    navigateWithRefresh,
    buildRegisterHref,
    buildCompleteProfileHref,
    session?.user?.email,
    email,
  ]);

  const handleRequestJoin = async () => {
    setErro("");
    setNotMemberMessage("");

    if (isVitrineSlug) {
      setNotMemberMessage(VITRINE_AUTH_BLOCKED_MESSAGE);
      return;
    }

    if (!publicSlug) {
      setNotMemberMessage("Não encontramos este grupo. Confira o link e tente novamente.");
      return;
    }

    if (status !== "authenticated" && !canRequestJoin) {
      setNotMemberMessage(
        `Entre com código enviado por e-mail ou com sua senha para solicitar entrada em ${nomeDoRacha}.`
      );
      return;
    }

    setRequestJoinLoading(true);
    setRequestJoinInProgress(true);

    try {
      const requestJoin = async () => {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
          return await fetch(`/api/public/${publicSlug}/auth/request-join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalizedJoinMessage ? { mensagem: normalizedJoinMessage } : {}),
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeout);
        }
      };

      let response = await requestJoin();
      if (response.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        response = await requestJoin();
      }

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const code = String(body?.code || body?.error?.code || "").toUpperCase();
        if (code === "PROFILE_INCOMPLETE") {
          navigateWithRefresh(buildCompleteProfileHref(session?.user?.email || email));
          return;
        }
        if (code === "REQUEST_PENDING") {
          clearPublicAuthContext();
          navigateWithRefresh(publicHref("/aguardando-aprovacao"));
          return;
        }
        const message = Array.isArray(body?.message)
          ? body.message.join(" ")
          : body?.message || body?.error || "Não foi possível solicitar entrada neste grupo.";
        setNotMemberMessage(getHumanAuthErrorMessage(message));
        setRequestJoinInProgress(false);
        return;
      }

      const joinStatus = String(body?.status || "").toUpperCase();
      const joinMembershipStatus = String(body?.membershipStatus || "").toUpperCase();
      const isActive = joinStatus === "APROVADO" || joinMembershipStatus === "ACTIVE";

      setNotMemberModalOpen(false);
      if (isActive) {
        await finalizeSuccessfulLogin(redirectTo);
        return;
      }

      clearPublicAuthContext();
      navigateWithRefresh(publicHref("/aguardando-aprovacao"));
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Tempo esgotado ao solicitar entrada. Tente novamente."
          : getHumanAuthErrorMessage(error, "Falha ao solicitar entrada. Tente novamente.");
      setNotMemberMessage(message);
      setRequestJoinInProgress(false);
    } finally {
      setRequestJoinLoading(false);
    }
  };

  const handleAuthFailure = (body: any) => {
    const code =
      typeof body?.code === "string"
        ? body.code
        : typeof body?.error?.code === "string"
          ? body.error.code
          : typeof body?.message?.code === "string"
            ? body.message.code
            : null;
    const message =
      typeof body?.message === "string"
        ? body.message
        : typeof body?.error === "string"
          ? body.error
          : "Não foi possível autenticar.";
    const isEmailNotVerified =
      code === "EMAIL_NOT_VERIFIED" ||
      message.toLowerCase().includes("confirme seu e-mail") ||
      message.toLowerCase().includes("verifique seu e-mail");

    if (isTurnstileErrorCode(code)) {
      setErro(resolveTurnstileErrorMessage(body));
      resetTurnstile();
      return true;
    }

    if (code === "REQUEST_PENDING") {
      setPendingModalOpen(true);
      return true;
    }

    if (code === "NOT_MEMBER") {
      setNotMemberModalOpen(true);
      return true;
    }

    if (code === "REQUEST_REJECTED") {
      setErro("Sua solicitação foi rejeitada. Fale com o administrador do grupo.");
      return true;
    }

    if (code === "USER_NOT_FOUND") {
      setErro(
        `Não encontramos uma Conta Fut7Pro com este e-mail. Crie sua conta para solicitar entrada em ${nomeDoRacha}.`
      );
      return true;
    }

    if (code === "PROFILE_INCOMPLETE") {
      router.replace(buildCompleteProfileHref(email));
      return true;
    }

    if (isEmailNotVerified) {
      const normalizedEmail = email.trim().toLowerCase();
      const query = new URLSearchParams();
      if (normalizedEmail) {
        query.set("email", normalizedEmail);
      }
      const queryString = query.toString();
      const confirmationHref = queryString
        ? `${publicHref("/confirmar-email")}?${queryString}`
        : publicHref("/confirmar-email");
      router.replace(confirmationHref);
      return true;
    }

    setErro(getHumanAuthErrorMessage(message, "Não foi possível autenticar."));
    return true;
  };

  const loginWithTokens = async (body: any, authProvider: "credentials" | "passwordless") => {
    const accessToken = body?.accessToken;
    const refreshToken = body?.refreshToken;
    if (!accessToken || !refreshToken) {
      setErro("Não foi possível concluir o login.");
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      accessToken,
      refreshToken,
      authProvider,
    });

    if (signInResult?.error) {
      setErro("Não foi possível concluir o login.");
      return;
    }

    const nextAction = String(body?.nextAction || "").toUpperCase();
    const membershipStatus = String(
      body?.membershipStatus || body?.membership?.status || ""
    ).toUpperCase();
    if (nextAction === "REQUEST_JOIN" || membershipStatus === "NONE") {
      setCanRequestJoin(true);
      setNotMemberModalOpen(true);
      setNotMemberMessage("");
      return;
    }

    await finalizeSuccessfulLogin(redirectTo);
  };

  const loginWithPassword = async () => {
    const response = await fetch(`/api/public/${publicSlug}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: senha,
        turnstileToken: turnstileEnabled ? turnstileToken || undefined : undefined,
      }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      handleAuthFailure(body);
      return;
    }

    await loginWithTokens(body, "credentials");
  };

  const requestPasswordlessCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErro("Informe um e-mail válido.");
      return;
    }

    const response = await fetch(`/api/public/${publicSlug}/auth/passwordless/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        turnstileProof: turnstileProof || undefined,
        turnstileToken: turnstileEnabled ? turnstileToken || undefined : undefined,
      }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      if (isTurnstileErrorCode(body?.code)) {
        setErro(resolveTurnstileErrorMessage(body));
        resetTurnstile();
        return;
      }
      if (body?.code === "USER_NOT_FOUND") {
        setErro(
          `Não encontramos uma Conta Fut7Pro com este e-mail. Crie sua conta para solicitar entrada em ${nomeDoRacha}.`
        );
        return;
      }
      setErro(getHumanAuthErrorMessage(body, "Não foi possível enviar o código."));
      return;
    }

    const nextCooldown =
      typeof body?.resendCooldownSeconds === "number" && Number.isFinite(body.resendCooldownSeconds)
        ? Math.max(0, Math.floor(body.resendCooldownSeconds))
        : resendCooldownSeconds;
    const nextProof =
      typeof body?.turnstileProof === "string" && body.turnstileProof.trim()
        ? body.turnstileProof.trim()
        : null;

    setTurnstileProof(nextProof);
    setResendCooldownSeconds(nextCooldown);
    setResendRemainingSeconds(nextCooldown);
    setCodigoEnviado(true);
    setInfoMessage(`Enviamos um código para ${maskEmail(normalizedEmail)}.`);
  };

  const loginWithPasswordlessCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = codigo.replace(/\D+/g, "");
    if (!normalizedEmail) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (normalizedCode.length !== 6) {
      setErro("Informe o código de 6 dígitos.");
      return;
    }

    const response = await fetch(`/api/public/${publicSlug}/auth/passwordless/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        code: normalizedCode,
        turnstileProof: turnstileProof || undefined,
        turnstileToken:
          turnstileEnabled && !turnstileProof ? turnstileToken || undefined : undefined,
      }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      handleAuthFailure(body);
      return;
    }

    await loginWithTokens(body, "passwordless");
  };

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");
    setNotMemberMessage("");
    setRequestJoinInProgress(false);
    setPendingModalOpen(false);
    setNotMemberModalOpen(false);

    try {
      if (isVitrineSlug) {
        setErro(VITRINE_AUTH_BLOCKED_MESSAGE);
        return;
      }

      if (!publicSlug) {
        setErro("Não encontramos este grupo. Confira o link e tente novamente.");
        return;
      }

      const verifyingCodeWithProof = !usarSenha && codigoEnviado && Boolean(turnstileProof);
      if (!verifyingCodeWithProof && !requireTurnstile(turnstileToken, setErro)) {
        return;
      }

      setIsSubmitting(true);

      if (usarSenha) {
        await loginWithPassword();
        return;
      }

      if (!codigoEnviado) {
        await requestPasswordlessCode();
        return;
      }

      await loginWithPasswordlessCode();
    } finally {
      if (turnstileEnabled && (usarSenha || !codigoEnviado || !turnstileProof)) {
        resetTurnstile();
      }
      setIsSubmitting(false);
    }
  };

  if (isVitrineSlug) {
    return (
      <section className="w-full px-4">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-amber-400/30 bg-[#0f1118] p-6 shadow-2xl">
          <div className="mb-4 rounded-lg border border-amber-400/30 bg-[#141824] px-3 py-3 text-center">
            <p className="text-sm font-semibold text-amber-200">Vitrine Fut7Pro</p>
            <p className="mt-1 text-sm text-amber-100">{VITRINE_AUTH_BLOCKED_MESSAGE}</p>
          </div>
          <h1 className="text-xl font-bold text-white text-center">Acesso desabilitado</h1>
          <p className="mt-2 text-center text-sm text-gray-300">
            Para criar seu ambiente real no Fut7Pro, use o cadastro de grupo de futebol.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href="/cadastrar-racha"
              className="inline-flex items-center justify-center rounded-lg bg-brand py-2.5 font-bold text-black hover:bg-brand-soft"
            >
              Criar meu grupo
            </a>
            <a
              href={publicHref("/")}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 py-2.5 font-semibold text-white hover:border-white/30"
            >
              Voltar para vitrine
            </a>
          </div>
        </div>
      </section>
    );
  }

  const renderedMembershipStatus = String(me?.membership?.status || "").toUpperCase();
  const resolvingExistingSession =
    status === "loading" ||
    (status === "authenticated" &&
      !isErrorMe &&
      (!accountStateResolved ||
        isLoadingGlobalProfile ||
        (shouldLoadMe && isLoadingMe) ||
        renderedMembershipStatus === "APROVADO" ||
        renderedMembershipStatus === "PENDENTE"));

  if (resolvingExistingSession) {
    return (
      <section className="w-full px-4">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1118] p-6 text-center shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Acesso do atleta
          </p>
          <h1 className="mt-2 text-xl font-bold text-white">Acesse seu perfil</h1>
          <p className="mt-2 text-sm text-gray-300">Verificando seu acesso a {nomeDoRacha}...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
        <div className="mb-4 rounded-lg border border-brand/30 bg-[#141824] px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
            {isEntryVariant ? "Acesso do atleta" : "Acesso exclusivo"}
          </p>
          <p className="text-sm text-gray-200">
            Login do Atleta no <span className="font-semibold text-brand">{nomeDoRacha}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Use seu e-mail cadastrado ou entre com o Google para acessar seu perfil no{" "}
            <span className="font-semibold text-gray-300">{nomeDoRacha}</span>.
          </p>
        </div>

        <h1 className="text-xl font-bold text-white text-center">Acesse seu perfil</h1>
        <p className="mt-2 text-center text-sm text-gray-300">
          {usarSenha
            ? "Use sua senha para continuar."
            : codigoEnviado
              ? "Digite o código recebido para acessar seu perfil."
              : "Informe seu e-mail para receber um código de acesso."}
        </p>

        {requestJoinIntent ? (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-left text-sm text-amber-100">
            <p className="font-semibold text-amber-200">
              Você ainda não faz parte de {nomeDoRacha}
            </p>
            <p className="mt-1">
              Entre com código enviado por e-mail ou com sua senha para solicitar entrada. Assim que
              o administrador aprovar, você entra nos rankings, estatísticas e comunicação do grupo.
            </p>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              Mensagem para o administrador, opcional
              <textarea
                value={joinMessage}
                onChange={(event) =>
                  setJoinMessage(event.target.value.slice(0, MAX_JOIN_MESSAGE_LENGTH))
                }
                placeholder="Ex: Olá, sou aqui da cidade, ouvi falar muito bem do grupo de futebol de vocês e gostaria de participar quando tiver vaga."
                maxLength={MAX_JOIN_MESSAGE_LENGTH}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-amber-300/20 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white placeholder:text-amber-100/45 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </label>
            <div className="mt-1 flex items-start justify-between gap-3 text-xs text-amber-100/75">
              <span>
                Use este espaço para se apresentar rapidamente. Essa mensagem será enviada junto com
                sua solicitação de entrada.
              </span>
              <span className="shrink-0">
                {joinMessage.length}/{MAX_JOIN_MESSAGE_LENGTH}
              </span>
            </div>
          </div>
        ) : null}

        {erro ? (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {erro}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: googleCallbackHref })}
            aria-label="Continuar com Google"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
          >
            <span className="flex items-center justify-center gap-2">
              <Image src="/images/Google-Logo.png" alt="Logo do Google" width={18} height={18} />
              Continuar com Google
            </span>
          </button>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gray-500">
            <span className="h-px flex-1 bg-white/10" />
            ou
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="mt-4 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="email@exemplo.com"
              disabled={!usarSenha && codigoEnviado}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          {!usarSenha && (
            <>
              {codigoEnviado ? (
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Código de acesso
                  <input
                    type="text"
                    value={codigo}
                    onChange={(event) =>
                      setCodigo(event.target.value.replace(/\D+/g, "").slice(0, 6))
                    }
                    required
                    inputMode="numeric"
                    placeholder="Digite os 6 dígitos"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
              ) : (
                <div className="rounded-lg border border-brand/20 bg-brand/10 px-3 py-2 text-xs text-brand-soft">
                  Vamos enviar um código para seu e-mail.
                </div>
              )}
            </>
          )}

          {usarSenha && (
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Senha
              <div className="relative">
                <input
                  type={senhaVisivel ? "text" : "password"}
                  ref={passwordInputRef}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setSenhaVisivel((visivel) => !visivel)}
                  aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 transition hover:text-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {senhaVisivel ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>
          )}

          {!usarSenha && infoMessage && (
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              {infoMessage}
            </div>
          )}
          {(usarSenha || !codigoEnviado || !turnstileProof) && (
            <TurnstileWidget
              enabled={turnstileEnabled}
              siteKey={turnstileSiteKey}
              onTokenChange={setTurnstileToken}
              resetSignal={turnstileResetSignal}
            />
          )}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (turnstileEnabled &&
                (usarSenha || !codigoEnviado || !turnstileProof) &&
                !turnstileToken)
            }
            className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Processando..."
              : usarSenha
                ? "Entrar com senha"
                : codigoEnviado
                  ? "Acessar perfil"
                  : "Enviar código de acesso"}
          </button>
          {!usarSenha && codigoEnviado ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setCodigo("");
                  setCodigoEnviado(false);
                  setInfoMessage("");
                  setTurnstileProof(null);
                  setResendRemainingSeconds(0);
                  resetTurnstile();
                }}
                className="rounded-lg border border-white/15 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-200 hover:border-white/30"
              >
                Trocar e-mail
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resendRemainingSeconds > 0 || isSubmitting) return;
                  setErro("");
                  setCodigo("");
                  void requestPasswordlessCode();
                }}
                disabled={resendRemainingSeconds > 0 || isSubmitting}
                className="rounded-lg border border-white/15 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-200 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resendRemainingSeconds > 0
                  ? `Reenviar em ${resendRemainingSeconds}s`
                  : "Reenviar código"}
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setUsarSenha((prev) => !prev);
              setErro("");
              setCodigoEnviado(false);
              setCodigo("");
              setInfoMessage("");
              setTurnstileProof(null);
            }}
            className="w-full rounded-lg border border-white/15 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-200 hover:border-white/30"
          >
            {usarSenha ? "Voltar para código por e-mail" : "Entrar com senha"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <a
            href={publicHref("/esqueci-senha")}
            className="text-sm font-semibold text-brand-soft underline hover:text-brand"
          >
            Esqueci minha senha
          </a>
        </div>

        <div className="mt-5 text-center text-sm text-gray-300">
          Ainda não tem conta?{" "}
          <a
            href={buildRegisterHref(email)}
            className="text-brand-soft underline hover:text-brand-soft"
          >
            Criar Conta Fut7Pro
          </a>
        </div>
      </div>

      <Transition appear show={pendingModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setPendingModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1118] p-6 text-white shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Solicitação pendente
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-300">
                  Sua entrada em <span className="font-semibold text-brand">{nomeDoRacha}</span>{" "}
                  ainda está aguardando aprovação. Assim que os administradores aprovarem, você
                  poderá acessar normalmente.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Entre em contato com os administradores e solicite sua aprovação.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setPendingModalOpen(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-white/30"
                  >
                    Ok
                  </button>
                  <a
                    href={publicHref("/")}
                    className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-black"
                  >
                    Voltar para o site
                  </a>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={notMemberModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setNotMemberModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1118] p-6 text-white shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Solicitar entrada
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-300">
                  Sua Conta Fut7Pro está pronta. Agora envie sua solicitação para participar de{" "}
                  <span className="font-semibold text-brand">{nomeDoRacha}</span>.
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Criar sua conta no Fut7Pro não aprova automaticamente sua entrada em{" "}
                  <span className="font-semibold text-brand">{nomeDoRacha}</span>. O administrador
                  poderá aprovar ou recusar seu pedido.
                </p>
                <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
                  Mensagem para o administrador, opcional
                  <textarea
                    value={joinMessage}
                    onChange={(event) =>
                      setJoinMessage(event.target.value.slice(0, MAX_JOIN_MESSAGE_LENGTH))
                    }
                    placeholder="Ex: Olá, sou aqui da cidade, ouvi falar muito bem do grupo de futebol de vocês e gostaria de participar quando tiver vaga."
                    maxLength={MAX_JOIN_MESSAGE_LENGTH}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm normal-case tracking-normal text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>
                <div className="mt-1 flex items-start justify-between gap-3 text-xs text-gray-400">
                  <span>
                    Use este espaço para se apresentar rapidamente. Essa mensagem será enviada junto
                    com sua solicitação de entrada.
                  </span>
                  <span className="shrink-0">
                    {joinMessage.length}/{MAX_JOIN_MESSAGE_LENGTH}
                  </span>
                </div>
                {notMemberMessage ? (
                  <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {notMemberMessage}
                  </div>
                ) : null}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setNotMemberModalOpen(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-white/30"
                  >
                    Ok
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestJoin}
                    disabled={requestJoinLoading}
                    className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {requestJoinLoading ? "Solicitando..." : `Solicitar entrada em ${nomeDoRacha}`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
