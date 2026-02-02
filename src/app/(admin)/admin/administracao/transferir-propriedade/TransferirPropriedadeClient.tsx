"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Search, Shield, UserCheck } from "lucide-react";
import { useAdminRoleAthletes } from "@/hooks/useAdminRoleAthletes";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import type { AdminRoleAthlete, AdminRoleKey, AdminRoleSlot } from "@/types/admin-roles";

const CONFIRM_TEXT = "TRANSFERIR";

function resolveSlot(slots: AdminRoleSlot[], role: AdminRoleKey) {
  return slots.find((slot) => slot.role === role);
}

export default function TransferirPropriedadeClient() {
  const { slots, isLoading: loadingRoles } = useAdminRoles();
  const presidentSlot = resolveSlot(slots, "PRESIDENTE");
  const viceSlot = resolveSlot(slots, "VICE_PRESIDENTE");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<AdminRoleAthlete | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmAck, setConfirmAck] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    athletes,
    isLoading: loadingAthletes,
    isError,
    error,
  } = useAdminRoleAthletes(debouncedQuery, true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (selectedAthlete?.email) {
      setEmail(selectedAthlete.email);
    }
  }, [selectedAthlete?.email]);

  const selectedHasUser = Boolean(selectedAthlete?.hasUserAccount);
  const selectedUserId = selectedAthlete?.userId || null;
  const canKeepViceSlot = !viceSlot || (selectedUserId && viceSlot.userId === selectedUserId);
  const presidentOutcome = canKeepViceSlot ? "Vice-Presidente" : "Atleta";

  const emailMatches = useMemo(() => {
    if (!selectedAthlete || !email) return false;
    const normalized = email.trim().toLowerCase();
    const athleteEmail = selectedAthlete.email?.trim().toLowerCase();
    return Boolean(athleteEmail && normalized === athleteEmail);
  }, [selectedAthlete, email]);

  const canSubmit =
    selectedAthlete &&
    selectedHasUser &&
    emailMatches &&
    password.trim().length >= 6 &&
    confirmAck &&
    confirmPhrase.trim().toUpperCase() === CONFIRM_TEXT &&
    !isSubmitting;

  async function handleTransfer() {
    if (!selectedAthlete) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/administradores/transferir-propriedade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: selectedAthlete.id,
          password,
          email,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Erro ao transferir propriedade.");
      }

      setSuccessMessage(
        "Transferência concluída com sucesso. Para sua segurança, faça login novamente."
      );
      setPassword("");
      setConfirmPhrase("");
      setConfirmAck(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao transferir propriedade.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Transferir Propriedade</h1>
        <p className="text-zinc-300">
          Você está prestes a transferir a presidência do racha. Essa ação é irreversível e altera o
          controle total do painel.
        </p>
      </div>

      <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-zinc-200">
          <Shield className="text-yellow-400" size={18} />
          <span>
            Presidente atual: {presidentSlot?.name || presidentSlot?.email || "Carregando"}
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          {loadingRoles
            ? "Carregando cargos..."
            : `O presidente atual vira ${presidentOutcome} após a transferência.`}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>{successMessage}</span>
          <a href="/logout" className="text-xs font-semibold text-emerald-200 underline">
            Sair do painel
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300 mb-4">
            <UserCheck size={16} />
            Selecione o novo presidente
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Buscar atleta por nome, apelido ou e-mail"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#232323] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar space-y-2">
            {loadingAthletes ? (
              <div className="text-center text-zinc-400 py-6">Carregando atletas...</div>
            ) : isError ? (
              <div className="text-center text-red-400 py-6">
                {error || "Erro ao carregar atletas."}
              </div>
            ) : athletes.length === 0 ? (
              <div className="text-center text-zinc-400 py-6">Nenhum atleta encontrado.</div>
            ) : (
              athletes.map((athlete) => {
                const disabled = !athlete.hasUserAccount || athlete.adminRole === "PRESIDENTE";
                const selected = selectedAthlete?.id === athlete.id;
                return (
                  <button
                    key={athlete.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSelectedAthlete(athlete);
                      setErrorMessage(null);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      selected
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-[#2a2d34] hover:border-yellow-500/40"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <img
                      src={athlete.avatarUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                      alt={athlete.nome}
                      className="w-10 h-10 rounded-full border border-[#2a2d34] object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {athlete.nome}
                        {athlete.apelido ? ` (${athlete.apelido})` : ""}
                      </div>
                      <div className="text-xs text-zinc-400">{athlete.email || "Sem e-mail"}</div>
                      <div className="text-xs text-zinc-500">
                        {athlete.posicao || "Posição não informada"} · {athlete.status || "Status"}
                      </div>
                    </div>
                    {!athlete.hasUserAccount && (
                      <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/20 px-2 py-1 rounded">
                        Sem conta
                      </span>
                    )}
                    {athlete.adminRole === "PRESIDENTE" && (
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                        Já é presidente
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300">
            <AlertTriangle size={16} />
            Confirmação de segurança
          </div>

          <div className="text-xs text-zinc-400">
            O novo presidente deve possuir conta ativa no Fut7Pro. Caso o atleta não tenha acesso,
            realize o cadastro antes de concluir a transferência.
          </div>

          <div className="bg-[#232323] border border-[#2a2d34] rounded-xl p-4 text-sm text-zinc-200">
            <div className="font-semibold text-white mb-1">Novo presidente selecionado</div>
            {selectedAthlete ? (
              <div className="space-y-1">
                <div>{selectedAthlete.nome}</div>
                <div className="text-xs text-zinc-400">{selectedAthlete.email || "Sem e-mail"}</div>
                <div className="text-xs text-zinc-500">
                  {selectedAthlete.hasUserAccount ? "Conta ativa" : "Sem conta ativa"}
                </div>
              </div>
            ) : (
              <div className="text-zinc-500">Selecione um atleta na lista ao lado.</div>
            )}
          </div>

          <label className="text-sm font-semibold text-zinc-100">
            E-mail do novo presidente
            <input
              className="mt-1 w-full rounded px-3 py-2 bg-[#232323] text-white border border-zinc-600"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail do novo presidente"
            />
            {!emailMatches && email && (
              <span className="text-[11px] text-red-300">
                O e-mail precisa corresponder ao atleta selecionado.
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-zinc-100">
            Sua senha (confirmação)
            <input
              className="mt-1 w-full rounded px-3 py-2 bg-[#232323] text-white border border-zinc-600"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </label>

          <div className="space-y-2 text-xs text-zinc-300">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={confirmAck}
                onChange={(e) => setConfirmAck(e.target.checked)}
                className="mt-1"
              />
              <span>
                Entendo que esta ação é irreversível e transfere todo o controle do painel.
              </span>
            </label>
            <div>
              <span>Digite </span>
              <span className="text-yellow-300 font-semibold">{CONFIRM_TEXT}</span>
              <span> para liberar a transferência:</span>
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="mt-2 w-full rounded px-3 py-2 bg-[#232323] text-white border border-zinc-600"
                placeholder="Digite TRANSFERIR"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleTransfer}
            disabled={!canSubmit}
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl px-6 py-3 disabled:opacity-50"
          >
            {isSubmitting ? "Transferindo..." : "Confirmar transferência"}
          </button>

          {canSubmit && (
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 size={14} />
              Tudo pronto para transferir com segurança.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 text-xs text-zinc-400">
        Caso o novo presidente seja o atual vice, a vaga de vice será liberada para o presidente
        atual. Se já houver outro vice, o presidente atual vira atleta automaticamente.
      </div>
    </div>
  );
}
