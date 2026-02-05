"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useTema } from "@/hooks/useTema";

type LookupResponse = {
  exists: boolean;
  providers: string[];
  hasPassword: boolean;
  requiresCaptcha?: boolean;
};

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
  const { publicHref, publicSlug } = usePublicLinks();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileWidgetId = useRef<string | number | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const needsCaptcha = Boolean(result?.requiresCaptcha);

  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/"));
    return `${publicHref("/login")}?${params.toString()}`;
  }, [publicHref]);

  const registerHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/entrar"));
    return `${publicHref("/register")}?${params.toString()}`;
  }, [publicHref]);

  const handleLookup = async () => {
    setError("");
    setResult(null);
    if (needsCaptcha && !captchaToken) {
      setError("Confirme a verificação para continuar.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/lookup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          rachaSlug: publicSlug,
          captchaToken: captchaToken || undefined,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (body?.code === "CAPTCHA_REQUIRED" || body?.code === "CAPTCHA_INVALID") {
          setResult({ exists: false, providers: [], hasPassword: false, requiresCaptcha: true });
          setCaptchaToken(null);
          setError(
            body?.code === "CAPTCHA_INVALID"
              ? "Verificação inválida. Tente novamente."
              : "Muitas tentativas. Confirme a verificação para continuar."
          );
          return;
        }
        setError(body?.message || body?.error || "Não foi possível verificar o e-mail.");
        return;
      }
      setResult(body as LookupResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao verificar o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: publicHref("/") });
  };

  const hasGoogle = result?.providers?.includes("google");
  const showLoginCta = Boolean(result?.exists && result?.hasPassword);
  const showGoogleOnly = Boolean(result?.exists && hasGoogle && !result?.hasPassword);

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Entrar no Fut7Pro</h1>
          <p className="text-sm text-gray-300">
            Digite seu e-mail para continuar. Se você já usa o Fut7Pro em outro racha, é a mesma
            conta e a mesma senha.
          </p>
        </div>

        <div className="flex flex-col gap-3">
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
            <div className="flex items-center justify-start">
              <div id="turnstile-container" />
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
            disabled={loading || (needsCaptcha && !captchaToken)}
            className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Verificando..." : "Continuar"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#12141c] p-4 text-sm text-gray-200">
            <div className="font-semibold text-white mb-1">O que é uma Conta Fut7Pro?</div>É a sua
            conta global no Fut7Pro. Nela ficam salvos todos os rachas que você participa, e você
            consegue alternar entre eles com facilidade, sem criar várias contas diferentes.
          </div>
          <div className="rounded-xl border border-white/10 bg-[#12141c] p-4 text-sm text-gray-200">
            <div className="font-semibold text-white mb-1">
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

        {result && (
          <div className="mt-6 rounded-xl border border-white/10 bg-[#141824] p-4 text-sm text-gray-200">
            {result.exists ? (
              <>
                <div className="font-semibold text-white mb-1">Conta encontrada</div>
                <p className="mb-4">
                  Encontramos sua Conta Fut7Pro. Continue para entrar com sua senha.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {showGoogleOnly ? (
                    <button
                      type="button"
                      onClick={handleGoogle}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                    >
                      Continuar com Google
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => router.push(loginHref)}
                        className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                      >
                        Ir para Login
                      </button>
                      {hasGoogle && (
                        <button
                          type="button"
                          onClick={handleGoogle}
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                        >
                          Continuar com Google
                        </button>
                      )}
                    </>
                  )}
                  {result.hasPassword && (
                    <a
                      href="/admin/esqueci-senha"
                      className="flex-1 rounded-lg border border-white/10 bg-transparent py-2 text-center text-sm font-semibold text-white/80 hover:border-white/30"
                    >
                      Esqueci minha senha
                    </a>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-white mb-1">Primeiro acesso no Fut7Pro</div>
                <p className="mb-4">
                  Ainda não existe uma Conta Fut7Pro para este e-mail. Crie sua conta para entrar e
                  participar dos rachas.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push(registerHref)}
                    className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-black"
                  >
                    Criar conta Fut7Pro
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
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          Acesso do racha: <span className="text-gray-300">{nome}</span>
        </div>
      </div>
    </section>
  );
}
