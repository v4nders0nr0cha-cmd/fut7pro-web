"use client";

import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCalendarAlt, FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import { useMensalistaCompetencias } from "@/hooks/useMensalistaCompetencias";
import type { Jogador } from "@/types/jogador";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const POSICAO_LABEL: Record<string, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

const DIAS_SEMANA_LABEL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

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

type ModalDiasContexto = "create" | "edit";

type AgendaOption = {
  id: string;
  label: string;
};

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

function formatAgendaLabel(weekday: number, time: string) {
  const dia = DIAS_SEMANA_LABEL[weekday] ?? "Dia";
  const hora = (time || "").slice(0, 5);
  return `${dia} ${hora}`.trim();
}

function readBoolField(record: Record<string, unknown>, field: string) {
  const value = record[field];
  return typeof value === "boolean" ? value : null;
}

function extractMensalistaFlag(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const direct =
    readBoolField(record, "isMensalista") ??
    readBoolField(record, "mensalista") ??
    readBoolField(record, "isMember");
  if (direct !== null) return direct;

  const athlete = record.athlete;
  if (!athlete || typeof athlete !== "object") return null;
  const athleteRecord = athlete as Record<string, unknown>;
  return (
    readBoolField(athleteRecord, "isMensalista") ??
    readBoolField(athleteRecord, "mensalista") ??
    readBoolField(athleteRecord, "isMember")
  );
}

function normalizeAgendaIds(ids: unknown) {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<string>();
  ids.forEach((id) => {
    const value = String(id ?? "").trim();
    if (value) unique.add(value);
  });
  return Array.from(unique);
}

function hasSameAgendaIds(expectedIds: string[], receivedIds: string[]) {
  if (expectedIds.length !== receivedIds.length) return false;
  const expectedSet = new Set(expectedIds);
  return receivedIds.every((id) => expectedSet.has(id));
}

