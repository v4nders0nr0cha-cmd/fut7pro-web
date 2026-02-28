"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";
import { persistPublicAuthContext } from "@/utils/public-auth-flow";

type LookupResponse = {
  exists: boolean;
  userExists?: boolean;
  providers: string[];
  hasPassword: boolean;
  availableAuthMethods?: Array<"google" | "password">;
  membershipStatus?: "NONE" | "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
  nextAction?:
    | "REGISTER"
    | "LOGIN"
    | "REQUEST_JOIN"
    | "WAIT_APPROVAL"
    | "BLOCKED_MESSAGE"
    | "RACHA_NOT_FOUND";
  requiresCaptcha?: boolean;
};

type SessionUser = {
  email?: string | null;
  authProvider?: string | null;
  name?: string | null;
};

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const CAPTCHA_REQUIRED_MESSAGE =
  'Muitas tentativas. Confirme no captcha "Não sou robô" para continuar.';
const CAPTCHA_INVALID_MESSAGE =
  'Não foi possível validar o captcha. Marque novamente "Não sou robô".';
const CAPTCHA_UNAVAILABLE_MESSAGE =
  "A verificação de segurança está indisponível no momento. Tente novamente em instantes ou use Continuar com Google.";
const LOOKUP_STATE_ERROR_MESSAGE = "Falha ao verificar conta, tente novamente.";
const VITRINE_AUTH_BLOCKED_MESSAGE =
  "Racha vitrine e apenas demonstrativo. Login e cadastro de atletas estao desabilitados.";
const VALID_NEXT_ACTIONS = new Set([
  "REGISTER",
  "LOGIN",
  "REQUEST_JOIN",
  "WAIT_APPROVAL",
  "BLOCKED_MESSAGE",
]);
const VALID_MEMBERSHIP_STATUSES = new Set(["NONE", "PENDING", "ACTIVE", "REJECTED", "BLOCKED"]);

function hasResolvedLookupState(payload: LookupResponse | null): payload is LookupResponse & {
  nextAction: "REGISTER" | "LOGIN" | "REQUEST_JOIN" | "WAIT_APPROVAL" | "BLOCKED_MESSAGE";
  membershipStatus: "NONE" | "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
} {
  if (!payload) return false;
  if (!payload.nextAction || !VALID_NEXT_ACTIONS.has(payload.nextAction)) return false;
  if (!payload.membershipStatus || !VALID_MEMBERSHIP_STATUSES.has(payload.membershipStatus)) {
    return false;
  }
  return true;
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
    // ignorar callback inválido
  }
  return fallback;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string, options: Record<string, unknown>) => string | number;
      reset: (widgetId?: string | number) => void;
      remove: (widgetId?: string | number) => void;
    };
  }
}

