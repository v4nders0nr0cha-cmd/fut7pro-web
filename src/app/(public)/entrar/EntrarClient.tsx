"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";

type LookupResponse = {
  exists: boolean;
  userExists?: boolean;
  providers: string[];
  hasPassword: boolean;
  availableAuthMethods?: Array<"google" | "password">;
  membershipStatus?: "NONE" | "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED";
  nextAction?: "REGISTER" | "LOGIN" | "REQUEST_JOIN" | "WAIT_APPROVAL" | "BLOCKED_MESSAGE";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoFlowLoading, setAutoFlowLoading] = useState(false);
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

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", destinationHref);
    return `${publicHref("/login")}?${params.toString()}`;
  }, [destinationHref, publicHref]);

  const registerHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/entrar"));
    return `${publicHref("/register")}?${params.toString()}`;
  }, [publicHref]);

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

  const handleLookup = async () => {
    setError("");

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
    }
  };

  const handleGoogle = async () => {
    setError("");
    await signIn("google", {
      callbackUrl: googleCallbackHref,
      login_hint: email.trim() || undefined,
    });
  };

  const handleGoogleRegister = async () => {
    if (sessionStatus === "authenticated" && sessionUser?.authProvider === "google") {
      router.push(registerHref);
      return;
    }
    await handleGoogle();
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

      setResult(lookup);

      const resolvedExists = Boolean(lookup.userExists ?? lookup.exists);
      const resolvedAction =
        lookup.nextAction ?? (resolvedExists ? ("LOGIN" as const) : ("REGISTER" as const));
      const resolvedMembership = lookup.membershipStatus ?? (resolvedExists ? "ACTIVE" : "NONE");

      if (resolvedAction === "LOGIN" && resolvedMembership === "ACTIVE") {
        router.replace(destinationHref);
        return;
      }

      if (resolvedAction === "REQUEST_JOIN") {
        try {
          const join = await requestJoin();
          const joinStatus = String(join?.status || "").toUpperCase();
          const joinMembershipStatus = String(join?.membershipStatus || "").toUpperCase();
          const isActive = joinStatus === "APROVADO" || joinMembershipStatus === "ACTIVE";

          if (isActive) {
            router.replace(destinationHref);
            return;
          }

          setResult((previous) => ({
            ...(previous ?? lookup),
            exists: true,
            userExists: true,
            membershipStatus: "PENDING",
            nextAction: "WAIT_APPROVAL",
            requiresCaptcha: false,
          }));
        } catch (joinError) {
          const message =
            joinError instanceof Error
              ? joinError.message
              : "Não foi possível solicitar entrada neste racha.";
          setError(message);
        }
      }
    })().finally(() => setAutoFlowLoading(false));
  }, [
    destinationHref,
    googleIntent,
    publicSlug,
    requestJoin,
    router,
    runLookup,
    sessionStatus,
    sessionUser?.email,
  ]);

  const resolvedUserExists = Boolean(result?.userExists ?? result?.exists);
  const availableAuthMethods = useMemo(() => {
    if (result?.availableAuthMethods?.length) {
      return result.availableAuthMethods;
    }
    const methods: Array<"google" | "password"> = [];
    if (result?.providers?.includes("google")) {
      methods.push("google");
    }
    if (result?.hasPassword) {
      methods.push("password");
    }
    return methods;
  }, [result?.availableAuthMethods, result?.providers, result?.hasPassword]);
  const hasGoogle = availableAuthMethods.includes("google");
  const hasPassword = availableAuthMethods.includes("password") || Boolean(result?.hasPassword);
  const membershipStatus = result?.membershipStatus ?? (resolvedUserExists ? "ACTIVE" : "NONE");
  const nextAction =
    result?.nextAction ?? (resolvedUserExists ? ("LOGIN" as const) : ("REGISTER" as const));
  const showGoogleOnly = nextAction === "LOGIN" && hasGoogle && !hasPassword;

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
  }, [email]);

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

          <div className="mt-3 min-h-[180px]">
            {autoFlowLoading && !result && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                Validando seu acesso neste racha...
              </div>
            )}

            {!autoFlowLoading && !result && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                Entre com Google para seguir com poucos cliques ou informe seu e-mail para o Fut7Pro
                indicar o fluxo correto.
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
                {nextAction === "LOGIN" && (
                  <>
                    <div className="mb-1 font-semibold text-white">Conta encontrada</div>
                    <p className="mb-4">
                      {showGoogleOnly
                        ? "Encontramos sua Conta Fut7Pro. Continue para entrar com Google."
                        : "Encontramos sua Conta Fut7Pro. Continue para entrar com sua senha."}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {showGoogleOnly ? (
                        <button
                          type="button"
                          onClick={handleGoogle}
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Image
                              src="/images/Google-Logo.png"
                              alt="Google"
                              width={18}
                              height={18}
                            />
                            Entrar com Google
                          </span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => router.push(loginHref)}
                            className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                          >
                            {hasGoogle ? "Entrar com senha" : "Ir para login"}
                          </button>
                          {hasGoogle && (
                            <button
                              type="button"
                              onClick={handleGoogle}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Image
                                  src="/images/Google-Logo.png"
                                  alt="Google"
                                  width={18}
                                  height={18}
                                />
                                Entrar com Google
                              </span>
                            </button>
                          )}
                        </>
                      )}
                      {hasPassword && (
                        <a
                          href="/admin/esqueci-senha"
                          className="flex-1 rounded-lg border border-white/10 bg-transparent py-2 text-center text-sm font-semibold text-white/80 hover:border-white/30"
                        >
                          Esqueci minha senha
                        </a>
                      )}
                    </div>
                  </>
                )}

                {nextAction === "REQUEST_JOIN" && (
                  <>
                    <div className="mb-1 font-semibold text-white">Conta Fut7Pro existente</div>
                    <p className="mb-4">
                      Sua conta já existe. Solicite entrada neste racha para liberar seu perfil e
                      rankings.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => router.push(loginHref)}
                        className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                      >
                        Entrar para solicitar
                      </button>
                      {hasGoogle && (
                        <button
                          type="button"
                          onClick={handleGoogle}
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Image
                              src="/images/Google-Logo.png"
                              alt="Google"
                              width={18}
                              height={18}
                            />
                            Continuar com Google
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {nextAction === "WAIT_APPROVAL" && (
                  <>
                    <div className="mb-1 font-semibold text-white">Solicitação pendente</div>
                    <p className="mb-4">
                      Sua solicitação já foi enviada e está aguardando aprovação do administrador.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => router.push(publicHref("/aguardando-aprovacao"))}
                        className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                      >
                        Acompanhar status
                      </button>
                      <button
                        type="button"
                        onClick={() => setResult(null)}
                        className="flex-1 rounded-lg border border-white/10 bg-transparent py-2 text-sm font-semibold text-white/80 hover:border-white/30"
                      >
                        Voltar
                      </button>
                    </div>
                  </>
                )}

                {nextAction === "BLOCKED_MESSAGE" && (
                  <>
                    <div className="mb-1 font-semibold text-white">Acesso indisponível</div>
                    <p className="mb-4">
                      {membershipStatus === "REJECTED"
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
                  </>
                )}

                {nextAction === "REGISTER" && (
                  <>
                    <div className="mb-1 font-semibold text-yellow-300">
                      Primeiro acesso no Fut7Pro
                    </div>
                    <p className="mb-4">
                      Ainda não existe uma Conta Fut7Pro para este e-mail. Crie sua conta para
                      entrar e participar dos rachas.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(registerHref)}
                        className="w-full rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                      >
                        Criar conta Fut7Pro
                      </button>
                      <button
                        type="button"
                        onClick={handleGoogleRegister}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Image
                            src="/images/Google-Logo.png"
                            alt="Google"
                            width={18}
                            height={18}
                          />
                          Cadastrar com Google
                        </span>
                      </button>
                    </div>
                  </>
                )}
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
