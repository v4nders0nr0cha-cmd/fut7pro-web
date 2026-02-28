"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useMe } from "@/hooks/useMe";
import { clearPublicAuthContext, readPublicAuthContext } from "@/utils/public-auth-flow";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const VITRINE_AUTH_BLOCKED_MESSAGE =
  "Racha vitrine e apenas demonstrativo. Login e cadastro de atletas estao desabilitados.";

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
  const isVitrineSlug = publicSlug?.toLowerCase() === "vitrine";

  const { data: session, status } = useSession();
  const sessionUser = session?.user as {
    authProvider?: string | null;
    tenantSlug?: string | null;
  } | null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestJoinIntent = searchParams.get("intent") === "request-join";
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const prefillAppliedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [notMemberModalOpen, setNotMemberModalOpen] = useState(false);
  const [requestJoinInProgress, setRequestJoinInProgress] = useState(false);
  const [requestJoinLoading, setRequestJoinLoading] = useState(false);
  const [notMemberMessage, setNotMemberMessage] = useState("");

  const redirectTo = useMemo(
    () => resolveRedirect(searchParams.get("callbackUrl"), publicHref("/")),
    [searchParams, publicHref]
  );

  const sessionRole = String((session?.user as any)?.role || "").toUpperCase();
  const isAthleteSession = sessionRole === "ATLETA";
  const shouldLoadMe = status === "authenticated" && isAthleteSession && Boolean(publicSlug);
  const {
    me,
    isLoading: isLoadingMe,
    isError: isErrorMe,
  } = useMe({
    enabled: shouldLoadMe,
    tenantSlug: publicSlug,
    context: "athlete",
  });

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    if (!publicSlug) return;
    const context = readPublicAuthContext(publicSlug);
    if (!context?.email) return;

    setEmail((previous) => previous || context.email);
    prefillAppliedRef.current = true;
    requestAnimationFrame(() => passwordInputRef.current?.focus());
  }, [publicSlug]);

  useEffect(() => {
    if (status !== "authenticated" || !isAthleteSession) return;
    if (requestJoinInProgress) return;

    if (sessionUser?.authProvider === "google") {
      if (!publicSlug) {
        router.replace(publicHref("/register"));
        return;
      }

      if (shouldLoadMe && isLoadingMe) return;

      const profileComplete = Boolean(
        me?.athlete?.birthDay && me?.athlete?.birthMonth && me?.athlete?.position
      );
      if (shouldLoadMe && (isErrorMe || !profileComplete)) {
        router.replace(publicHref("/register"));
        return;
      }
    }

    if (shouldLoadMe && isLoadingMe) return;

    const membershipStatus = String(me?.membership?.status || "").toUpperCase();
    if (membershipStatus === "PENDENTE") {
      router.replace(publicHref("/aguardando-aprovacao"));
      return;
    }

    if (isErrorMe) {
      router.replace(publicHref("/register"));
      return;
    }

    router.replace(redirectTo);
  }, [
    status,
    isAthleteSession,
    sessionUser,
    redirectTo,
    router,
    publicHref,
    publicSlug,
    shouldLoadMe,
    isLoadingMe,
    isErrorMe,
    me,
    requestJoinInProgress,
  ]);

  const handleRequestJoin = async () => {
    setErro("");
    setNotMemberMessage("");

    if (isVitrineSlug) {
      setNotMemberMessage(VITRINE_AUTH_BLOCKED_MESSAGE);
      return;
    }

    if (!publicSlug) {
      setNotMemberMessage("Slug do racha não encontrado.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !senha.trim()) {
      setNotMemberMessage("Informe e-mail e senha para solicitar entrada.");
      return;
    }

    setRequestJoinLoading(true);
    setRequestJoinInProgress(true);

    try {
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password: senha,
      });

      if (signInResult?.error) {
        setNotMemberMessage("Não foi possível validar sua conta. Tente novamente.");
        setRequestJoinInProgress(false);
        return;
      }

      const requestJoin = async () =>
        fetch(`/api/public/${publicSlug}/auth/request-join`, {
          method: "POST",
        });

      let response = await requestJoin();
      if (response.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        response = await requestJoin();
      }

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(body?.message)
          ? body.message.join(" ")
          : body?.message || body?.error || "Não foi possível solicitar entrada neste racha.";
        setNotMemberMessage(message);
        setRequestJoinInProgress(false);
        return;
      }

      const joinStatus = String(body?.status || "").toUpperCase();
      const joinMembershipStatus = String(body?.membershipStatus || "").toUpperCase();
      const isActive = joinStatus === "APROVADO" || joinMembershipStatus === "ACTIVE";

      setNotMemberModalOpen(false);
      if (isActive) {
        clearPublicAuthContext();
        router.replace(redirectTo);
        return;
      }

      clearPublicAuthContext();
      router.replace(publicHref("/aguardando-aprovacao"));
    } catch {
      setNotMemberMessage("Falha ao solicitar entrada. Tente novamente.");
      setRequestJoinInProgress(false);
    } finally {
      setRequestJoinLoading(false);
    }
  };

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");
    setNotMemberMessage("");
    setRequestJoinInProgress(false);
    setPendingModalOpen(false);
    setNotMemberModalOpen(false);
    setIsSubmitting(true);

    try {
      if (isVitrineSlug) {
        setErro(VITRINE_AUTH_BLOCKED_MESSAGE);
        return;
      }

      if (!publicSlug) {
        setErro("Slug do racha não encontrado.");
        return;
      }

      const response = await fetch(`/api/public/${publicSlug}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
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

        if (code === "REQUEST_PENDING") {
          setPendingModalOpen(true);
          return;
        }

        if (code === "NOT_MEMBER") {
          setNotMemberModalOpen(true);
          return;
        }

        if (code === "REQUEST_REJECTED") {
          setErro("Sua solicitação foi rejeitada. Fale com o administrador do racha.");
          return;
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
          return;
        }

        setErro(message);
        return;
      }

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
        authProvider: "credentials",
      });

      if (signInResult?.error) {
        setErro("Não foi possível concluir o login.");
        return;
      }

      clearPublicAuthContext();
      router.replace(redirectTo);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVitrineSlug) {
    return (
      <section className="w-full px-4">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-amber-400/30 bg-[#0f1118] p-6 shadow-2xl">
          <div className="mb-4 rounded-lg border border-amber-400/30 bg-[#141824] px-3 py-3 text-center">
            <p className="text-sm font-semibold text-amber-200">Racha Vitrine</p>
            <p className="mt-1 text-sm text-amber-100">{VITRINE_AUTH_BLOCKED_MESSAGE}</p>
          </div>
          <h1 className="text-xl font-bold text-white text-center">Acesso desabilitado</h1>
          <p className="mt-2 text-center text-sm text-gray-300">
            Para criar seu ambiente real no Fut7Pro, use o cadastro de racha.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
        <div className="mb-4 rounded-lg border border-brand/30 bg-[#141824] px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Acesso exclusivo
          </p>
          <p className="text-sm text-gray-200">
            Atletas do <span className="font-semibold text-brand">{nomeDoRacha}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">Visitantes podem navegar pelo site.</p>
        </div>

        <h1 className="text-xl font-bold text-white text-center">Login do Atleta</h1>
        <p className="mt-2 text-center text-sm text-gray-300">
          Entre para editar seu perfil e acompanhar as novidades do racha.
        </p>

        {requestJoinIntent ? (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-left text-sm text-amber-100">
            <p className="font-semibold text-amber-200">Você ainda não joga neste racha</p>
            <p className="mt-1">
              Entre com sua senha para solicitar entrada. Assim que o admin aprovar, você entra nos
              rankings, estatísticas e comunicação do time.
            </p>
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
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand py-2.5 font-bold text-black shadow-lg transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
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
            href={publicHref("/register")}
            className="text-brand-soft underline hover:text-brand-soft"
          >
            Cadastre-se
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
                  Seu cadastro no racha{" "}
                  <span className="font-semibold text-brand">{nomeDoRacha}</span> ainda esta
                  pendente. Assim que os administradores aprovarem sua entrada, você poderá fazer
                  login normalmente.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Entre em contato com os administradores do{" "}
                  <span className="font-semibold text-gray-200">{publicSlug}</span> e solicite sua
                  aprovação.
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
                  Solicite entrada no racha
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-300">
                  Você ainda não possui solicitação para o racha{" "}
                  <span className="font-semibold text-brand">{nomeDoRacha}</span>. Para entrar,
                  envie sua solicitação de entrada e aguarde a aprovação.
                </p>
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
                    {requestJoinLoading ? "Solicitando..." : "Solicitar entrada neste racha"}
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