export default function EntrarClient() {
  const { nome } = useTema();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const { publicHref, publicSlug } = usePublicLinks();
  const isVitrineSlug = publicSlug?.toLowerCase() === "vitrine";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoFlowLoading, setAutoFlowLoading] = useState(false);
  const [redirectingMessage, setRedirectingMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileWidgetId = useRef<string | number | null>(null);
  const processedGoogleKey = useRef<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const needsCaptcha = Boolean(result?.requiresCaptcha);
  const callbackParam = searchParams.get("callbackUrl");
  const googleIntent = searchParams.get("google") === "1";

  const destinationHref = useMemo(
    () => resolveRedirect(callbackParam, publicHref("/")),
    [callbackParam, publicHref]
  );

  const googleCallbackHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("google", "1");
    if (callbackParam) {
      params.set("callbackUrl", callbackParam);
    }
    return `${publicHref("/entrar")}?${params.toString()}`;
  }, [callbackParam, publicHref]);

  const runLookup = useCallback(
    async (normalizedEmail: string, providedCaptcha?: string | null) => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/lookup-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            rachaSlug: publicSlug,
            captchaToken: providedCaptcha || undefined,
          }),
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
          if (body?.code === "CAPTCHA_REQUIRED" || body?.code === "CAPTCHA_INVALID") {
            setResult({ exists: false, providers: [], hasPassword: false, requiresCaptcha: true });
            setCaptchaToken(null);
            setError(
              body?.code === "CAPTCHA_INVALID"
                ? CAPTCHA_INVALID_MESSAGE
                : turnstileSiteKey
                  ? CAPTCHA_REQUIRED_MESSAGE
                  : CAPTCHA_UNAVAILABLE_MESSAGE
            );
            return null;
          }
          if (body?.code === "RACHA_NOT_FOUND") {
            setResult(null);
            setError("Racha não encontrado.");
            return null;
          }
          setError(body?.message || body?.error || "Não foi possível verificar o e-mail.");
          return null;
        }

        return body as LookupResponse;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao verificar o e-mail.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicSlug, turnstileSiteKey]
  );

  const redirectFromResolvedState = useCallback(
    (
      lookup: LookupResponse & {
        nextAction: "REGISTER" | "LOGIN" | "REQUEST_JOIN" | "WAIT_APPROVAL" | "BLOCKED_MESSAGE";
        membershipStatus: "NONE" | "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
      },
      normalizedEmail: string,
      options?: { fromGoogle?: boolean }
    ) => {
      if (lookup.nextAction === "BLOCKED_MESSAGE") {
        setResult(lookup);
        setRedirectingMessage("");
        return;
      }

      persistPublicAuthContext({
        email: normalizedEmail,
        slug: publicSlug,
      });
      setResult(null);
      setError("");
      setRedirectingMessage("Verificando seu e-mail...");
      setAutoFlowLoading(true);

      if (lookup.nextAction === "WAIT_APPROVAL") {
        router.replace(publicHref("/aguardando-aprovacao"));
        return;
      }

      if (lookup.nextAction === "LOGIN") {
        if (
          options?.fromGoogle &&
          lookup.membershipStatus === "ACTIVE" &&
          lookup.availableAuthMethods?.includes("google")
        ) {
          router.replace(destinationHref);
          return;
        }

        const params = new URLSearchParams();
        params.set("callbackUrl", destinationHref);
        router.replace(`${publicHref("/login")}?${params.toString()}`);
        return;
      }

      if (lookup.nextAction === "REQUEST_JOIN") {
        const params = new URLSearchParams();
        params.set("callbackUrl", destinationHref);
        params.set("intent", "request-join");
        router.replace(`${publicHref("/login")}?${params.toString()}`);
        return;
      }

      const params = new URLSearchParams();
      params.set("callbackUrl", destinationHref);
      router.replace(`${publicHref("/register")}?${params.toString()}`);
    },
    [destinationHref, publicHref, publicSlug, router]
  );

  const handleLookup = async () => {
    setError("");
    setRedirectingMessage("");

    if (isVitrineSlug) {
      setError(VITRINE_AUTH_BLOCKED_MESSAGE);
      return;
    }

    if (needsCaptcha) {
      if (!turnstileSiteKey) {
        setError(CAPTCHA_UNAVAILABLE_MESSAGE);
        return;
      }
      if (!captchaToken) {
        setError(CAPTCHA_REQUIRED_MESSAGE);
        return;
      }
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Informe um e-mail válido.");
      return;
    }

    const lookup = await runLookup(normalized, captchaToken);
    if (lookup) {
      if (!hasResolvedLookupState(lookup)) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[EntrarClient] lookup-email sem estado resolvido", lookup);
        }
        setResult(null);
        setError(LOOKUP_STATE_ERROR_MESSAGE);
        return;
      }
      redirectFromResolvedState(lookup, normalized);
    }
  };

  const handleGoogle = async () => {
    setError("");
    if (isVitrineSlug) {
      setError(VITRINE_AUTH_BLOCKED_MESSAGE);
      return;
    }
    await signIn("google", {
      callbackUrl: googleCallbackHref,
      login_hint: email.trim() || undefined,
    });
  };

  const requestJoin = useCallback(async () => {
    const response = await fetch(`/api/public/${publicSlug}/auth/request-join`, {
      method: "POST",
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message = Array.isArray(body?.message)
        ? body.message.join(" ")
        : body?.message || body?.error || "Não foi possível solicitar entrada neste racha.";
      throw new Error(message);
    }

    return body as {
      status?: string;
      membershipStatus?: string;
      nextAction?: string;
    };
  }, [publicSlug]);

  useEffect(() => {
    if (!googleIntent || sessionStatus !== "authenticated") return;
    if (isVitrineSlug) {
      setError(VITRINE_AUTH_BLOCKED_MESSAGE);
      return;
    }

    const sessionEmail = sessionUser?.email?.trim().toLowerCase() || "";
    if (!sessionEmail) {
      setError("Não foi possível identificar seu e-mail da conta Google.");
      return;
    }

    const key = `${publicSlug}:${sessionEmail}`;
    if (processedGoogleKey.current === key) return;
    processedGoogleKey.current = key;

    setEmail(sessionEmail);
    setError("");
    setAutoFlowLoading(true);

    void (async () => {
      const lookup = await runLookup(sessionEmail);
      if (!lookup) return;
      if (!hasResolvedLookupState(lookup)) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[EntrarClient] auto-flow Google sem estado resolvido", lookup);
        }
        setResult(null);
        setError(LOOKUP_STATE_ERROR_MESSAGE);
        return;
      }

      if (lookup.nextAction === "REQUEST_JOIN") {
        try {
          const join = await requestJoin();
          const joinStatus = String(join?.status || "").toUpperCase();
          const joinMembershipStatus = String(join?.membershipStatus || "").toUpperCase();
          const isActive = joinStatus === "APROVADO" || joinMembershipStatus === "ACTIVE";

          if (isActive) {
            router.replace(destinationHref);
            return;
          }

          router.replace(publicHref("/aguardando-aprovacao"));
          return;
        } catch (joinError) {
          const message =
            joinError instanceof Error
              ? joinError.message
              : "Não foi possível solicitar entrada neste racha.";
          setError(message);
          setAutoFlowLoading(false);
          return;
        }
      }

      redirectFromResolvedState(lookup, sessionEmail, { fromGoogle: true });
    })().finally(() => setAutoFlowLoading(false));
  }, [
    destinationHref,
    googleIntent,
    isVitrineSlug,
    publicSlug,
    publicHref,
    requestJoin,
    redirectFromResolvedState,
    router,
    runLookup,
    sessionStatus,
    sessionUser?.email,
  ]);

  const blockedResult = hasResolvedLookupState(result) && result.nextAction === "BLOCKED_MESSAGE";
  const blockedMembershipStatus = blockedResult ? result.membershipStatus : null;

  useEffect(() => {
    if (!needsCaptcha || !turnstileSiteKey || !turnstileReady) return;
    if (!window.turnstile) return;
    if (turnstileWidgetId.current) return;

    const widgetId = window.turnstile.render("#turnstile-container", {
      sitekey: turnstileSiteKey,
      callback: (token: string) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(null),
      "error-callback": () => setCaptchaToken(null),
    });
    turnstileWidgetId.current = widgetId;
  }, [needsCaptcha, turnstileSiteKey, turnstileReady]);

  useEffect(() => {
    if (!needsCaptcha && turnstileWidgetId.current && window.turnstile) {
      window.turnstile.remove(turnstileWidgetId.current);
      turnstileWidgetId.current = null;
    }
  }, [needsCaptcha]);

  useEffect(() => {
    setCaptchaToken(null);
    setResult((previous) => (previous?.nextAction === "BLOCKED_MESSAGE" ? null : previous));
    setRedirectingMessage("");
  }, [email]);

  if (isVitrineSlug) {
    return (
      <section className="w-full px-4">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-[#0f1118] p-6 shadow-2xl">
          <div className="mb-4 flex flex-col items-center gap-2 text-center">
            <Image src="/images/logos/logo_fut7pro.png" alt="Fut7Pro" width={52} height={52} />
            <h1 className="text-2xl font-bold text-white md:text-3xl">Racha Vitrine</h1>
            <p className="text-sm text-amber-100">{VITRINE_AUTH_BLOCKED_MESSAGE}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
            Este ambiente e somente de demonstracao. Para usar o Fut7Pro de verdade, crie seu
            proprio racha.
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <a
              href="/cadastrar-racha"
              className="inline-flex items-center justify-center rounded-lg bg-brand py-2.5 font-bold text-black hover:bg-brand-soft"
            >
              Criar meu racha
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

  return (
    <section className="w-full px-4">
      {needsCaptcha && turnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          onLoad={() => setTurnstileReady(true)}
        />
      )}
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <Image src="/images/logos/logo_fut7pro.png" alt="Fut7Pro" width={52} height={52} />
          <h1 className="text-2xl font-bold text-white md:text-3xl">Entrar no Fut7Pro</h1>
          <p className="text-sm text-gray-300">
            Você pode continuar com Google ou informar seu e-mail. Vamos indicar o próximo passo
            para este racha.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || autoFlowLoading}
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ex: seuemail@dominio.com"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
          />

          {needsCaptcha && (
            <div className="space-y-2">
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Confirme no captcha abaixo que você não é um robô. Essa etapa é de segurança e não
                de verificação de e-mail.
              </div>
              {turnstileSiteKey ? (
                <div className="flex items-center justify-start">
                  <div id="turnstile-container" />
                </div>
              ) : (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {CAPTCHA_UNAVAILABLE_MESSAGE}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLookup}
            disabled={loading || autoFlowLoading || (needsCaptcha && !captchaToken)}
            className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading || autoFlowLoading ? "Processando..." : "Continuar"}
          </button>

          <div className="mt-3 min-h-[120px]">
            {(loading || autoFlowLoading || redirectingMessage) && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                {redirectingMessage || "Verificando seu e-mail..."}
              </div>
            )}

            {!loading && !autoFlowLoading && !redirectingMessage && !blockedResult && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                Esta tela identifica o próximo passo. Após clicar em continuar, você será
                redirecionado automaticamente para login, cadastro ou aprovação.
              </div>
            )}

            {!loading && !autoFlowLoading && !redirectingMessage && blockedResult && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                <div className="mb-1 font-semibold text-white">Acesso indisponível</div>
                <p className="mb-4">
                  {blockedMembershipStatus === "REJECTED"
                    ? "Sua solicitação foi recusada para este racha. Fale com o administrador para uma nova análise."
                    : "Seu acesso a este racha está bloqueado no momento. Entre em contato com o administrador."}
                </p>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-full rounded-lg border border-white/10 bg-transparent py-2 text-sm font-semibold text-white/80 hover:border-white/30"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#12141c] p-4 text-sm text-gray-200">
            <div className="mb-1 font-semibold text-white">O que é uma Conta Fut7Pro?</div>É a sua
            conta global no Fut7Pro. Nela ficam salvos todos os rachas que você participa, e você
            consegue alternar entre eles com facilidade, sem criar várias contas diferentes.
          </div>
          <div className="rounded-xl border border-white/10 bg-[#12141c] p-4 text-sm text-gray-200">
            <div className="mb-1 font-semibold text-white">
              Por que usar uma conta única para vários rachas?
            </div>
            Porque o Fut7Pro junta seus números e conquistas em um só lugar, mesmo que você jogue em
            rachas diferentes. Você pode ver seu histórico global, como jogos, vitórias, gols,
            assistências, pontuação e títulos, além de acessar rapidamente cada racha em que você
            participa.
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Seu acesso a cada racha depende da sua participação nele. Em alguns casos, pode ser
          necessário solicitar entrada e aguardar aprovação do organizador.
        </p>

        <div className="mt-6 text-center text-xs text-gray-500">
          Acesso do racha: <span className="text-gray-300">{nome}</span>
        </div>
      </div>
    </section>
  );
}
