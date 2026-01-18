"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useMe } from "@/hooks/useMe";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

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

export default function LoginClient() {
  const { nome } = useTema();
  const nomeDoRacha = nome || "Fut7Pro";
  const { publicHref, publicSlug } = usePublicLinks();

  const { data: session, status } = useSession();
  const sessionUser = session?.user as {
    authProvider?: string | null;
    tenantSlug?: string | null;
  } | null;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(
    () => resolveRedirect(searchParams.get("callbackUrl"), publicHref("/perfil")),
    [searchParams, publicHref]
  );

  const shouldCheckProfile =
    status === "authenticated" &&
    sessionUser?.authProvider === "google" &&
    Boolean(sessionUser?.tenantSlug);
  const { me, isLoading: isLoadingMe } = useMe({ enabled: shouldCheckProfile });

  useEffect(() => {
    if (status !== "authenticated") return;

    if (sessionUser?.authProvider === "google") {
      if (!sessionUser?.tenantSlug) {
        router.replace(publicHref("/register"));
        return;
      }

      if (shouldCheckProfile && isLoadingMe) return;

      const profileComplete = Boolean(
        me?.athlete?.birthDay && me?.athlete?.birthMonth && me?.athlete?.position
      );
      if (shouldCheckProfile && !profileComplete) {
        router.replace(publicHref("/register"));
        return;
      }
    }

    router.replace(redirectTo);
  }, [status, sessionUser, redirectTo, router, publicHref, shouldCheckProfile, isLoadingMe, me]);

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
        rachaSlug: publicSlug,
      });

      if (res?.ok) {
        router.replace(redirectTo);
        return;
      }

      setErro("E-mail ou senha invalidos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
        <div className="mb-4 rounded-lg border border-yellow-400/30 bg-[#141824] px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
            Acesso exclusivo
          </p>
          <p className="text-sm text-gray-200">
            Atletas do <span className="font-semibold text-yellow-400">{nomeDoRacha}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">Visitantes podem navegar pelo site.</p>
        </div>

        <h1 className="text-xl font-bold text-white text-center">Login do Atleta</h1>
        <p className="mt-2 text-center text-sm text-gray-300">
          Entre para editar seu perfil e acompanhar as novidades do racha.
        </p>

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
            onClick={() => signIn("google", { callbackUrl: redirectTo })}
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
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Senha
            <div className="relative">
              <input
                type={senhaVisivel ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                autoComplete="current-password"
                placeholder="Digite sua senha"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel((visivel) => !visivel)}
                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 transition hover:text-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                {senhaVisivel ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-300">
          Ainda nao tem conta?{" "}
          <a
            href={publicHref("/register")}
            className="text-yellow-300 underline hover:text-yellow-200"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </section>
  );
}
