"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import type { OwnershipTransferRequest } from "@/types/admin-roles";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";

const TOKEN_STORAGE_KEY = "fut7pro:ownership-transfer-token";

type ViewState =
  | "LOADING_TOKEN"
  | "LOGIN_REQUIRED"
  | "LOADING_REQUEST"
  | "READY"
  | "ACCEPTED"
  | "ACCEPTED_REAUTH_REQUIRED"
  | "REJECTED"
  | "ERROR";

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      body?.message || body?.error || "Não foi possível consultar a solicitação."
    );
    Object.assign(error, { status: response.status });
    throw error;
  }
  return body as OwnershipTransferRequest;
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default function OwnershipTransferConfirmationClient() {
  const { data: session, status, update } = useSession();
  const hasUsableSession = hasUsableFut7ProSession(session, status);
  const [token, setToken] = useState<string | null>(null);
  const [request, setRequest] = useState<OwnershipTransferRequest | null>(null);
  const [viewState, setViewState] = useState<ViewState>("LOADING_TOKEN");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token")?.trim();
    const storedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY)?.trim();
    const resolvedToken = fragmentToken || storedToken || null;

    if (fragmentToken) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, fragmentToken);
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }

    if (!resolvedToken || resolvedToken.length < 20 || resolvedToken.length > 256) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      setErrorMessage("Este link de transferência é inválido ou está incompleto.");
      setViewState("ERROR");
      return;
    }

    setToken(resolvedToken);
  }, []);

  useEffect(() => {
    if (!token || status === "loading") return;
    if (!hasUsableSession) {
      setViewState("LOGIN_REQUIRED");
      return;
    }

    let cancelled = false;
    setViewState("LOADING_REQUEST");
    setErrorMessage(null);

    void fetch("/api/public/transferencia-presidencia/consultar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })
      .then(readResponse)
      .then((result) => {
        if (cancelled) return;
        setRequest(result);
        setViewState("READY");
      })
      .catch((cause: Error & { status?: number }) => {
        if (cancelled) return;
        if (cause.status === 404 || cause.status === 409 || cause.status === 410) {
          window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        setErrorMessage(cause.message);
        setViewState("ERROR");
      });

    return () => {
      cancelled = true;
    };
  }, [hasUsableSession, status, token]);

  async function respond(action: "aceitar" | "recusar") {
    if (!token || isResponding) return;
    setIsResponding(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/public/transferencia-presidencia/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await readResponse(response);
      setRequest(result);
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);

      if (action === "aceitar") {
        const refreshedSession = await update({
          revalidateAdminAccess: true,
          expectedTenantId: result.tenantId,
        }).catch(() => null);
        const refreshedUser = refreshedSession?.user as
          | { authRealm?: string | null; adminAccessVerifiedTenantId?: string | null }
          | undefined;
        const adminAccessConfirmed =
          refreshedUser?.authRealm === "admin" &&
          refreshedUser.adminAccessVerifiedTenantId === result.tenantId;
        setViewState(adminAccessConfirmed ? "ACCEPTED" : "ACCEPTED_REAUTH_REQUIRED");
      } else {
        setViewState("REJECTED");
      }
    } catch (cause) {
      const error = cause as Error & { status?: number };
      if (error.status === 404 || error.status === 409 || error.status === 410) {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setErrorMessage(error.message);
    } finally {
      setIsResponding(false);
    }
  }

  return (
    <main className="min-h-[70vh] px-4 py-10 text-white">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl md:p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-yellow-400" size={26} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
              Transferência segura
            </p>
            <h1 className="text-2xl font-bold">Presidência da pelada</h1>
          </div>
        </div>

        {viewState === "LOADING_TOKEN" ||
        viewState === "LOADING_REQUEST" ||
        status === "loading" ? (
          <div className="py-12 text-center text-zinc-300">Validando sua solicitação...</div>
        ) : null}

        {viewState === "LOGIN_REQUIRED" ? (
          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
            <h2 className="font-bold text-yellow-100">Entre na sua Conta Fut7Pro</h2>
            <p className="mt-2 text-sm text-zinc-200">
              Para proteger a pelada, somente a Conta Global que recebeu o e-mail pode consultar e
              responder esta solicitação. O link ficará preservado neste navegador durante o login.
            </p>
            <Link
              href="/admin/login?callbackUrl=%2Ftransferencia-presidencia%2Fconfirmar"
              className="mt-5 inline-flex rounded-lg bg-yellow-500 px-5 py-2.5 font-bold text-black"
            >
              Entrar para continuar
            </Link>
          </div>
        ) : null}

        {viewState === "READY" && request ? (
          <div className="mt-6">
            <p className="text-sm text-zinc-300">
              Você foi indicado para assumir a Presidência. Nenhuma alteração será realizada sem sua
              decisão explícita.
            </p>
            <dl className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Pelada</dt>
                <dd className="mt-1 font-semibold">{request.tenantName || "Pelada Fut7Pro"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Presidente atual</dt>
                <dd className="mt-1 font-semibold">{request.requestedByName || "Não informado"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Sucessor</dt>
                <dd className="mt-1 font-semibold">
                  {request.recipientName || "Sua Conta Fut7Pro"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Válida até</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm">
                  <Clock3 size={15} className="text-yellow-400" />
                  {formatDate(request.expiresAt)}
                </dd>
              </div>
            </dl>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => void respond("recusar")}
                disabled={isResponding}
                className="rounded-lg border border-red-500/40 px-5 py-2.5 font-semibold text-red-200 disabled:opacity-50"
              >
                {isResponding ? "Processando..." : "Recusar Presidência"}
              </button>
              <button
                type="button"
                onClick={() => void respond("aceitar")}
                disabled={isResponding}
                className="rounded-lg bg-yellow-500 px-5 py-2.5 font-bold text-black disabled:opacity-50"
              >
                {isResponding ? "Processando..." : "Aceitar Presidência"}
              </button>
            </div>
          </div>
        ) : null}

        {viewState === "ACCEPTED" ? (
          <div className="mt-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">Presidência transferida com sucesso</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Sua Conta Fut7Pro já pode acessar o painel administrativo desta pelada.
            </p>
            <Link
              href="/admin/selecionar-racha"
              className="mt-5 inline-flex rounded-lg bg-yellow-500 px-5 py-2.5 font-bold text-black"
            >
              Acessar painel administrativo
            </Link>
          </div>
        ) : null}

        {viewState === "ACCEPTED_REAUTH_REQUIRED" ? (
          <div className="mt-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">Presidência transferida com sucesso</h2>
            <p className="mt-2 text-sm text-zinc-300">
              A transferência foi concluída. Entre novamente para ativar com segurança o acesso
              administrativo nesta sessão.
            </p>
            <Link
              href="/admin/login?callbackUrl=%2Fadmin%2Fselecionar-racha"
              className="mt-5 inline-flex rounded-lg bg-yellow-500 px-5 py-2.5 font-bold text-black"
            >
              Entrar no painel administrativo
            </Link>
          </div>
        ) : null}

        {viewState === "REJECTED" ? (
          <div className="mt-8 text-center">
            <XCircle className="mx-auto text-zinc-400" size={42} />
            <h2 className="mt-3 text-xl font-bold">Transferência recusada</h2>
            <p className="mt-2 text-sm text-zinc-300">
              A solicitação foi encerrada e nenhum cargo ou permissão foi alterado.
            </p>
          </div>
        ) : null}

        {viewState === "ERROR" ? (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <h2 className="font-bold text-red-100">Não foi possível abrir esta solicitação</h2>
            <p role="alert" className="mt-2 text-sm text-red-200">
              {errorMessage || "O link pode ter expirado, sido cancelado ou já respondido."}
            </p>
            {hasUsableSession ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/transferencia-presidencia/confirmar" })}
                className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white"
              >
                Entrar com outra conta
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
