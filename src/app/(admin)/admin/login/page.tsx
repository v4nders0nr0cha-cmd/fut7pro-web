"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { safeCallbackUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

const VIDEO_DESKTOP = "/videos/soccer-background.mp4";
const VIDEO_MOBILE = "/videos/soccer-background-mobile.mp4";

function getSafeTarget(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (typeof window === "undefined") return fallback;
  return safeCallbackUrl(url, fallback, window.location.origin);
}

function AdminLoginPageInner() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();

  const callbackUrl = useMemo(
    () => safeCallbackUrl(searchParams?.get("callbackUrl"), "/admin"),
    [searchParams]
  );

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
        callbackUrl,
      });

      if (!result?.ok || result.error) {
        notify({ message: result?.error || "E-mail ou senha inválidos.", type: "error" });
        return;
      }

      const target = getSafeTarget(result.url, callbackUrl ?? "/admin");
      router.push(target);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("Erro ao autenticar administrador", error);
      }
      notify({ message: "Não foi possível acessar o painel. Tente novamente.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* VÍDEO DE FUNDO — sempre ativo (desktop e mobile), sem imagem de fallback */}
      <video
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-center md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={VIDEO_DESKTOP} type="video/mp4" />
      </video>

      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center md:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={VIDEO_MOBILE} type="video/mp4" />
      </video>

      {/* Overlays para contraste/legibilidade */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/55 to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-300/80">
              Fut7Pro Admin
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">Acesse o painel de gestão</h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-200">
              Organize seu racha, acompanhe finanças e convide novos administradores em um ambiente
              seguro e otimizado para quem está no comando.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block text-left text-sm font-medium text-zinc-200">
              E-mail corporativo
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                placeholder="voce@fut7pro.com.br"
              />
            </label>

            <label className="block text-left text-sm font-medium text-zinc-200">
              Senha
              <input
                type="password"
                name="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-400 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                placeholder="Sua senha"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-yellow-400 py-3 text-base font-bold uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(255,215,0,0.35)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Validando credenciais..." : "Entrar no painel"}
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center text-sm text-zinc-200">
            <p>
              Primeiro acesso?{" "}
              <Link
                href="/admin/register"
                className="font-semibold text-yellow-300 hover:text-yellow-200"
              >
                Cadastre seu racha
              </Link>
            </p>
            <p>
              Precisa de ajuda?{" "}
              <Link href="/contato" className="font-semibold text-yellow-300 hover:text-yellow-200">
                Fale com o suporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          Carregando...
        </main>
      }
    >
      <AdminLoginPageInner />
    </Suspense>
  );
}
