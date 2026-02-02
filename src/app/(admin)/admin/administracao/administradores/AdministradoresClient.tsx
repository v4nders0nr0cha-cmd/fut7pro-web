"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Shield, Trophy, DollarSign, UserPlus, RefreshCw, Trash2, Info } from "lucide-react";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useAdminRoleAthletes } from "@/hooks/useAdminRoleAthletes";
import type { AdminRoleAthlete, AdminRoleKey, AdminRoleSlot } from "@/types/admin-roles";

const ROLE_ORDER: AdminRoleKey[] = [
  "PRESIDENTE",
  "VICE_PRESIDENTE",
  "DIRETOR_FUTEBOL",
  "DIRETOR_FINANCEIRO",
];

const ROLE_CONFIG: Record<
  AdminRoleKey,
  {
    label: string;
    subtitle: string;
    icon: JSX.Element;
    editable: boolean;
    bullets: string[];
  }
> = {
  PRESIDENTE: {
    label: "Presidente",
    subtitle: "Dono do racha",
    icon: <Crown className="text-yellow-400" size={18} />,
    editable: false,
    bullets: [
      "Gestão total do racha e do painel",
      "Controle de administradores e permissões",
      "Acesso completo às configurações críticas",
    ],
  },
  VICE_PRESIDENTE: {
    label: "Vice-Presidente",
    subtitle: "Gestão geral",
    icon: <Shield className="text-blue-400" size={18} />,
    editable: true,
    bullets: [
      "Gestão geral do painel e comunicação",
      "Acesso às áreas esportivas e engajamento",
      "Acompanha financeiro sem mexer em planos",
      "Não pode Administradores, Permissões e Transferir Propriedade",
      "Não pode Integrações, Backup e Cancelar conta",
    ],
  },
  DIRETOR_FUTEBOL: {
    label: "Diretor de Futebol",
    subtitle: "Rotinas esportivas",
    icon: <Trophy className="text-emerald-400" size={18} />,
    editable: true,
    bullets: [
      "Partidas, resultados e Times do Dia",
      "Jogadores e desempenho esportivo",
      "Conquistas ligadas a desempenho",
      "Rankings e estatísticas do racha",
      "Não pode Financeiro, Patrocinadores e Configurações críticas",
    ],
  },
  DIRETOR_FINANCEIRO: {
    label: "Diretor Financeiro",
    subtitle: "Finanças do racha",
    icon: <DollarSign className="text-green-400" size={18} />,
    editable: true,
    bullets: [
      "Financeiro completo e prestação de contas",
      "Mensalidades, caixa e lançamentos",
      "Patrocinadores e relatórios financeiros",
      "Leitura de partidas e sorteios (sem editar)",
      "Não pode Administradores e Configurações críticas",
    ],
  },
};

const MOCK_AUDIT = [
  "Presidente definiu Gabriel como Diretor Financeiro, 02/02 02:28",
  "Presidente removeu Lucas do cargo Vice-Presidente, 01/02 19:12",
  "Presidente definiu Ana como Diretora de Futebol, 31/01 21:44",
  "Tentativa negada de acesso às Configurações, 30/01 10:03",
  "Presidente substituiu Diretor Financeiro, 29/01 18:56",
];

