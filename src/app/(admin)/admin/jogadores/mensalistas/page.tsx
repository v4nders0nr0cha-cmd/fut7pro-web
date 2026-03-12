"use client";

import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaInfoCircle } from "react-icons/fa";
import { useJogadores } from "@/hooks/useJogadores";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import { useMensalistaCompetencias } from "@/hooks/useMensalistaCompetencias";
import { useRacha } from "@/context/RachaContext";
import type { Jogador } from "@/types/jogador";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import MensalistaDiasModal, { formatAgendaLabel } from "@/components/admin/MensalistaDiasModal";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const POSICAO_LABEL: Record<string, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

type MensalistaRequestItem = {
  id: string;
  athleteId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | string;
  createdAt: string;
  avatarUrl?: string | null;
  athlete: {
    id: string;
    name: string;
    nickname?: string | null;
    position?: string | null;
    avatarUrl?: string | null;
  };
};

type FiltroSituacaoDias = "todos" | "com_dias" | "sem_dias";
type FiltroQuantidadeDias = "todos" | "1_dia" | "2_ou_mais";

function formatPosicao(value?: string | null) {
  if (!value) return "-";
  const key = value.toLowerCase();
  return POSICAO_LABEL[key] || value;
}

function formatRequestDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

// MODAL DE ADIÇÃO
function ModalMensalista({
  open,
  onClose,
  jogadores,
  onAdd,
  loadingId,
  error,
}: {
  open: boolean;
  onClose: () => void;
  jogadores: Jogador[];
  onAdd: (id: string) => void;
  loadingId?: string | null;
  error?: string | null;
}) {
  const [busca, setBusca] = useState("");

  const termo = busca.toLowerCase();
  const jogadoresDisponiveis = jogadores.filter(
    (j) =>
      !j.mensalista &&
      (j.nome.toLowerCase().includes(termo) || (j.apelido || "").toLowerCase().includes(termo))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e22] rounded-2xl p-6 min-w-[320px] w-full max-w-md shadow-xl flex flex-col gap-5">
        <h2 className="text-lg text-yellow-400 font-bold">Cadastrar Jogador Mensalista</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou apelido..."
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-700 focus:border-yellow-400 outline-none"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {jogadoresDisponiveis.length === 0 && (
            <div className="text-center text-gray-400 text-sm">
              Nenhum jogador disponível para se tornar mensalista.
            </div>
          )}
          {jogadoresDisponiveis.map((j) => (
            <div key={j.id} className="flex items-center gap-3 bg-[#23272f] rounded-xl px-2 py-2">
              <AvatarFut7Pro
                src={j.avatarUrl || j.avatar || j.foto || j.photoUrl}
                alt={`Foto do jogador ${j.nome}`}
                width={36}
                height={36}
                fallbackSrc={DEFAULT_AVATAR}
                className="rounded-full border-2 border-gray-500 object-cover"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{j.nome}</div>
                <div className="text-xs text-cyan-200">{j.apelido || "-"}</div>
              </div>
              <button
                onClick={() => onAdd(j.id)}
                disabled={loadingId === j.id}
                className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-1 rounded shadow text-xs flex items-center gap-1 ${
                  loadingId === j.id ? "opacity-70 cursor-not-allowed" : ""
                }`}
                title="Adicionar como mensalista"
              >
                {loadingId === j.id ? (
                  "Adicionando..."
                ) : (
                  <>
                    <FaPlus /> Adicionar
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
        {error && <div className="text-xs text-red-300">{error}</div>}
        <button
          type="button"
          onClick={onClose}
          className="mt-1 px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 font-semibold text-sm"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// MODAL DE REMOCAO
function ModalRemoverMensalista({
  open,
  jogador,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  open: boolean;
  jogador?: Jogador | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string | null;
}) {
  if (!open || !jogador) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1c1e22] rounded-2xl p-6 min-w-[320px] w-full max-w-md shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <FaTrash className="text-red-400 text-xl" />
          <h2 className="text-lg text-red-300 font-bold">Remover Mensalista</h2>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed">
          Voce esta removendo <b>{jogador.nome}</b> da lista de mensalistas.
          <br />
          Ele continuara cadastrado no racha, mas perdera o status de mensalista.
          <br />
          Essa acao pode ser revertida a qualquer momento.
        </div>
        {error && <div className="text-xs text-red-300">{error}</div>}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 font-semibold text-sm disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 font-bold text-sm disabled:opacity-70"
          >
            {loading ? "Removendo..." : "Remover mensalista"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MensalistasPage() {
  const { rachaId } = useRacha();
  const resolvedRachaId = rachaId || "";
  const hoje = new Date();
  const competenciaAno = hoje.getFullYear();
  const competenciaMes = hoje.getMonth() + 1;
  const missingTenantScope = !resolvedRachaId;
  const { jogadores, isLoading, isError, error, updateJogador, mutate } =
    useJogadores(resolvedRachaId);
  const { items: agendaItems } = useRachaAgenda({ enabled: Boolean(resolvedRachaId) });
  const { items: competencias, updateCompetencia } = useMensalistaCompetencias(
    competenciaAno,
    competenciaMes,
    Boolean(resolvedRachaId)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [removerOpen, setRemoverOpen] = useState(false);
  const [removerJogador, setRemoverJogador] = useState<Jogador | null>(null);
  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mensalistaRequests, setMensalistaRequests] = useState<MensalistaRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [diasModalOpen, setDiasModalOpen] = useState(false);
  const [diasModalJogador, setDiasModalJogador] = useState<Jogador | null>(null);
  const [diasModalSaving, setDiasModalSaving] = useState(false);
  const [diasModalError, setDiasModalError] = useState<string | null>(null);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroSituacaoDias, setFiltroSituacaoDias] = useState<FiltroSituacaoDias>("todos");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [filtroQuantidadeDias, setFiltroQuantidadeDias] = useState<FiltroQuantidadeDias>("todos");

  const mensalistas = useMemo(() => jogadores.filter((j) => j.mensalista), [jogadores]);
  const agendaOrdenada = useMemo(
    () =>
      [...agendaItems].sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.time.localeCompare(b.time);
      }),
    [agendaItems]
  );
  const agendaOptions = useMemo(
    () =>
      agendaOrdenada.map((item) => ({
        ...item,
        label: formatAgendaLabel(item),
      })),
    [agendaOrdenada]
  );
  const agendaLabelById = useMemo(
    () => new Map(agendaOptions.map((item) => [item.id, item.label])),
    [agendaOptions]
  );
  const competenciaDiasByAthlete = useMemo(() => {
    const map = new Map<string, string[]>();
    competencias.forEach((competencia) => {
      map.set(competencia.athleteId, competencia.agendaIds || []);
    });
    return map;
  }, [competencias]);
  const pendingRequests = useMemo(
    () =>
      [...mensalistaRequests]
        .filter((item) => item.status === "PENDING")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [mensalistaRequests]
  );
  const mensalistasFiltrados = useMemo(() => {
    const termo = filtroBusca.trim().toLowerCase();
    return mensalistas.filter((jogador) => {
      if (termo) {
        const nome = (jogador.nome || "").toLowerCase();
        const apelido = (jogador.apelido || "").toLowerCase();
        if (!nome.includes(termo) && !apelido.includes(termo)) return false;
      }

      const diasVinculados = competenciaDiasByAthlete.get(jogador.id) || [];
      const quantidadeDias = diasVinculados.length;
      const hasDias = quantidadeDias > 0;

      if (filtroSituacaoDias === "com_dias" && !hasDias) return false;
      if (filtroSituacaoDias === "sem_dias" && hasDias) return false;
      if (filtroDia !== "todos" && !diasVinculados.includes(filtroDia)) return false;
      if (filtroQuantidadeDias === "1_dia" && quantidadeDias !== 1) return false;
      if (filtroQuantidadeDias === "2_ou_mais" && quantidadeDias < 2) return false;

      return true;
    });
  }, [
    competenciaDiasByAthlete,
    filtroBusca,
    filtroDia,
    filtroQuantidadeDias,
    filtroSituacaoDias,
    mensalistas,
  ]);
  const diasSelecionadosModal = useMemo(() => {
    if (!diasModalJogador) return [];
    return competenciaDiasByAthlete.get(diasModalJogador.id) || [];
  }, [competenciaDiasByAthlete, diasModalJogador]);
  const visibleRequests = useMemo(
    () => (showAllRequests ? pendingRequests : pendingRequests.slice(0, 3)),
    [pendingRequests, showAllRequests]
  );
  const showFetchError = isError && !acaoErro;
  const pageError = acaoErro || (showFetchError ? error || "Erro ao carregar jogadores." : null);

  const loadMensalistaRequests = useCallback(async () => {
    if (!resolvedRachaId) {
      setMensalistaRequests([]);
      setRequestsLoading(false);
      return;
    }

    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await fetch("/api/admin/mensalistas/requests?limit=100", {
        method: "GET",
        cache: "no-store",
      });

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text || null;
      }

      if (!response.ok) {
        const body =
          typeof payload === "object" && payload ? (payload as Record<string, unknown>) : null;
        const message =
          (typeof body?.message === "string" ? body.message : null) ||
          (typeof body?.error === "string" ? body.error : null) ||
          "Não foi possível carregar as solicitações de mensalista.";
        throw new Error(message);
      }

      const items =
        typeof payload === "object" &&
        payload &&
        Array.isArray((payload as { items?: unknown[] }).items)
          ? ((payload as { items: unknown[] }).items as MensalistaRequestItem[])
          : [];
      setMensalistaRequests(items);
    } catch (fetchError) {
      setRequestsError(
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar as solicitações de mensalista."
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [resolvedRachaId]);

  useEffect(() => {
    loadMensalistaRequests();
  }, [loadMensalistaRequests]);

  useEffect(() => {
    if (filtroDia === "todos") return;
    const existe = agendaOptions.some((item) => item.id === filtroDia);
    if (!existe) {
      setFiltroDia("todos");
    }
  }, [agendaOptions, filtroDia]);

  async function handleAddMensalista(id: string) {
    if (loadingId) return;
    setLoadingId(id);
    setAcaoErro(null);
    const result = await updateJogador(id, { mensalista: true });
    if (!result) {
      setAcaoErro("Nao foi possivel atualizar mensalista.");
    } else {
      await mutate();
      setModalOpen(false);
    }
    setLoadingId(null);
  }

  function abrirRemocao(jogador: Jogador) {
    if (loadingId) return;
    setRemoverJogador(jogador);
    setRemoverOpen(true);
    setAcaoErro(null);
  }

  function fecharRemocao() {
    if (loadingId) return;
    setRemoverOpen(false);
    setRemoverJogador(null);
  }

  async function confirmarRemocao() {
    if (!removerJogador || loadingId) return;
    setLoadingId(removerJogador.id);
    setAcaoErro(null);
    const result = await updateJogador(removerJogador.id, { mensalista: false });
    if (!result) {
      setAcaoErro("Nao foi possivel remover mensalista.");
    } else {
      await mutate();
      setRemoverOpen(false);
      setRemoverJogador(null);
    }
    setLoadingId(null);
  }

  function abrirModalDias(jogador: Jogador) {
    setDiasModalJogador(jogador);
    setDiasModalError(null);
    setDiasModalSaving(false);
    setDiasModalOpen(true);
  }

  function fecharModalDias() {
    if (diasModalSaving) return;
    setDiasModalOpen(false);
    setDiasModalJogador(null);
    setDiasModalError(null);
  }

  async function salvarDiasMensalista(diasSelecionados: string[]) {
    if (!diasModalJogador || diasModalSaving) return;
    setDiasModalSaving(true);
    setDiasModalError(null);

    const result = await updateCompetencia(diasModalJogador.id, {
      agendaIds: diasSelecionados,
    });

    if (!result) {
      setDiasModalError("Nao foi possivel salvar os dias do mensalista.");
      setDiasModalSaving(false);
      return;
    }

    setDiasModalSaving(false);
    setDiasModalOpen(false);
    setDiasModalJogador(null);
  }

  const limparFiltros = () => {
    setFiltroBusca("");
    setFiltroSituacaoDias("todos");
    setFiltroDia("todos");
    setFiltroQuantidadeDias("todos");
  };

  async function handleApproveRequest(requestId: string) {
    if (requestActionId) return;
    setRequestActionId(requestId);
    setRequestsError(null);
    try {
      const response = await fetch(
        `/api/admin/mensalistas/requests/${encodeURIComponent(requestId)}/approve`,
        {
          method: "POST",
        }
      );

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text || null;
      }

      if (!response.ok) {
        const body =
          typeof payload === "object" && payload ? (payload as Record<string, unknown>) : null;
        const message =
          (typeof body?.message === "string" ? body.message : null) ||
          (typeof body?.error === "string" ? body.error : null) ||
          "Não foi possível aprovar a solicitação.";
        throw new Error(message);
      }

      await Promise.all([mutate(), loadMensalistaRequests()]);
    } catch (actionError) {
      setRequestsError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível aprovar a solicitação."
      );
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    if (requestActionId) return;
    setRequestActionId(requestId);
    setRequestsError(null);
    try {
      const response = await fetch(
        `/api/admin/mensalistas/requests/${encodeURIComponent(requestId)}/reject`,
        {
          method: "POST",
        }
      );

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text || null;
      }

      if (!response.ok) {
        const body =
          typeof payload === "object" && payload ? (payload as Record<string, unknown>) : null;
        const message =
          (typeof body?.message === "string" ? body.message : null) ||
          (typeof body?.error === "string" ? body.error : null) ||
          "Não foi possível rejeitar a solicitação.";
        throw new Error(message);
      }

      await loadMensalistaRequests();
    } catch (actionError) {
      setRequestsError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível rejeitar a solicitação."
      );
    } finally {
      setRequestActionId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Mensalistas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Cadastre e controle os jogadores mensalistas do seu racha, garantindo caixa fixo e benefícios exclusivos aos atletas mais comprometidos."
        />
        <meta
          name="keywords"
          content="fut7, racha, jogadores, mensalistas, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl text-yellow-400 font-bold mb-6 text-center">
          Jogadores Mensalistas
        </h1>

        {missingTenantScope && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Não foi possível identificar o racha ativo. Acesse o Hub e selecione um racha para
            gerenciar mensalistas.
          </div>
        )}

        <div className="bg-[#23272f] border-l-4 border-yellow-400 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FaInfoCircle className="text-yellow-300 text-2xl shrink-0" />
          <div className="text-sm text-gray-200 leading-relaxed">
            <b>Recomendação:</b> Mantenha <b>60% a 70% das vagas do racha para mensalistas</b>.
            <br />
            Jogadores mensalistas ajudam a manter o caixa fixo, garantindo:
            <ul className="list-disc pl-5 mt-2 mb-2 text-gray-300">
              <li>Vaga garantida em dias de racha</li>
              <li>Descontos no pagamento à vista</li>
              <li>Benefícios em lojas e parceiros</li>
            </ul>
            Mantenha algumas vagas para <b>diaristas</b> para estimular a concorrência e renovação.
            <br />
            <span className="block mt-2">
              Importante: <b>Mensalistas também pagam multa em caso de falta</b>.
            </span>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-emerald-400/40 bg-[#191f29] p-4 sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-emerald-300">Solicitações de mensalista</h2>
              <p className="text-xs text-emerald-100/80">
                Atletas que pediram para virar mensalistas (de diarista para mensalista). A fila
                segue por ordem de solicitação, o pedido mais antigo aparece primeiro.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-emerald-300/45 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Pendentes: {pendingRequests.length}
            </span>
          </div>

          {requestsError && (
            <div className="mb-3 rounded-lg border border-red-500/45 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {requestsError}
            </div>
          )}

          {requestsLoading ? (
            <div className="rounded-xl border border-emerald-500/20 bg-black/20 px-4 py-5 text-center text-sm text-zinc-300">
              Carregando solicitações...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-black/20 px-4 py-5 text-center text-sm text-zinc-300">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {visibleRequests.map((request) => {
                  const avatar = request.avatarUrl || request.athlete?.avatarUrl || DEFAULT_AVATAR;
                  const nickname = request.athlete?.nickname?.trim();
                  const createdAtLabel = formatRequestDate(request.createdAt);
                  const posicao = formatPosicao(request.athlete?.position);
                  const isBusy = requestActionId === request.id;

                  return (
                    <article
                      key={request.id}
                      className="rounded-xl border border-emerald-400/25 bg-[#111827] p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <AvatarFut7Pro
                            src={avatar}
                            alt={`Foto de ${request.athlete?.name || "atleta"}`}
                            width={44}
                            height={44}
                            fallbackSrc={DEFAULT_AVATAR}
                            className="h-11 w-11 rounded-full border border-emerald-400/40 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {request.athlete?.name || "Atleta"}
                              {nickname ? ` (${nickname})` : ""}
                            </p>
                            <p className="text-xs text-zinc-300">
                              {posicao} • Pedido em {createdAtLabel}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isBusy}
                            className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isBusy ? "Processando..." : "Aprovar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isBusy}
                            className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {pendingRequests.length > 3 && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAllRequests((prev) => !prev)}
                    className="text-xs font-semibold text-emerald-200 transition hover:text-emerald-100"
                  >
                    {showAllRequests ? "Ver menos" : `Ver mais (${pendingRequests.length - 3})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="flex justify-end mb-8">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-xl shadow transition text-sm"
          >
            <FaPlus />
            Cadastrar Mensalista
          </button>
        </div>

        {pageError && <div className="text-center text-sm text-red-300 mb-6">{pageError}</div>}

        <section className="mb-6 rounded-xl border border-cyan-400/25 bg-[#141a22] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
              Filtros de mensalistas
            </h2>
            <button
              type="button"
              onClick={limparFiltros}
              className="w-fit rounded-md border border-zinc-600 bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-300">
              Busca por nome/apelido
              <input
                type="text"
                value={filtroBusca}
                onChange={(event) => setFiltroBusca(event.target.value)}
                placeholder="Ex: Joao ou Juninho"
                className="rounded-md border border-zinc-700 bg-[#0f131a] px-3 py-2 text-sm font-normal text-white outline-none transition focus:border-cyan-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-300">
              Situacao de vinculo
              <select
                value={filtroSituacaoDias}
                onChange={(event) =>
                  setFiltroSituacaoDias(event.target.value as FiltroSituacaoDias)
                }
                className="rounded-md border border-zinc-700 bg-[#0f131a] px-3 py-2 text-sm font-normal text-white outline-none transition focus:border-cyan-500"
              >
                <option value="todos">Todos</option>
                <option value="com_dias">Com dias vinculados</option>
                <option value="sem_dias">Sem dias vinculados</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-300">
              Filtro por dia
              <select
                value={filtroDia}
                onChange={(event) => setFiltroDia(event.target.value)}
                className="rounded-md border border-zinc-700 bg-[#0f131a] px-3 py-2 text-sm font-normal text-white outline-none transition focus:border-cyan-500"
              >
                <option value="todos">Todos</option>
                {agendaOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-300">
              Quantidade de dias
              <select
                value={filtroQuantidadeDias}
                onChange={(event) =>
                  setFiltroQuantidadeDias(event.target.value as FiltroQuantidadeDias)
                }
                className="rounded-md border border-zinc-700 bg-[#0f131a] px-3 py-2 text-sm font-normal text-white outline-none transition focus:border-cyan-500"
              >
                <option value="todos">Todos</option>
                <option value="1_dia">1 dia</option>
                <option value="2_ou_mais">2 ou mais dias</option>
              </select>
            </label>
          </div>

          <p className="mt-3 text-xs text-zinc-400">
            Exibindo {mensalistasFiltrados.length} de {mensalistas.length} mensalista(s).
          </p>
        </section>

        <div className="flex flex-wrap justify-center gap-7">
          {isLoading ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Carregando mensalistas...
            </div>
          ) : showFetchError ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Nao foi possivel carregar os mensalistas.
            </div>
          ) : mensalistas.length === 0 ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Nenhum mensalista cadastrado.
            </div>
          ) : mensalistasFiltrados.length === 0 ? (
            <div className="text-gray-400 font-semibold py-12 text-center w-full">
              Nenhum mensalista encontrado com os filtros aplicados.
            </div>
          ) : (
            mensalistasFiltrados.map((j) => {
              const avatar = j.avatarUrl || j.avatar || j.foto || j.photoUrl || DEFAULT_AVATAR;
              const status = String(j.status || "Ativo");
              const statusKey = status.toLowerCase();
              const statusClass =
                statusKey === "ativo"
                  ? "bg-green-600"
                  : statusKey === "inativo"
                    ? "bg-gray-500"
                    : "bg-red-700";
              const posicao = formatPosicao(j.posicao || j.position);
              const diasVinculados = competenciaDiasByAthlete.get(j.id) || [];
              const diasLabels = diasVinculados
                .map((agendaId) => agendaLabelById.get(agendaId) || null)
                .filter((label): label is string => Boolean(label));

              return (
                <div
                  key={j.id}
                  className="bg-[#191b1f] rounded-2xl border-2 border-yellow-400 p-6 flex flex-col items-center w-[320px] max-w-full shadow hover:shadow-xl transition relative"
                >
                  <button
                    className={`absolute top-3 right-3 text-red-700 hover:text-red-500 bg-gray-900 rounded-full p-2 transition ${
                      loadingId === j.id ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    onClick={() => abrirRemocao(j)}
                    title="Remover mensalista"
                    disabled={loadingId === j.id}
                  >
                    <FaTrash />
                  </button>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 mb-2 shadow-lg bg-black">
                    <AvatarFut7Pro
                      src={avatar}
                      alt={`Foto do jogador ${j.nome}`}
                      width={96}
                      height={96}
                      fallbackSrc={DEFAULT_AVATAR}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  <div className="text-lg font-bold text-white">{j.nome}</div>
                  <div className="text-sm font-semibold text-cyan-200 mb-2">{j.apelido || "-"}</div>
                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    <span className="px-3 py-0.5 rounded bg-cyan-700 text-white text-xs">
                      {posicao}
                    </span>
                    <span className={`px-3 py-0.5 rounded ${statusClass} text-white text-xs`}>
                      {status}
                    </span>
                    <span className="px-3 py-0.5 rounded bg-yellow-500 text-black font-semibold text-xs">
                      Mensalista
                    </span>
                  </div>
                  <div className="mt-4 w-full rounded-lg border border-zinc-700 bg-black/20 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 mb-1">
                      Dias vinculados
                    </p>
                    {diasLabels.length === 0 ? (
                      <p className="text-xs font-semibold text-red-300">Sem dias vinculados</p>
                    ) : (
                      <p className="text-xs text-zinc-200">{diasLabels.join(" • ")}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirModalDias(j)}
                    className="mt-3 rounded-md bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-600"
                  >
                    Editar dias do mensalista
                  </button>
                </div>
              );
            })
          )}
        </div>

        <ModalMensalista
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          jogadores={jogadores}
          onAdd={handleAddMensalista}
          loadingId={loadingId}
          error={acaoErro}
        />

        <ModalRemoverMensalista
          open={removerOpen}
          jogador={removerJogador}
          onClose={fecharRemocao}
          onConfirm={confirmarRemocao}
          loading={Boolean(loadingId)}
          error={acaoErro}
        />

        <MensalistaDiasModal
          open={diasModalOpen && Boolean(diasModalJogador)}
          athleteName={diasModalJogador?.nome}
          agendaItems={agendaOrdenada}
          selectedAgendaIds={diasSelecionadosModal}
          onClose={fecharModalDias}
          onSave={salvarDiasMensalista}
          saving={diasModalSaving}
          error={diasModalError}
          ariaLabel="Editar dias do mensalista"
        />
      </main>
    </>
  );
}
