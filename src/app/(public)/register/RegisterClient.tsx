"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTema } from "@/hooks/useTema";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useMe } from "@/hooks/useMe";

const POSICOES = ["Goleiro", "Zagueiro", "Meia", "Atacante"] as const;
const DIAS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const MESES = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Marco" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

type SessionUser = {
  name?: string | null;
  email?: string | null;
  tenantSlug?: string | null;
  authProvider?: string | null;
};

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

function isYearValid(value: string) {
  if (!value) return true;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2100;
}

function toNumberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export default function RegisterClient() {
  const { nome } = useTema();
  const nomeDoRacha = nome || "Fut7Pro";
  const { publicHref, publicSlug } = usePublicLinks();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;

  const redirectTo = useMemo(
    () => resolveRedirect(searchParams.get("callbackUrl"), publicHref("/perfil")),
    [searchParams, publicHref]
  );

  const isAuthenticated = status === "authenticated";
  const isGoogleSession = sessionUser?.authProvider === "google";
  const hasTenantSlug = Boolean(sessionUser?.tenantSlug);
  const isDifferentTenant = hasTenantSlug && sessionUser?.tenantSlug !== publicSlug;
  const shouldLoadMe = isAuthenticated && isGoogleSession && hasTenantSlug && !isDifferentTenant;
  const { me, isLoading: isLoadingMe } = useMe({ enabled: shouldLoadMe });

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [posicao, setPosicao] = useState("");
  const [posicaoSecundaria, setPosicaoSecundaria] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [ocultarNascimento, setOcultarNascimento] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileComplete = Boolean(
    me?.athlete?.firstName &&
      me?.athlete?.position &&
      me?.athlete?.birthDay &&
      me?.athlete?.birthMonth
  );
  const needsCompletion =
    isAuthenticated &&
    isGoogleSession &&
    !isDifferentTenant &&
    (!hasTenantSlug || !profileComplete);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isDifferentTenant) return;

    if (!isGoogleSession) {
      router.replace(redirectTo);
      return;
    }

    if (shouldLoadMe && !isLoadingMe && profileComplete) {
      router.replace(redirectTo);
    }
  }, [
    isAuthenticated,
    isGoogleSession,
    isDifferentTenant,
    shouldLoadMe,
    isLoadingMe,
    profileComplete,
    redirectTo,
    router,
  ]);

  useEffect(() => {
    if (!needsCompletion) return;

    if (!nomeCompleto) {
      const nextNome = me?.athlete?.firstName || sessionUser?.name || "";
      if (nextNome) setNomeCompleto(nextNome);
    }
    if (!apelido && me?.athlete?.nickname) {
      setApelido(me.athlete.nickname);
    }
    if (!posicao && me?.athlete?.position) {
      setPosicao(String(me.athlete.position));
    }
    if (!posicaoSecundaria && me?.athlete?.positionSecondary) {
      setPosicaoSecundaria(String(me.athlete.positionSecondary));
    }
    if (!dia && me?.athlete?.birthDay) {
      setDia(String(me.athlete.birthDay));
    }
    if (!mes && me?.athlete?.birthMonth) {
      setMes(String(me.athlete.birthMonth));
    }
    if (!ano && me?.athlete?.birthYear) {
      setAno(String(me.athlete.birthYear));
    }
    if (me?.athlete?.birthPublic === false) {
      setOcultarNascimento(true);
    }
  }, [
    needsCompletion,
    me?.athlete,
    sessionUser?.name,
    nomeCompleto,
    apelido,
    posicao,
    posicaoSecundaria,
    dia,
    mes,
    ano,
  ]);

  const handleGoogle = async () => {
    setErro("");
    await signIn("google", { callbackUrl: publicHref("/register") });
  };

  const validateBaseFields = () => {
    const trimmedNome = nomeCompleto.trim();
    const trimmedApelido = apelido.trim();

    if (!trimmedNome) {
      return "Informe o nome.";
    }
    if (trimmedNome.split(" ").length > 1) {
      return "Use apenas o primeiro nome.";
    }
    if (trimmedNome.length > 10) {
      return "Nome com maximo de 10 letras.";
    }
    if (trimmedApelido.length > 10) {
      return "Apelido com maximo de 10 letras.";
    }
    if (!posicao) {
      return "Selecione a posicao principal.";
    }
    if (posicaoSecundaria && posicaoSecundaria === posicao) {
      return "Posicao secundaria nao pode ser igual a principal.";
    }
    if (!dia || !mes) {
      return "Informe o dia e o mes de nascimento.";
    }
    if (!isYearValid(ano)) {
      return "Ano de nascimento invalido.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (isDifferentTenant) {
      setErro("Seu acesso esta vinculado a outro racha.");
      return;
    }

    const baseError = validateBaseFields();
    if (baseError) {
      setErro(baseError);
      return;
    }

    const trimmedNome = nomeCompleto.trim();
    const trimmedApelido = apelido.trim();

    if (!needsCompletion) {
      if (!email.trim()) {
        setErro("Informe o e-mail.");
        return;
      }
      if (!senha || senha.length < 6) {
        setErro("Senha com ao menos 6 caracteres.");
        return;
      }
    }

    const basePayload = {
      name: trimmedNome,
      nickname: trimmedApelido ? trimmedApelido : undefined,
      position: posicao,
      positionSecondary: posicaoSecundaria || null,
      birthDay: Number(dia),
      birthMonth: Number(mes),
      birthYear: toNumberOrNull(ano),
      birthPublic: !ocultarNascimento,
    };

    const payload = needsCompletion
      ? basePayload
      : {
          ...basePayload,
          email: email.trim().toLowerCase(),
          password: senha,
        };

    const endpoint = needsCompletion
      ? `/api/public/${publicSlug}/auth/complete`
      : `/api/public/${publicSlug}/auth/register`;

    setIsSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const message = body?.message || body?.error || "Erro ao concluir cadastro.";
        setErro(message);
        return;
      }

      const accessToken = body?.accessToken;
      const refreshToken = body?.refreshToken;

      if (accessToken && refreshToken) {
        const signInResult = await signIn("credentials", {
          redirect: false,
          accessToken,
          refreshToken,
          authProvider: needsCompletion ? "google" : "credentials",
        });

        if (signInResult?.error) {
          setErro("Nao foi possivel finalizar o acesso. Tente novamente.");
          return;
        }
      }

      setSucesso(
        body?.requiresApproval
          ? "Cadastro enviado! Aguarde a aprovacao do admin."
          : "Cadastro concluido com sucesso."
      );
      router.replace(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao concluir cadastro.";
      setErro(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
        <div className="mb-4 rounded-lg border border-yellow-400/30 bg-[#141824] px-3 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
            Cadastro de atleta
          </p>
          <p className="text-sm text-gray-200">
            Racha <span className="font-semibold text-yellow-400">{nomeDoRacha}</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Seu acesso sera liberado apos aprovacao do admin.
          </p>
        </div>

        <h1 className="text-xl font-bold text-white text-center">Criar conta de atleta</h1>
        <p className="mt-2 text-center text-sm text-gray-300">
          Participe dos rankings, partidas e conquistas do seu racha.
        </p>

        {isDifferentTenant && sessionUser?.tenantSlug ? (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            Voce ja esta vinculado ao racha {sessionUser.tenantSlug}. Acesse o link correto para
            continuar.
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

        {sucesso ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
          >
            {sucesso}
          </div>
        ) : null}

        {needsCompletion ? (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
            Complete seu cadastro para liberar o acesso ao racha.
            {sessionUser?.email ? (
              <div className="mt-1 text-xs text-gray-400">Conta Google: {sessionUser.email}</div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleGoogle}
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
        )}

        {isAuthenticated && isGoogleSession && isLoadingMe ? (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
            Carregando seus dados...
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Nome
              <input
                type="text"
                value={nomeCompleto}
                onChange={(event) => setNomeCompleto(event.target.value)}
                required
                maxLength={10}
                autoComplete="given-name"
                placeholder="Seu primeiro nome"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Apelido (opcional)
              <input
                type="text"
                value={apelido}
                onChange={(event) => setApelido(event.target.value)}
                maxLength={10}
                autoComplete="nickname"
                placeholder="Apelido no racha"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
          </div>

          {!needsCompletion && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="email@exemplo.com"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required={!needsCompletion}
                  autoComplete="new-password"
                  placeholder="Crie uma senha"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Posicao principal
              <select
                value={posicao}
                onChange={(event) => setPosicao(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Selecione</option>
                {POSICOES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Posicao secundaria
              <select
                value={posicaoSecundaria}
                onChange={(event) => setPosicaoSecundaria(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Nenhuma</option>
                {POSICOES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Dia
              <select
                value={dia}
                onChange={(event) => setDia(event.target.value)}
                required
                autoComplete="bday-day"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Dia</option>
                {DIAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Mes
              <select
                value={mes}
                onChange={(event) => setMes(event.target.value)}
                required
                autoComplete="bday-month"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Mes</option>
                {MESES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Ano (opcional)
              <input
                type="number"
                inputMode="numeric"
                min={1900}
                max={2100}
                value={ano}
                onChange={(event) => setAno(event.target.value)}
                autoComplete="bday-year"
                placeholder="1998"
                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={ocultarNascimento}
              onChange={(event) => setOcultarNascimento(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-yellow-400 focus:ring-yellow-400"
            />
            Nao exibir meu aniversario na lista publica
          </label>

          <button
            type="submit"
            disabled={isSubmitting || isDifferentTenant}
            className="w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-black shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Enviando..."
              : needsCompletion
                ? "Concluir cadastro"
                : "Cadastrar atleta"}
          </button>
        </form>

        {!needsCompletion && (
          <div className="mt-5 text-center text-sm text-gray-300">
            Ja tem conta?{" "}
            <a
              href={publicHref("/login")}
              className="text-yellow-300 underline hover:text-yellow-200"
            >
              Entrar
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
