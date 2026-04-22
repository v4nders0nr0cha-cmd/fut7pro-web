"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  DollarSign,
  Info,
  RefreshCw,
  Shield,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Fut7ConfirmDialog,
  Fut7DestructiveDialog,
  Fut7InlineFeedback,
} from "@/components/ui/feedback";
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

export default function AdministradoresClient() {
  const { slots, isLoading, isError, error, assignRole, removeRole, mutate, isSaving } =
    useAdminRoles();
  const [modalRole, setModalRole] = useState<AdminRoleKey | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<AdminRoleAthlete | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAssign, setPendingAssign] = useState<{
    role: AdminRoleKey;
    athlete: AdminRoleAthlete;
  } | null>(null);
  const [pendingRemoveRole, setPendingRemoveRole] = useState<AdminRoleKey | null>(null);

  const slotMap = useMemo(() => {
    return slots.reduce<Record<string, AdminRoleSlot>>((acc, slot) => {
      acc[slot.role] = slot;
      return acc;
    }, {});
  }, [slots]);

  const filledCount = slots.filter((slot) => slot.status !== "EMPTY").length;
  const pendingCount = slots.filter((slot) => slot.status === "PENDING").length;
  const availableCount = ROLE_ORDER.filter((role) => {
    const slot = slotMap[role] ?? { role, status: "EMPTY" };
    return slot.status === "EMPTY";
  }).length;
  const supportingRoles = ROLE_ORDER.filter((role) => role !== "PRESIDENTE");

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

  const requestAssignConfirmation = () => {
    if (!modalRole || !selectedAthlete) return;
    setPendingAssign({ role: modalRole, athlete: selectedAthlete });
  };

  const confirmAssignRole = async () => {
    if (!pendingAssign) return;
    const roleLabel = ROLE_CONFIG[pendingAssign.role].label;
    try {
      await assignRole(pendingAssign.role, pendingAssign.athlete.id);
      setFeedback(`${pendingAssign.athlete.nome} agora está definido como ${roleLabel}.`);
      setPendingAssign(null);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Erro ao salvar administrador.");
      setPendingAssign(null);
    }
  };

  const requestRemoveConfirmation = (role: AdminRoleKey) => {
    setPendingRemoveRole(role);
  };

  const confirmRemoveRole = async () => {
    if (!pendingRemoveRole) return;
    const roleLabel = ROLE_CONFIG[pendingRemoveRole].label;
    try {
      await removeRole(pendingRemoveRole);
      setFeedback(`O cargo ${roleLabel} foi liberado para uma nova indicação.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao remover administrador.");
    } finally {
      setPendingRemoveRole(null);
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

  const renderRoleCard = (role: AdminRoleKey, featured = false) => {
    const slot = slotMap[role] ?? { role, status: "EMPTY" };
    const config = ROLE_CONFIG[role];
    const isEmpty = slot.status === "EMPTY";
    const isPending = slot.status === "PENDING";
    const statusLabel =
      role === "PRESIDENTE"
        ? "Dono do racha"
        : isEmpty
          ? "Vaga disponível"
          : isPending
            ? "Convite pendente"
            : "Ativo";
    const statusClass =
      role === "PRESIDENTE"
        ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-200"
        : isEmpty
          ? "border-zinc-600 bg-zinc-800/70 text-zinc-300"
          : isPending
            ? "border-orange-500/40 bg-orange-500/15 text-orange-200"
            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";

    const identityBlock = isEmpty ? (
      <div className="rounded-xl border border-dashed border-[#363a44] bg-[#171a20] px-4 py-5 text-center">
        <div className="text-sm font-semibold text-zinc-200">Cargo ainda sem responsável</div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Indique um atleta confiável para assumir esta função quando a rotina do racha exigir.
        </p>
        {config.editable && (
          <button
            type="button"
            onClick={() => openModal(role)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            <UserPlus size={16} />
            Selecionar atleta
          </button>
        )}
      </div>
    ) : (
      <div className="flex min-w-0 items-start gap-3">
        <img
          src={slot.avatarUrl || "/images/jogadores/jogador_padrao_01.jpg"}
          alt={slot.name || "Administrador"}
          className="h-14 w-14 shrink-0 rounded-full border border-[#333] object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="break-words text-base font-semibold text-white">
            {slot.name || "Administrador"}
          </div>
          <div className="mt-0.5 break-words text-sm text-zinc-400">
            {slot.nickname || slot.email || "Sem apelido informado"}
          </div>
          <div className="mt-1 inline-flex max-w-full items-center rounded-full border border-[#343843] bg-[#171a20] px-2.5 py-1 text-xs text-zinc-300">
            <span className="truncate">{slot.position || "Posição não informada"}</span>
          </div>
        </div>
      </div>
    );

    const actionBlock =
      !isEmpty && config.editable ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openModal(role)}
            className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/10"
            disabled={isSaving}
          >
            <RefreshCw size={14} />
            Substituir
          </button>
          <button
            type="button"
            onClick={() => requestRemoveConfirmation(role)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
            disabled={isSaving}
          >
            <Trash2 size={14} />
            Remover
          </button>
          <Link
            href="/admin/administracao/permissoes"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700/40"
          >
            <Info size={14} />
            Ver permissões
          </Link>
        </div>
      ) : null;

    const inviteBlock = slot.pendingInvite ? (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCopyInvite(slot)}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/10"
        >
          Copiar convite
        </button>
        <button
          type="button"
          onClick={() => {
            if (slot.email) {
              const subject = encodeURIComponent("Reenvio de convite para administração do racha");
              const body = encodeURIComponent(
                "Olá! Reenviamos seu convite para assumir um cargo administrativo no Fut7Pro."
              );
              window.location.href = `mailto:${slot.email}?subject=${subject}&body=${body}`;
              return;
            }
            setFeedback("Este administrador ainda não possui e-mail cadastrado.");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
        >
          Reenviar convite
        </button>
      </div>
    ) : null;

    const permissionBlock = (
      <div className={featured ? "lg:border-l lg:border-[#2a2d34] lg:pl-6" : ""}>
        <div className="mb-2 text-sm font-semibold text-zinc-100">Responsabilidades do cargo</div>
        <ul className="space-y-1.5 text-sm leading-relaxed text-zinc-400">
          {config.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400/80" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {role === "PRESIDENTE" && (
          <Link
            href="/admin/administracao/transferir-propriedade"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-yellow-500/40 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/10"
          >
            Transferir Propriedade
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    );

    if (featured) {
      return (
        <article className="rounded-2xl border border-yellow-500/30 bg-[#1c1f26] p-5 shadow-[0_0_0_1px_rgba(250,204,21,0.04)] md:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-full bg-yellow-500/15 p-3">{config.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-yellow-200">{config.subtitle}</div>
                    <div className="text-xl font-semibold text-white">{config.label}</div>
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              {identityBlock}
            </div>
            {permissionBlock}
          </div>
        </article>
      );
    }

    return (
      <article className="flex h-full min-h-[430px] flex-col gap-4 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-full bg-[#2a2d34] p-2.5">{config.icon}</span>
            <div className="min-w-0">
              <div className="text-sm text-zinc-400">{config.subtitle}</div>
              <div className="break-words text-base font-semibold text-white">{config.label}</div>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {identityBlock}
        {actionBlock}
        {inviteBlock}

        <div className="mt-auto border-t border-[#2a2d34] pt-4">{permissionBlock}</div>
      </article>
    );
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
    <div className="w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Administradores do Racha</h1>
        <p className="text-zinc-300">
          Defina quem ajuda na gestão do racha e mantenha o controle da bola com segurança.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="text-sm font-semibold text-yellow-300">Resumo da administração</div>
            <p className="mt-1 text-sm text-zinc-400">
              Somente o Presidente pode alterar cargos. Convites pendentes continuam ocupando a vaga
              até serem concluídos ou removidos.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="min-w-[88px] rounded-xl border border-[#333743] bg-[#171a20] px-3 py-2">
              <div className="text-lg font-bold text-white">{filledCount}/4</div>
              <div className="text-[11px] text-zinc-500">preenchidas</div>
            </div>
            <div className="min-w-[88px] rounded-xl border border-[#333743] bg-[#171a20] px-3 py-2">
              <div className="text-lg font-bold text-orange-200">{pendingCount}</div>
              <div className="text-[11px] text-zinc-500">pendentes</div>
            </div>
            <div className="min-w-[88px] rounded-xl border border-[#333743] bg-[#171a20] px-3 py-2">
              <div className="text-lg font-bold text-zinc-100">{availableCount}</div>
              <div className="text-[11px] text-zinc-500">vagas</div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <Fut7InlineFeedback
          tone="info"
          className="mb-5"
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <div className="space-y-5">
        {renderRoleCard("PRESIDENTE", true)}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {supportingRoles.map((role) => (
            <div key={role}>{renderRoleCard(role)}</div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#2a2d34] bg-[#1c1f26] p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-yellow-300">
              <Users size={18} />
              Gestão de cargos separada da auditoria
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Use esta página para definir responsáveis e revisar permissões. O histórico completo
              de alterações, remoções, convites e outras ações administrativas fica concentrado na
              página oficial de logs.
            </p>
          </div>
          <Link
            href="/admin/administracao/logs"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-yellow-500/40 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/10"
          >
            Ver logs administrativos
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
          <div className="flex gap-2 rounded-xl border border-[#333743] bg-[#171a20] px-3 py-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={16} />
            <span>
              Antes de substituir alguém, confirme se o novo responsável já tem acesso ativo.
            </span>
          </div>
          <div className="flex gap-2 rounded-xl border border-[#333743] bg-[#171a20] px-3 py-3">
            <Clock3 className="mt-0.5 shrink-0 text-orange-300" size={16} />
            <span>Convites pendentes podem ser reenviados ou removidos para liberar a vaga.</span>
          </div>
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

            {modalError && (
              <div className="px-5 pb-2">
                <Fut7InlineFeedback
                  tone="error"
                  message={modalError}
                  onDismiss={() => setModalError(null)}
                />
              </div>
            )}

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
                onClick={requestAssignConfirmation}
                disabled={!selectedAthlete || isSaving}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 disabled:opacity-60"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Fut7ConfirmDialog
        open={Boolean(pendingAssign)}
        title={
          pendingAssign
            ? `Definir ${pendingAssign.athlete.nome} como ${ROLE_CONFIG[pendingAssign.role].label}?`
            : "Confirmar cargo administrativo"
        }
        eyebrow="Cargo administrativo"
        description={
          pendingAssign ? (
            <>
              Você está concedendo a este atleta acesso administrativo como{" "}
              <strong className="text-yellow-200">{ROLE_CONFIG[pendingAssign.role].label}</strong>.
              Confirme apenas se ele deve assumir essa responsabilidade no painel do racha.
            </>
          ) : null
        }
        confirmLabel="Definir cargo"
        cancelLabel="Voltar"
        loading={isSaving}
        impactItems={[
          "O atleta passará a acessar as áreas permitidas para este cargo.",
          "A ação será registrada no histórico administrativo do racha.",
          "Você poderá remover ou substituir esse cargo depois, se necessário.",
        ]}
        onClose={() => setPendingAssign(null)}
        onConfirm={confirmAssignRole}
      />

      <Fut7DestructiveDialog
        open={Boolean(pendingRemoveRole)}
        title={
          pendingRemoveRole
            ? `Remover ${ROLE_CONFIG[pendingRemoveRole].label}?`
            : "Remover cargo administrativo"
        }
        description={
          pendingRemoveRole ? (
            <>
              Esta ação remove o acesso administrativo vinculado ao cargo{" "}
              <strong className="text-red-100">{ROLE_CONFIG[pendingRemoveRole].label}</strong>. O
              atleta continua cadastrado no racha, mas deixa de atuar nessa função.
            </>
          ) : null
        }
        confirmLabel="Remover cargo"
        cancelLabel="Manter cargo"
        loading={isSaving}
        impactItems={[
          "O cargo ficará vago para uma nova indicação.",
          "As permissões administrativas desse cargo serão removidas.",
          "A ação será registrada para auditoria.",
        ]}
        onClose={() => setPendingRemoveRole(null)}
        onConfirm={confirmRemoveRole}
      />
    </div>
  );
}
