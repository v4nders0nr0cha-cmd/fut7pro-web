"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Mail,
  Search,
  Shield,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import {
  useOwnershipTransferCandidates,
  useOwnershipTransfers,
} from "@/hooks/useOwnershipTransfer";
import type {
  AdminRoleKey,
  AdminRoleSlot,
  OwnershipTransferCandidate,
  OwnershipTransferRequest,
} from "@/types/admin-roles";

const CONFIRM_TEXT = "TRANSFERIR";

const ROLE_LABELS: Record<AdminRoleKey | "ATLETA", string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-Presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ATLETA: "Atleta",
};

function resolveSlot(slots: AdminRoleSlot[], role: AdminRoleKey) {
  return slots.find((slot) => slot.role === role);
}

function formatDate(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function PendingTransferCard({
  transfer,
  onCancel,
  onRetry,
}: {
  transfer: OwnershipTransferRequest;
  onCancel: () => Promise<void>;
  onRetry: (password: string) => Promise<void>;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [retryPassword, setRetryPassword] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailFailed = transfer.emailDeliveryStatus === "FAILED";

  async function cancel() {
    setIsCancelling(true);
    setError(null);
    try {
      await onCancel();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível cancelar a solicitação.");
    } finally {
      setIsCancelling(false);
    }
  }

  async function retry() {
    setIsRetrying(true);
    setError(null);
    try {
      await onRetry(retryPassword);
      setRetryPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível reenviar o e-mail.");
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <section className="rounded-2xl border border-yellow-500/30 bg-[#1c1f26] p-5">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 shrink-0 text-yellow-400" size={20} />
        <div>
          <h2 className="text-lg font-bold text-white">
            Aguardando confirmação do novo Presidente
          </h2>
          <p className="mt-1 text-sm text-zinc-300">
            A Presidência ainda não foi alterada. Você permanece no cargo até o sucessor confirmar
            pelo link enviado ao e-mail oficial.
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 rounded-xl border border-[#2a2d34] bg-[#232323] p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Sucessor</dt>
          <dd className="mt-1 font-semibold text-white">
            {transfer.recipientName || "Conta Fut7Pro"}
          </dd>
          <dd className="text-xs text-zinc-400">{transfer.recipientEmail || "E-mail protegido"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Validade</dt>
          <dd className="mt-1 text-zinc-200">Até {formatDate(transfer.expiresAt)}</dd>
          <dd className="text-xs text-zinc-500">Solicitado em {formatDate(transfer.createdAt)}</dd>
        </div>
      </dl>

      <div
        className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm ${
          emailFailed
            ? "border-red-500/30 bg-red-500/10 text-red-200"
            : transfer.emailDeliveryStatus === "SENT"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-yellow-500/30 bg-yellow-500/10 text-yellow-100"
        }`}
      >
        {emailFailed ? <XCircle size={17} /> : <Mail size={17} />}
        <div>
          {emailFailed
            ? "O e-mail não foi entregue. Confirme sua senha e tente enviá-lo novamente."
            : transfer.emailDeliveryStatus === "SENT"
              ? `E-mail de confirmação enviado em ${formatDate(transfer.emailSentAt)}.`
              : "O envio do e-mail está sendo processado."}
        </div>
      </div>

      {emailFailed ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="flex-1 text-sm font-semibold text-zinc-100">
            Sua senha para reenviar
            <input
              type="password"
              value={retryPassword}
              onChange={(event) => setRetryPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-[#232323] px-3 py-2 text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => void retry()}
            disabled={isRetrying || retryPassword.trim().length < 6}
            className="self-end rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black disabled:opacity-50"
          >
            {isRetrying ? "Enviando..." : "Tentar enviar novamente"}
          </button>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {showCancel ? (
          <>
            <span className="text-sm text-zinc-300">Cancelar esta solicitação?</span>
            <button
              type="button"
              onClick={() => void cancel()}
              disabled={isCancelling}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {isCancelling ? "Cancelando..." : "Sim, cancelar"}
            </button>
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200"
            >
              Manter solicitação
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-200"
          >
            Cancelar solicitação
          </button>
        )}
      </div>
    </section>
  );
}

export default function TransferirPropriedadeClient() {
  const { slots, isLoading: loadingRoles } = useAdminRoles();
  const presidentSlot = resolveSlot(slots, "PRESIDENTE");
  const {
    pendingTransfer,
    isLoading: loadingTransfer,
    isError: transferError,
    error: transferErrorMessage,
    requestTransfer,
    cancelTransfer,
  } = useOwnershipTransfers();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<OwnershipTransferCandidate | null>(null);
  const [password, setPassword] = useState("");
  const [confirmAck, setConfirmAck] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    candidates,
    isLoading: loadingCandidates,
    isError: candidatesError,
    error: candidatesErrorMessage,
  } = useOwnershipTransferCandidates(debouncedQuery, !pendingTransfer);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const canSubmit = Boolean(
    selectedAthlete &&
      password.trim().length >= 6 &&
      confirmAck &&
      confirmPhrase.trim().toUpperCase() === CONFIRM_TEXT &&
      !isSubmitting
  );

  async function handleTransfer() {
    if (!selectedAthlete) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await requestTransfer({
        athleteId: selectedAthlete.id,
        password,
        email: selectedAthlete.email,
      });
      setSuccessMessage(
        "Solicitação enviada. A Presidência só será alterada quando o sucessor confirmar pelo e-mail."
      );
      setPassword("");
      setConfirmPhrase("");
      setConfirmAck(false);
      setSelectedAthlete(null);
    } catch (cause) {
      setErrorMessage(
        cause instanceof Error ? cause.message : "Erro ao solicitar a transferência."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingTransfer) {
    return <div className="py-12 text-center text-zinc-400">Consultando transferência...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-yellow-400 md:text-3xl">Transferir Propriedade</h1>
        <p className="text-zinc-300">
          Solicite a transferência da Presidência. O sucessor precisará confirmar pelo link seguro
          enviado ao e-mail oficial de sua Conta Fut7Pro.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex items-center gap-3 text-sm text-zinc-200">
          <Shield className="text-yellow-400" size={18} />
          <span>
            Presidente atual: {presidentSlot?.name || presidentSlot?.email || "Carregando"}
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          {loadingRoles
            ? "Carregando cargos..."
            : "Após a confirmação, o Presidente anterior passa a Atleta nesta pelada."}
        </div>
      </div>

      {successMessage ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {errorMessage || transferError ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage || transferErrorMessage || "Erro ao consultar a transferência."}
        </div>
      ) : null}

      {pendingTransfer ? (
        <PendingTransferCard
          transfer={pendingTransfer}
          onCancel={async () => {
            await cancelTransfer(pendingTransfer.id);
            setSuccessMessage("Solicitação cancelada. Nenhum cargo foi alterado.");
          }}
          onRetry={async (retryPassword) => {
            if (!pendingTransfer.recipientAthleteId || !pendingTransfer.recipientEmail) {
              throw new Error("Os dados do sucessor não estão disponíveis para o reenvio.");
            }
            await requestTransfer({
              athleteId: pendingTransfer.recipientAthleteId,
              password: retryPassword,
              email: pendingTransfer.recipientEmail,
            });
            setSuccessMessage("E-mail de confirmação reenviado com segurança.");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-yellow-300">
              <UserCheck size={16} />
              Selecione o novo Presidente
            </div>

            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
              />
              <input
                type="search"
                aria-label="Buscar candidato à Presidência"
                placeholder="Buscar atleta por nome, apelido ou e-mail"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg bg-[#232323] py-2 pl-9 pr-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="custom-scrollbar max-h-[360px] space-y-2 overflow-y-auto">
              {loadingCandidates ? (
                <div className="py-6 text-center text-zinc-400">Carregando candidatos...</div>
              ) : candidatesError ? (
                <div className="py-6 text-center text-red-400">
                  {candidatesErrorMessage || "Erro ao carregar candidatos."}
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-6 text-center text-zinc-400">Nenhum candidato encontrado.</div>
              ) : (
                candidates.map((candidate) => {
                  const selected = selectedAthlete?.id === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => {
                        setSelectedAthlete(candidate);
                        setErrorMessage(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                        selected
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-[#2a2d34] hover:border-yellow-500/40"
                      }`}
                    >
                      <img
                        src={candidate.avatarUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                        alt=""
                        className="h-10 w-10 rounded-full border border-[#2a2d34] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">
                          {candidate.name}
                          {candidate.nickname ? ` (${candidate.nickname})` : ""}
                        </div>
                        <div className="truncate text-xs text-zinc-400">{candidate.email}</div>
                        <div className="text-xs text-zinc-500">
                          {candidate.position || "Posição não informada"} ·{" "}
                          {ROLE_LABELS[candidate.currentRole]}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300">
              <AlertTriangle size={16} />
              Confirmação de segurança
            </div>

            <p className="text-xs text-zinc-400">
              Esta etapa apenas envia a solicitação. Nenhum cargo será alterado antes da confirmação
              explícita do sucessor.
            </p>

            <div className="rounded-xl border border-[#2a2d34] bg-[#232323] p-4 text-sm text-zinc-200">
              <div className="mb-1 font-semibold text-white">Novo Presidente selecionado</div>
              {selectedAthlete ? (
                <div className="space-y-1">
                  <div>{selectedAthlete.name}</div>
                  <div className="text-xs text-zinc-400">{selectedAthlete.email}</div>
                  <div className="text-xs text-zinc-500">
                    Cargo atual: {ROLE_LABELS[selectedAthlete.currentRole]}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500">Selecione um atleta na lista ao lado.</div>
              )}
            </div>

            <label className="text-sm font-semibold text-zinc-100">
              E-mail oficial da Conta Fut7Pro
              <input
                className="mt-1 w-full cursor-not-allowed rounded border border-zinc-600 bg-[#232323] px-3 py-2 text-zinc-300"
                type="email"
                value={selectedAthlete?.email || ""}
                readOnly
                aria-readonly="true"
                placeholder="Selecione o sucessor"
              />
            </label>

            <label className="text-sm font-semibold text-zinc-100">
              Sua senha (confirmação)
              <input
                className="mt-1 w-full rounded border border-zinc-600 bg-[#232323] px-3 py-2 text-white"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </label>

            <div className="space-y-2 text-xs text-zinc-300">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmAck}
                  onChange={(event) => setConfirmAck(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  Entendo que a transferência só será concluída após a confirmação do sucessor e
                  que, nesse momento, passarei a Atleta nesta pelada.
                </span>
              </label>
              <label className="block">
                <span>Digite </span>
                <span className="font-semibold text-yellow-300">{CONFIRM_TEXT}</span>
                <span> para liberar a solicitação:</span>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(event) => setConfirmPhrase(event.target.value)}
                  className="mt-2 w-full rounded border border-zinc-600 bg-[#232323] px-3 py-2 text-white"
                  placeholder="Digite TRANSFERIR"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void handleTransfer()}
              disabled={!canSubmit}
              className="mt-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-600 disabled:opacity-50"
            >
              {isSubmitting ? "Solicitando..." : "Solicitar transferência"}
            </button>

            {canSubmit ? (
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 size={14} />
                Tudo pronto para enviar a solicitação com segurança.
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-4 text-xs text-zinc-400">
        Se o sucessor já ocupa Vice-Presidência ou Diretoria, esse cargo será liberado apenas quando
        ele aceitar a Presidência. O Presidente anterior sempre passa a Atleta nesta pelada.
      </div>
    </div>
  );
}