export default function AdministradoresClient() {
  const { slots, isLoading, isError, error, assignRole, removeRole, mutate, isSaving } =
    useAdminRoles();
  const [modalRole, setModalRole] = useState<AdminRoleKey | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<AdminRoleAthlete | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const slotMap = useMemo(() => {
    return slots.reduce<Record<string, AdminRoleSlot>>((acc, slot) => {
      acc[slot.role] = slot;
      return acc;
    }, {});
  }, [slots]);

  const filledCount = slots.filter((slot) => slot.status !== "EMPTY").length;

  const {
    athletes,
    isLoading: loadingAthletes,
    isError: athletesError,
  } = useAdminRoleAthletes(debouncedSearch, Boolean(modalRole));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openModal = (role: AdminRoleKey) => {
    setModalRole(role);
    setSearch("");
    setDebouncedSearch("");
    setSelectedAthlete(null);
    setModalError(null);
  };

  const closeModal = () => {
    setModalRole(null);
    setSearch("");
    setSelectedAthlete(null);
    setModalError(null);
  };

  const handleConfirm = async () => {
    if (!modalRole || !selectedAthlete) return;
    const roleLabel = ROLE_CONFIG[modalRole].label;
    const confirmed = window.confirm(
      `Você está definindo ${selectedAthlete.nome} como ${roleLabel}. Deseja continuar?`
    );
    if (!confirmed) return;
    try {
      await assignRole(modalRole, selectedAthlete.id);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Erro ao salvar administrador.");
    }
  };

  const handleRemove = async (role: AdminRoleKey) => {
    const roleLabel = ROLE_CONFIG[role].label;
    const confirmed = window.confirm(`Remover o administrador do cargo ${roleLabel}?`);
    if (!confirmed) return;
    try {
      await removeRole(role);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao remover administrador.");
    }
  };

  const handleCopyInvite = (slot: AdminRoleSlot) => {
    const roleLabel = ROLE_CONFIG[slot.role].label;
    const text = `Convite para assumir o cargo ${roleLabel} no Fut7Pro. Acesse https://app.fut7pro.com.br/admin/login para concluir o cadastro.`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setFeedback("Convite copiado para a área de transferência.");
      })
      .catch(() => {
        setFeedback("Não foi possível copiar o convite.");
      });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto pb-10">
        <div className="flex flex-col gap-4 mb-6">
          <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-96 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="bg-[#1c1f26] rounded-2xl p-5 border border-[#2a2d34]">
              <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse mb-4" />
              <div className="h-24 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-10">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-200">
          <h1 className="text-xl font-bold mb-2">Erro ao carregar administradores</h1>
          <p className="text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => mutate()}
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Administradores do Racha</h1>
        <p className="text-zinc-300">
          Defina quem ajuda na gestão do racha e mantenha o controle da bola com segurança.
        </p>
      </div>

      <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-zinc-200">
          <span className="font-semibold text-yellow-300">Vagas de administração:</span>{" "}
          {filledCount}/4
        </div>
        <div className="text-sm text-zinc-400">
          Somente o Presidente pode alterar administradores.
        </div>
      </div>

      {feedback && (
        <div className="mb-5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {ROLE_ORDER.map((role) => {
          const slot = slotMap[role] ?? { role, status: "EMPTY" };
          const config = ROLE_CONFIG[role];
          const isEmpty = slot.status === "EMPTY";
          const isPending = slot.status === "PENDING";
          return (
            <div
              key={role}
              className="bg-[#1c1f26] rounded-2xl p-5 border border-[#2a2d34] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#2a2d34] p-2">{config.icon}</span>
                  <div>
                    <div className="text-sm text-zinc-400">{config.subtitle}</div>
                    <div className="text-base font-semibold text-white">{config.label}</div>
                  </div>
                </div>
                {role === "PRESIDENTE" && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                    Dono do racha
                  </span>
                )}
                {config.editable && !isEmpty && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isPending
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {isPending ? "Pendente" : "Ativo"}
                  </span>
                )}
              </div>

              {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-zinc-400">
                  <div className="text-sm">Nenhum definido</div>
                  {config.editable && (
                    <button
                      type="button"
                      onClick={() => openModal(role)}
                      className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 text-black font-semibold px-3 py-2 hover:bg-yellow-300"
                    >
                      <UserPlus size={16} />
                      Selecionar atleta
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={slot.avatarUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                      alt={slot.name || "Administrador"}
                      className="w-12 h-12 rounded-full border border-[#333] object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {slot.name || "Administrador"}
                      </div>
                      <div className="text-xs text-zinc-400">{slot.nickname || slot.email}</div>
                      <div className="text-xs text-zinc-500">
                        {slot.position || "Posição não informada"}
                      </div>
                    </div>
                  </div>

                  {config.editable && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(role)}
                        className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 text-yellow-300 px-3 py-1 text-xs hover:bg-yellow-500/10"
                        disabled={isSaving}
                      >
                        <RefreshCw size={14} />
                        Substituir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(role)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 text-red-300 px-3 py-1 text-xs hover:bg-red-500/10"
                        disabled={isSaving}
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                      <a
                        href="/admin/administracao/permissoes"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 text-zinc-300 px-3 py-1 text-xs hover:bg-zinc-700/40"
                      >
                        <Info size={14} />
                        Ver permissões
                      </a>
                    </div>
                  )}

                  {slot.pendingInvite && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyInvite(slot)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 text-blue-300 px-3 py-1 text-xs hover:bg-blue-500/10"
                      >
                        Copiar convite
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedback("Envio de convite simulado.")}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 text-emerald-300 px-3 py-1 text-xs hover:bg-emerald-500/10"
                      >
                        Enviar convite
                      </button>
                    </div>
                  )}

                  <div className="border-t border-[#2a2d34] pt-3 text-xs text-zinc-400">
                    <div className="font-semibold text-zinc-200 mb-2">
                      O que esse cargo pode fazer
                    </div>
                    <ul className="space-y-1 list-disc list-inside">
                      {config.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {role === "PRESIDENTE" && (
                <a
                  href="/admin/administracao/transferir-propriedade"
                  className="text-xs text-yellow-300 underline"
                >
                  Transferir Propriedade
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-5">
        <div className="text-lg font-semibold text-yellow-300 mb-3">
          Últimas ações de administração
        </div>
        <ul className="space-y-2 text-sm text-zinc-300">
          {MOCK_AUDIT.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-yellow-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <a href="/admin/administracao/logs" className="text-xs text-yellow-300 underline">
            Ver tudo em Logs/Admin
          </a>
        </div>
      </div>

      {modalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl bg-[#1c1f26] rounded-2xl border border-[#2a2d34] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a2d34] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-yellow-300">Selecionar atleta</h2>
                <p className="text-xs text-zinc-400">
                  Defina quem assume o cargo de {ROLE_CONFIG[modalRole].label}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar atleta por nome, apelido ou e-mail"
                className="w-full rounded-lg bg-[#14161a] border border-[#2a2d34] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="px-5 pb-4 max-h-[380px] overflow-y-auto custom-scrollbar">
              {loadingAthletes ? (
                <div className="text-center text-zinc-400 py-6">Carregando atletas...</div>
              ) : athletesError ? (
                <div className="text-center text-red-400 py-6">
                  Erro ao carregar atletas. Tente novamente.
                </div>
              ) : athletes.length === 0 ? (
                <div className="text-center text-zinc-400 py-6">Nenhum atleta encontrado.</div>
              ) : (
                <div className="space-y-2">
                  {athletes.map((athlete) => {
                    const disabled = Boolean(athlete.isAdmin);
                    const selected = selectedAthlete?.id === athlete.id;
                    return (
                      <button
                        key={athlete.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedAthlete(athlete)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                          selected
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-[#2a2d34] hover:border-yellow-500/50"
                        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <img
                          src={athlete.avatarUrl || "/images/jogadores/jogador_padrao_02.jpg"}
                          alt={athlete.nome}
                          className="w-10 h-10 rounded-full border border-[#2a2d34] object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">
                            {athlete.nome}
                            {athlete.apelido ? ` (${athlete.apelido})` : ""}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {athlete.email || "Sem e-mail"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {athlete.posicao || "Posição não informada"} ·{" "}
                            {athlete.status || "Status indefinido"}
                          </div>
                        </div>
                        {athlete.isAdmin && (
                          <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/20 px-2 py-1 rounded">
                            Já é administrador
                          </span>
                        )}
                        {!athlete.hasUserAccount && (
                          <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                            Sem conta
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {modalError && <div className="px-5 pb-2 text-sm text-red-400">{modalError}</div>}

            <div className="flex items-center justify-end gap-3 border-t border-[#2a2d34] px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-sm hover:bg-zinc-700/40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedAthlete || isSaving}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 disabled:opacity-60"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
