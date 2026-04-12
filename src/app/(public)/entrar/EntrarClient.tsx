"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";
import { persistPublicAuthContext } from "@/utils/public-auth-flow";
import { isAthleteSession } from "@/lib/auth/realm";

type LookupResponse = {
  ok: true;
  message: string;
  requiresCaptcha?: boolean;
  nextAction?: "REGISTER" | "LOGIN" | "REQUEST_JOIN" | "WAIT_APPROVAL" | "BLOCKED_MESSAGE";
  membershipStatus?: "NONE" | "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
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
const LOOKUP_UNIFORM_MESSAGE = "Se estiver tudo certo, enviamos seu código.";
const VITRINE_AUTH_BLOCKED_MESSAGE =
  "Racha Vitrine é apenas demonstrativo. Login e cadastro de atletas ficam disponíveis no site do seu racha.";

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
  const isAthleteRealmSession = isAthleteSession(session as any);
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
  const emailFieldInvalid = error === "Informe um e-mail válido.";
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
            setResult({ ok: true, message: LOOKUP_UNIFORM_MESSAGE, requiresCaptcha: true });
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

  const redirectFromLookup = useCallback(
    (normalizedEmail: string, lookup: LookupResponse) => {
      const nextAction = String(lookup?.nextAction || "").toUpperCase();
      const lookupMessage = lookup?.message || LOOKUP_UNIFORM_MESSAGE;

      persistPublicAuthContext({
        email: normalizedEmail,
        slug: publicSlug,
      });
      setResult(null);
      setError("");
      setRedirectingMessage(lookupMessage);
      setAutoFlowLoading(true);

      if (nextAction === "WAIT_APPROVAL") {
        router.replace(publicHref("/aguardando-aprovacao"));
        return;
      }

      if (nextAction === "REGISTER") {
        const registerParams = new URLSearchParams();
        registerParams.set("callbackUrl", destinationHref);
        router.replace(`${publicHref("/register")}?${registerParams.toString()}`);
        return;
      }

      const loginParams = new URLSearchParams();
      loginParams.set("callbackUrl", destinationHref);

      if (nextAction === "REQUEST_JOIN") {
        loginParams.set("intent", "request-join");
      }

      router.replace(`${publicHref("/login")}?${loginParams.toString()}`);
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
      setResult(lookup);
      redirectFromLookup(normalized, lookup);
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
    if (!publicSlug) {
      throw new Error("Slug do racha não encontrado.");
    }

    const performJoin = () =>
      fetch(`/api/public/${publicSlug}/auth/request-join`, {
        method: "POST",
      });

    let response = await performJoin();
    if (response.status === 401) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      response = await performJoin();
    }

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
    };
  }, [publicSlug]);

  useEffect(() => {
    if (!googleIntent) return;
    if (sessionStatus === "authenticated" && !isAthleteRealmSession) {
      setError("Sessao administrativa detectada. Faça login como atleta para continuar.");
      return;
    }
    if (sessionStatus !== "authenticated" || !isAthleteRealmSession) return;
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
      persistPublicAuthContext({
        email: sessionEmail,
        slug: publicSlug,
      });
      setRedirectingMessage(LOOKUP_UNIFORM_MESSAGE);

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
      } catch (joinError) {
        const message =
          joinError instanceof Error
            ? joinError.message
            : "Não foi possível solicitar entrada neste racha.";
        setError(message);
      }
    })().finally(() => setAutoFlowLoading(false));
  }, [
    destinationHref,
    googleIntent,
    isVitrineSlug,
    publicSlug,
    publicHref,
    requestJoin,
    router,
    sessionStatus,
    isAthleteRealmSession,
    sessionUser?.email,
  ]);

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
    setResult(null);
    setRedirectingMessage("");
  }, [email]);

  if (isVitrineSlug) {
    return (
      <section className="w-full px-4">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-amber-400/30 bg-[#0f1118] p-6 shadow-2xl md:p-7">
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <Image src="/images/logos/logo_fut7pro.png" alt="Fut7Pro" width={52} height={52} />
            <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Racha vitrine
            </span>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Entrar no Racha Vitrine</h1>
            <p className="max-w-2xl text-sm text-amber-100">
              Este racha é apenas uma demonstração para você ver como fica o site do seu racha no
              Fut7Pro.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm leading-relaxed text-gray-200 md:p-5">
            <p>
              No site do seu racha, o botão <strong>&quot;Entrar&quot;</strong> serve para o atleta
              se cadastrar e participar do racha (com aprovação do administrador, se esse controle
              estiver ativo).
            </p>
            <p className="mt-3">
              Aqui no Racha Vitrine, não existe administrador nem cadastro de atletas. Por isso o
              botão <strong>&quot;Entrar&quot;</strong> leva para esta explicação, evitando confusão
              e cadastros indevidos.
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold text-white">O que você quer fazer agora?</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <a
                href={publicHref("/")}
                className="rounded-xl border border-white/10 bg-[#141824] p-4 text-left text-white transition hover:border-white/30"
              >
                <span className="block text-sm font-bold text-white">
                  Voltar e continuar explorando o Racha Vitrine
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-300">
                  Ver partidas, rankings, destaques e como o site do seu racha vai ficar.
                </span>
              </a>
              <a
                href="/cadastrar-racha"
                className="rounded-xl border border-brand bg-brand/15 p-4 text-left text-brand transition hover:bg-brand hover:text-black"
              >
                <span className="block text-sm font-bold">
                  Criar o site do meu racha no Fut7Pro
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-brand-soft">
                  Em poucos minutos você cria sua página exclusiva e ativa seu painel
                  administrativo.
                </span>
              </a>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              Sem compromisso. Você pode testar antes e personalizar depois (nome, logo, cores e
              patrocinadores).
            </p>
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
            Você pode continuar com Google ou informar seu e-mail para seguir com segurança.
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
            aria-invalid={emailFieldInvalid}
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
                {redirectingMessage || LOOKUP_UNIFORM_MESSAGE}
              </div>
            )}

            {!loading && !autoFlowLoading && !redirectingMessage && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                Ao continuar, você segue para o login do racha. Se estiver tudo certo, enviamos seu
                código.
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