function ModalMensalista({
  open,
  onClose,
  jogadores,
  onSelect,
  loadingId,
  error,
}: {
  open: boolean;
  onClose: () => void;
  jogadores: Jogador[];
  onSelect: (jogador: Jogador) => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl bg-[#1c1e22] p-6 shadow-xl">
        <h2 className="text-lg font-bold text-yellow-400">Cadastrar Jogador Mensalista</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou apelido..."
          className="rounded border border-gray-700 bg-[#23272f] px-3 py-2 text-white outline-none focus:border-yellow-400"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
          {jogadoresDisponiveis.length === 0 && (
            <div className="text-center text-sm text-gray-400">
              Nenhum jogador disponível para se tornar mensalista.
            </div>
          )}
          {jogadoresDisponiveis.map((j) => (
            <div key={j.id} className="flex items-center gap-3 rounded-xl bg-[#23272f] px-2 py-2">
              <AvatarFut7Pro
                src={j.avatarUrl || j.avatar || j.foto || j.photoUrl}
                alt={`Foto do jogador ${j.nome}`}
                width={36}
                height={36}
                fallbackSrc={DEFAULT_AVATAR}
                className="rounded-full border-2 border-gray-500 object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">{j.nome}</div>
                <div className="text-xs text-cyan-200">{j.apelido || "-"}</div>
              </div>
              <button
                onClick={() => onSelect(j)}
                disabled={loadingId === j.id}
                className={`flex items-center gap-1 rounded bg-yellow-500 px-3 py-1 text-xs font-bold text-black shadow hover:bg-yellow-600 ${
                  loadingId === j.id ? "cursor-not-allowed opacity-70" : ""
                }`}
                title="Definir dias e cadastrar mensalista"
              >
                {loadingId === j.id ? (
                  "Salvando..."
                ) : (
                  <>
                    <FaPlus /> Definir dias
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
          className="mt-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function ModalDiasMensalista({
  open,
  jogadorNome,
  agendaOptions,
  diasDraft,
  contexto,
  loading,
  error,
  onToggleDia,
  onMarcarTodos,
  onLimparTodos,
  onClose,
  onSave,
}: {
  open: boolean;
  jogadorNome: string;
  agendaOptions: AgendaOption[];
  diasDraft: string[];
  contexto: ModalDiasContexto;
  loading: boolean;
  error?: string | null;
  onToggleDia: (agendaId: string) => void;
  onMarcarTodos: () => void;
  onLimparTodos: () => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  const semAgenda = agendaOptions.length === 0;
  const isCreate = contexto === "create";
  const titulo = isCreate ? "Definir dias do mensalista" : "Editar dias do mensalista";
  const descricao = isCreate
    ? "Selecione em quais dias esse atleta será mensalista."
    : "Atualize os dias em que esse atleta paga como mensalista.";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-3">
      <div className="w-full max-w-lg rounded-2xl border border-yellow-500/35 bg-[#161a22] p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-yellow-300">{titulo}</h2>
        <p className="mt-1 text-sm text-zinc-300">
          <b className="text-white">{jogadorNome}</b>
          {" • "}
          {descricao}
        </p>

        {semAgenda ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            Nenhum dia cadastrado no racha. Configure a agenda em <b>Admin &gt; Rachas</b> antes de
            continuar.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {agendaOptions.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400"
                  checked={diasDraft.includes(item.id)}
                  onChange={() => onToggleDia(item.id)}
                  disabled={loading}
                  aria-label={item.label}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {!semAgenda && agendaOptions.length === 1 && (
          <p className="mt-3 text-xs text-emerald-300">
            O racha possui apenas um dia oficial, ele já foi vinculado automaticamente.
          </p>
        )}

        {error && (
          <div className="mt-3 rounded bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onMarcarTodos}
              disabled={semAgenda || loading}
              className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Marcar todos
            </button>
            <button
              type="button"
              onClick={onLimparTodos}
              disabled={semAgenda || loading}
              className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Limpar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={semAgenda || diasDraft.length === 0 || loading}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : isCreate ? "Salvar e cadastrar" : "Salvar dias"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-[#1c1e22] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <FaTrash className="text-xl text-red-400" />
          <h2 className="text-lg font-bold text-red-300">Remover Mensalista</h2>
        </div>
        <div className="text-sm leading-relaxed text-gray-200">
          Você está removendo <b>{jogador.nome}</b> da lista de mensalistas.
          <br />
          Ele continuará cadastrado no racha, mas perderá o status de mensalista.
          <br />
          Essa ação pode ser revertida a qualquer momento.
        </div>
        {error && <div className="text-xs text-red-300">{error}</div>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-70"
          >
            {loading ? "Removendo..." : "Remover mensalista"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MensalistasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { rachaId } = useRacha();
  const resolvedRachaId = rachaId || "";
  const missingTenantScope = !resolvedRachaId;

  const hoje = useMemo(() => new Date(), []);
  const competenciaAno = hoje.getFullYear();
  const competenciaMes = hoje.getMonth() + 1;

  const {
    items: agendaItems,
    isLoading: isAgendaLoading,
    isError: isAgendaError,
  } = useRachaAgenda({ enabled: Boolean(resolvedRachaId) });

  const { jogadores, isLoading, isError, error, updateJogador, mutate } =
    useJogadores(resolvedRachaId);

  const {
    items: competencias,
    updateCompetencia,
    mutate: mutateCompetencias,
    isLoading: isCompetenciasLoading,
  } = useMensalistaCompetencias(competenciaAno, competenciaMes, Boolean(resolvedRachaId));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDiasOpen, setModalDiasOpen] = useState(false);
  const [modalDiasContexto, setModalDiasContexto] = useState<ModalDiasContexto>("create");
  const [modalDiasJogador, setModalDiasJogador] = useState<Jogador | null>(null);
  const [diasDraft, setDiasDraft] = useState<string[]>([]);

  const [removerOpen, setRemoverOpen] = useState(false);
  const [removerJogador, setRemoverJogador] = useState<Jogador | null>(null);

  const [acaoErro, setAcaoErro] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [mensalistaRequests, setMensalistaRequests] = useState<MensalistaRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const autoSingleDayBoundRef = useRef<Set<string>>(new Set());
  const competenciaSyncInFlightRef = useRef<Set<string>>(new Set());
  const salvarDiasInFlightRef = useRef(false);

  const agendaOptions = useMemo<AgendaOption[]>(() => {
    const ordered = [...agendaItems].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.time.localeCompare(b.time);
    });

    return ordered.map((item) => ({
      id: item.id,
      label: formatAgendaLabel(item.weekday, item.time),
    }));
  }, [agendaItems]);

  const agendaIds = useMemo(() => agendaOptions.map((item) => item.id), [agendaOptions]);

  const agendaLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    agendaOptions.forEach((item) => {
      map[item.id] = item.label;
    });
    return map;
  }, [agendaOptions]);

  const mensalistaAgendaMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (competencias || []).forEach((competencia) => {
      map[competencia.athleteId] = Array.isArray(competencia.agendaIds)
        ? competencia.agendaIds
        : [];
    });
    return map;
  }, [competencias]);

  const normalizeAgendaIds = useCallback(
    (ids: string[]) => {
      const available = new Set(agendaIds);
      return ids.filter((id) => available.has(id));
    },
    [agendaIds]
  );

  const getDiasMensalista = useCallback(
    (athleteId: string) => {
      const hasSaved = Object.prototype.hasOwnProperty.call(mensalistaAgendaMap, athleteId);
      if (hasSaved) {
        return normalizeAgendaIds(mensalistaAgendaMap[athleteId] ?? []);
      }
      if (agendaIds.length === 1) {
        return [...agendaIds];
      }
      return [];
    },
    [agendaIds, mensalistaAgendaMap, normalizeAgendaIds]
  );

  const getDiasCadastroInicial = useCallback(() => {
    if (agendaIds.length === 1) {
      return [...agendaIds];
    }
    return [];
  }, [agendaIds]);

  const formatDiasList = useCallback(
    (athleteId: string) => {
      if (agendaOptions.length === 0) return "Agenda do racha não configurada.";
      const ids = getDiasMensalista(athleteId);
      if (ids.length === 0) return "Nenhum dia vinculado.";
      return ids.map((id) => agendaLabelMap[id] || "Dia removido").join(", ");
    },
    [agendaLabelMap, agendaOptions.length, getDiasMensalista]
  );

  const mensalistas = useMemo(() => jogadores.filter((j) => j.mensalista), [jogadores]);

  const pendingRequests = useMemo(
    () =>
      [...mensalistaRequests]
        .filter((item) => item.status === "PENDING")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [mensalistaRequests]
  );

  const visibleRequests = useMemo(
    () => (showAllRequests ? pendingRequests : pendingRequests.slice(0, 3)),
    [pendingRequests, showAllRequests]
  );

  const showFetchError = isError && !acaoErro;
  const pageError = acaoErro || (showFetchError ? error || "Erro ao carregar jogadores." : null);

  const editarDiasAthleteId = searchParams.get("editarDias");

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
    if (agendaIds.length !== 1 || mensalistas.length === 0) return;
    const agendaId = agendaIds[0];
    const pendentes = mensalistas
      .map((m) => m.id)
      .filter((athleteId) => {
        const hasSaved = Object.prototype.hasOwnProperty.call(mensalistaAgendaMap, athleteId);
        if (hasSaved) return false;
        if (competenciaSyncInFlightRef.current.has(athleteId)) return false;
        return !autoSingleDayBoundRef.current.has(athleteId);
      });

    if (pendentes.length === 0) return;

    let cancelado = false;
    (async () => {
      const results = await Promise.all(
        pendentes.map(async (athleteId) => {
          competenciaSyncInFlightRef.current.add(athleteId);
          try {
            const saved = await updateCompetencia(athleteId, { agendaIds: [agendaId] });
            return { athleteId, ok: Boolean(saved) };
          } finally {
            competenciaSyncInFlightRef.current.delete(athleteId);
          }
        })
      );

      if (cancelado) return;

      const teveSucesso = results.some((item) => item.ok);
      results.forEach((item) => {
        if (item.ok) autoSingleDayBoundRef.current.add(item.athleteId);
      });
      if (teveSucesso) {
        await mutateCompetencias();
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [agendaIds, mensalistaAgendaMap, mensalistas, mutateCompetencias, updateCompetencia]);

  const abrirCadastroComDias = useCallback(
    (jogador: Jogador) => {
      if (loadingId) return;
      setAcaoErro(null);
      setModalDiasJogador(jogador);
      setModalDiasContexto("create");
      setDiasDraft(getDiasCadastroInicial());
      setModalDiasOpen(true);
      setModalOpen(false);
    },
    [getDiasCadastroInicial, loadingId]
  );

  const abrirEdicaoDias = useCallback(
    (jogador: Jogador) => {
      if (loadingId) return;
      setAcaoErro(null);
      setModalDiasJogador(jogador);
      setModalDiasContexto("edit");
      setDiasDraft(getDiasMensalista(jogador.id));
      setModalDiasOpen(true);
    },
    [getDiasMensalista, loadingId]
  );

  useEffect(() => {
    if (!editarDiasAthleteId || isLoading || mensalistas.length === 0) return;
    const mensalista = mensalistas.find((j) => j.id === editarDiasAthleteId);
    if (!mensalista) return;

    abrirEdicaoDias(mensalista);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("editarDias");
    const query = next.toString();
    router.replace(
      query ? `/admin/jogadores/mensalistas?${query}` : "/admin/jogadores/mensalistas",
      {
        scroll: false,
      }
    );
  }, [abrirEdicaoDias, editarDiasAthleteId, isLoading, mensalistas, router, searchParams]);

  function toggleDiaDraft(agendaId: string) {
    setDiasDraft((prev) =>
      prev.includes(agendaId) ? prev.filter((id) => id !== agendaId) : [...prev, agendaId]
    );
  }

  function marcarTodosDias() {
    setDiasDraft([...agendaIds]);
  }

  function limparDias() {
    setDiasDraft([]);
  }

  function fecharModalDias() {
    if (loadingId) return;
    setModalDiasOpen(false);
    setModalDiasJogador(null);
    setDiasDraft([]);
  }

  async function salvarDiasMensalista() {
    if (!modalDiasJogador || loadingId || salvarDiasInFlightRef.current) return;

    if (agendaOptions.length === 0) {
      setAcaoErro("Cadastre ao menos um dia na agenda do racha antes de continuar.");
      return;
    }

    const orderedIds = agendaIds.filter((id) => diasDraft.includes(id));
    if (orderedIds.length === 0) {
      setAcaoErro("Selecione ao menos um dia para o mensalista.");
      return;
    }

    setAcaoErro(null);
    const athleteId = modalDiasJogador.id;
    salvarDiasInFlightRef.current = true;
    setLoadingId(athleteId);

    try {
      const confirmarAtletaMensalista = async () => {
        const response = await fetch(`/api/jogadores/${encodeURIComponent(athleteId)}`, {
          cache: "no-store",
        });
        if (!response.ok) return false;
        const payload = await response.json().catch(() => null);
        return extractMensalistaFlag(payload) === true;
      };

      const confirmarCompetenciaAgenda = async () => {
        const response = await fetch(
          `/api/admin/financeiro/mensalistas/competencias?year=${competenciaAno}&month=${competenciaMes}`,
          { cache: "no-store" }
        );
        if (!response.ok) return false;

        const payload = await response.json().catch(() => null);
        const items =
          payload &&
          typeof payload === "object" &&
          Array.isArray((payload as { items?: unknown }).items)
            ? ((payload as { items: unknown[] }).items as Array<{
                athleteId?: string;
                agendaIds?: unknown;
              }>)
            : Array.isArray(payload)
              ? (payload as Array<{ athleteId?: string; agendaIds?: unknown }>)
              : [];
        const competencia = items.find((item) => item?.athleteId === athleteId);
        const agendaIdsPersistidos = normalizeAgendaIds(competencia?.agendaIds);
        return hasSameAgendaIds(orderedIds, agendaIdsPersistidos);
      };

      if (modalDiasContexto === "create") {
        const setMensalista = await updateJogador(athleteId, { mensalista: true });
        const mensalistaConfirmadoDireto = extractMensalistaFlag(setMensalista) === true;
        const mensalistaConfirmadoBackend =
          mensalistaConfirmadoDireto || (await confirmarAtletaMensalista());
        if (!setMensalista || !mensalistaConfirmadoBackend) {
          setAcaoErro("Não foi possível cadastrar o jogador como mensalista.");
          return;
        }
      }

      competenciaSyncInFlightRef.current.add(athleteId);
      const savedAgenda = await updateCompetencia(athleteId, { agendaIds: orderedIds });
      competenciaSyncInFlightRef.current.delete(athleteId);

      const savedAgendaIds = normalizeAgendaIds(
        savedAgenda && typeof savedAgenda === "object"
          ? (savedAgenda as { agendaIds?: unknown }).agendaIds
          : []
      );
      const agendaConfirmadaDireto = hasSameAgendaIds(orderedIds, savedAgendaIds);
      const agendaConfirmadaBackend =
        agendaConfirmadaDireto || (await confirmarCompetenciaAgenda());

      if (!savedAgenda || !agendaConfirmadaBackend) {
        setAcaoErro("Não foi possível confirmar os dias do mensalista. Tente novamente.");
        return;
      }

      if (modalDiasContexto === "create") {
        const mensalistaConfirmadoAntesDeFechar = await confirmarAtletaMensalista();
        if (!mensalistaConfirmadoAntesDeFechar) {
          setAcaoErro("Não foi possível confirmar o jogador como mensalista. Tente novamente.");
          return;
        }
      }

      if (!(await confirmarCompetenciaAgenda())) {
        setAcaoErro("Não foi possível confirmar os dias salvos do mensalista. Tente novamente.");
        return;
      }

      await mutate((current) => {
        if (!Array.isArray(current)) return current;
        return current.map((item) =>
          item.id === athleteId
            ? {
                ...item,
                mensalista: true,
                isMensalista: true,
                isMember: true,
              }
            : item
        );
      }, false);

      await mutateCompetencias((current: unknown) => {
        const upsertItem = {
          athleteId,
          year: competenciaAno,
          month: competenciaMes,
          isPaid:
            savedAgenda && typeof savedAgenda === "object"
              ? Boolean((savedAgenda as { isPaid?: unknown }).isPaid)
              : false,
          agendaIds: [...orderedIds],
        };

        if (Array.isArray(current)) {
          const next = current.filter(
            (item) =>
              !(
                item &&
                typeof item === "object" &&
                (item as { athleteId?: string }).athleteId === athleteId
              )
          );
          return [...next, upsertItem];
        }

        if (current && typeof current === "object") {
          const payload = current as { items?: unknown[]; total?: number };
          const items = Array.isArray(payload.items) ? payload.items : [];
          const nextItems = items.filter(
            (item) =>
              !(
                item &&
                typeof item === "object" &&
                (item as { athleteId?: string }).athleteId === athleteId
              )
          );
          nextItems.push(upsertItem);
          return {
            ...payload,
            items: nextItems,
            total: nextItems.length,
          };
        }

        return [upsertItem];
      }, false);

      setModalDiasOpen(false);
      setModalDiasJogador(null);
      setDiasDraft([]);

      // Revalida em segundo plano para sincronizar caches sem travar o fluxo de sucesso.
      void Promise.all([
        mutate().catch(() => undefined),
        mutateCompetencias().catch(() => undefined),
      ]);
    } catch (saveError) {
      setAcaoErro(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar os dias do mensalista. Tente novamente."
      );
    } finally {
      competenciaSyncInFlightRef.current.delete(athleteId);
      salvarDiasInFlightRef.current = false;
      setLoadingId(null);
    }
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
      setAcaoErro("Não foi possível remover mensalista.");
      setLoadingId(null);
      return;
    }

    await mutate();
    setRemoverOpen(false);
    setRemoverJogador(null);

    if (modalDiasJogador?.id === removerJogador.id) {
      fecharModalDias();
    }

    setLoadingId(null);
  }

  async function handleApproveRequest(request: MensalistaRequestItem) {
    if (requestActionId) return;

    setRequestActionId(request.id);
    setRequestsError(null);

    try {
      const response = await fetch(
        `/api/admin/mensalistas/requests/${encodeURIComponent(request.id)}/approve`,
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

      if (agendaIds.length === 1) {
        competenciaSyncInFlightRef.current.add(request.athleteId);
        const saved = await updateCompetencia(request.athleteId, { agendaIds: [...agendaIds] });
        competenciaSyncInFlightRef.current.delete(request.athleteId);
        if (saved) {
          await mutateCompetencias();
        } else {
          setRequestsError(
            "Mensalista aprovado, mas não foi possível vincular o dia automaticamente."
          );
        }
      }
    } catch (actionError) {
      setRequestsError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível aprovar a solicitação."
      );
    } finally {
      competenciaSyncInFlightRef.current.delete(request.athleteId);
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
          content="Cadastre e gerencie jogadores mensalistas do seu racha, defina dias oficiais de participação e mantenha o fluxo financeiro organizado."
        />
        <meta
          name="keywords"
          content="fut7, racha, jogadores, mensalistas, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
          Jogadores Mensalistas
        </h1>

        {missingTenantScope && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Não foi possível identificar o racha ativo. Acesse o Hub e selecione um racha para
            gerenciar mensalistas.
          </div>
        )}

        {isAgendaError && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Não foi possível carregar os dias do racha. Verifique a agenda em{" "}
            <b>Admin &gt; Rachas</b>.
          </div>
        )}

        <div className="mb-8 flex flex-col items-start gap-4 rounded-xl border-l-4 border-yellow-400 bg-[#23272f] p-4 sm:flex-row sm:items-center">
          <FaInfoCircle className="shrink-0 text-2xl text-yellow-300" />
          <div className="text-sm leading-relaxed text-gray-200">
            <b>Recomendação:</b> Mantenha <b>60% a 70% das vagas do racha para mensalistas</b>.
            <br />
            Jogadores mensalistas ajudam a manter o caixa fixo, garantindo:
            <ul className="mb-2 mt-2 list-disc pl-5 text-gray-300">
              <li>Vaga garantida em dias de racha</li>
              <li>Descontos no pagamento à vista</li>
              <li>Benefícios em lojas e parceiros</li>
            </ul>
            Mantenha algumas vagas para <b>diaristas</b> para estimular a concorrência e renovação.
            <br />
            <span className="mt-2 block">
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
                            onClick={() => handleApproveRequest(request)}
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

        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2 text-sm font-bold text-black shadow transition hover:bg-yellow-600"
          >
            <FaPlus />
            Cadastrar Jogador Mensalista
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-100">
          <b>Fluxo oficial:</b> os dias do mensalista são definidos nesta página e usados
          automaticamente no financeiro e no sorteio inteligente.
          {agendaOptions.length > 0 && (
            <>
              {" "}
              Agenda atual do racha:{" "}
              <span className="font-semibold text-cyan-200">
                {agendaOptions.map((item) => item.label).join(" • ")}
              </span>
              .
            </>
          )}
          {isAgendaLoading && " Carregando agenda..."}
        </div>

        {isCompetenciasLoading && (
          <div className="mb-4 text-xs text-zinc-400">Sincronizando dias dos mensalistas...</div>
        )}

        {pageError && <div className="mb-6 text-center text-sm text-red-300">{pageError}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="w-full py-12 text-center font-semibold text-gray-400">
              Carregando mensalistas...
            </div>
          ) : showFetchError ? (
            <div className="w-full py-12 text-center font-semibold text-gray-400">
              Não foi possível carregar os mensalistas.
            </div>
          ) : mensalistas.length === 0 ? (
            <div className="w-full py-12 text-center font-semibold text-gray-400">
              Nenhum mensalista cadastrado.
            </div>
          ) : (
            mensalistas.map((j) => {
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
              const diasText = formatDiasList(j.id);
              const isBusy = loadingId === j.id;

              return (
                <article
                  key={j.id}
                  className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-[#11151d] via-[#171b24] to-[#1e2430] p-5 shadow-lg transition hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-yellow-400/80 bg-black shadow-md">
                      <AvatarFut7Pro
                        src={avatar}
                        alt={`Foto do jogador ${j.nome}`}
                        width={80}
                        height={80}
                        fallbackSrc={DEFAULT_AVATAR}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-white">{j.nome}</h3>
                      <p className="truncate text-sm font-semibold text-cyan-200">
                        {j.apelido || "-"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded bg-cyan-700 px-2.5 py-0.5 text-xs text-white">
                          {posicao}
                        </span>
                        <span className={`rounded px-2.5 py-0.5 text-xs text-white ${statusClass}`}>
                          {status}
                        </span>
                        <span className="rounded bg-yellow-500 px-2.5 py-0.5 text-xs font-semibold text-black">
                          Mensalista
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-zinc-700/70 bg-zinc-900/45 px-3 py-2">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                      Dias vinculados
                    </p>
                    <p className="text-sm text-zinc-100">{diasText}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicaoDias(j)}
                      disabled={isBusy || agendaOptions.length === 0}
                      className="inline-flex items-center gap-1 rounded-md border border-yellow-500/45 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-200 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Editar dias do mensalista"
                    >
                      <FaCalendarAlt />
                      Editar dias
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirRemocao(j)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Remover mensalista"
                    >
                      <FaTrash />
                      Remover
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <ModalMensalista
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          jogadores={jogadores}
          onSelect={abrirCadastroComDias}
          loadingId={loadingId}
          error={acaoErro}
        />

        <ModalDiasMensalista
          open={modalDiasOpen}
          jogadorNome={modalDiasJogador?.nome || "Jogador"}
          agendaOptions={agendaOptions}
          diasDraft={diasDraft}
          contexto={modalDiasContexto}
          loading={Boolean(loadingId)}
          error={acaoErro}
          onToggleDia={toggleDiaDraft}
          onMarcarTodos={marcarTodosDias}
          onLimparTodos={limparDias}
          onClose={fecharModalDias}
          onSave={salvarDiasMensalista}
        />

        <ModalRemoverMensalista
          open={removerOpen}
          jogador={removerJogador}
          onClose={fecharRemocao}
          onConfirm={confirmarRemocao}
          loading={Boolean(loadingId)}
          error={acaoErro}
        />
      </main>
    </>
  );
}
