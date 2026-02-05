"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { FaChartBar, FaCheckCircle, FaPlus, FaPoll, FaSearch, FaTimesCircle } from "react-icons/fa";
import { useBroadcastGroupsPreview } from "@/hooks/useBroadcasts";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import { Switch } from "@/components/ui/Switch";
import type {
  PollAdminDetail,
  PollAdminItem,
  PollListResponse,
  PollResultsVisibility,
  PollStatus,
  PollTargetType,
} from "@/types/poll";

type FormState = {
  title: string;
  description: string;
  options: string[];
  targetType: PollTargetType;
  targetGroupKey: string;
  targetUserIds: string[];
  allowChangeVote: boolean;
  resultsVisibility: PollResultsVisibility;
  allowMultiple: boolean;
  maxChoices: number;
  isAnonymous: boolean;
  startNow: boolean;
  startAt: string;
  endAtEnabled: boolean;
  endAt: string;
};

const statusLabels: Record<PollStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  ACTIVE: "Ativa",
  CLOSED: "Encerrada",
  ARCHIVED: "Arquivada",
};

const targetTypeLabels: Record<PollTargetType, string> = {
  ALL: "Todos os atletas",
  GROUP: "Grupo",
  INDIVIDUAL: "Seleção individual",
};

const resultsVisibilityLabels: Record<PollResultsVisibility, string> = {
  REALTIME: "Resultados em tempo real",
  AFTER_CLOSE: "Resultados somente após encerrar",
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message = body?.error || body?.message || "Falha ao carregar";
    throw new Error(message);
  }
  return body as T;
};

const toLocalInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (val: number) => String(val).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoString = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

const createInitialForm = (): FormState => ({
  title: "",
  description: "",
  options: ["", ""],
  targetType: "ALL",
  targetGroupKey: "ALL_PLAYERS",
  targetUserIds: [],
  allowChangeVote: true,
  resultsVisibility: "REALTIME",
  allowMultiple: false,
  maxChoices: 2,
  isAnonymous: true,
  startNow: true,
  startAt: "",
  endAtEnabled: false,
  endAt: "",
});

const normalizeOptions = (options: string[]) =>
  options.map((option) => option.trim()).filter(Boolean);

export default function EnquetesClient() {
  const { rachaId } = useRacha();
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(createInitialForm());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [resultsPollId, setResultsPollId] = useState<string | null>(null);
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);

  const {
    jogadores,
    isLoading: jogadoresLoading,
    isError: jogadoresError,
  } = useJogadores(rachaId || "");

  const previewGroupKey =
    form.targetType === "GROUP"
      ? form.targetGroupKey
      : form.targetType === "ALL"
        ? "ALL_PLAYERS"
        : "";

  const {
    data: previewData,
    isLoading: previewLoading,
    mutate: refreshPreview,
  } = useBroadcastGroupsPreview(previewGroupKey || undefined);

  const groupedOptions = useMemo(() => {
    const groups = previewData?.groups ?? [];
    const map = new Map<string, { section: string; groups: typeof groups }>();
    groups.forEach((group) => {
      const existing = map.get(group.section) ?? { section: group.section, groups: [] };
      existing.groups.push(group);
      map.set(group.section, existing);
    });
    return Array.from(map.values());
  }, [previewData]);

  const selectedPreview = useMemo(() => {
    if (!previewData?.groups?.length) return null;
    return previewData.groups.find((group) => group.key === previewGroupKey) ?? null;
  }, [previewData, previewGroupKey]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    return params.toString();
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<PollListResponse<PollAdminItem>>(
    query ? `/api/admin/comunicacao/enquetes?${query}` : "/api/admin/comunicacao/enquetes",
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: resultsData, isLoading: resultsLoading } = useSWR<PollAdminDetail>(
    resultsPollId ? `/api/admin/comunicacao/enquetes/${resultsPollId}` : null,
    fetcher,
    {
      refreshInterval: (latestData) =>
        resultsPollId && latestData?.status === "ACTIVE" ? 4000 : 0,
      revalidateOnFocus: false,
    }
  );

  const polls = data?.results ?? [];

  const eligiblePlayers = useMemo(() => {
    return jogadores.filter((player) => Boolean(player.userId));
  }, [jogadores]);

  const filteredPlayers = useMemo(() => {
    const term = playerSearch.trim().toLowerCase();
    if (!term) return eligiblePlayers;
    return eligiblePlayers.filter((player) => {
      const name = player.nome?.toLowerCase() ?? "";
      const nickname = player.apelido?.toLowerCase() ?? "";
      const email = player.email?.toLowerCase() ?? "";
      return name.includes(term) || nickname.includes(term) || email.includes(term);
    });
  }, [eligiblePlayers, playerSearch]);

  const resetForm = () => {
    setForm(createInitialForm());
    setEditingId(null);
    setFormOpen(false);
    setPlayerSearch("");
  };

  const openCreate = () => {
    setFeedback(null);
    setForm(createInitialForm());
    setEditingId(null);
    setFormOpen(true);
    setPlayerSearch("");
  };

  const loadPollDetail = async (id: string) => {
    const detail = await fetcher<PollAdminDetail>(`/api/admin/comunicacao/enquetes/${id}`);
    setForm({
      title: detail.title,
      description: detail.description ?? "",
      options: detail.options?.length ? detail.options.map((opt) => opt.text) : ["", ""],
      targetType: detail.targetType,
      targetGroupKey: detail.targetGroupKey ?? "ALL_PLAYERS",
      targetUserIds: detail.targetUserIds ?? [],
      allowChangeVote: detail.allowChangeVote,
      resultsVisibility: detail.resultsVisibility,
      allowMultiple: detail.allowMultiple,
      maxChoices: detail.maxChoices ?? 2,
      isAnonymous: detail.isAnonymous,
      startNow: !detail.startAt,
      startAt: toLocalInputValue(detail.startAt),
      endAtEnabled: Boolean(detail.endAt),
      endAt: toLocalInputValue(detail.endAt),
    });
    setEditingId(id);
    setFormOpen(true);
    setPlayerSearch("");
  };

  const openEdit = async (item: PollAdminItem) => {
    if (!["DRAFT", "SCHEDULED"].includes(item.status)) {
      setFeedback({ type: "error", message: "Enquete não pode ser editada neste status." });
      return;
    }
    setFeedback(null);
    try {
      await loadPollDetail(item.id);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao carregar enquete.",
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.options];
      next[index] = value;
      return { ...prev, options: next };
    });
  };

  const addOption = () => {
    setForm((prev) => {
      if (prev.options.length >= 8) return prev;
      return { ...prev, options: [...prev.options, ""] };
    });
  };

  const removeOption = (index: number) => {
    setForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const next = prev.options.filter((_, idx) => idx !== index);
      return { ...prev, options: next };
    });
  };

  const toggleUserId = (userId: string) => {
    setForm((prev) => {
      const exists = prev.targetUserIds.includes(userId);
      const next = exists
        ? prev.targetUserIds.filter((id) => id !== userId)
        : [...prev.targetUserIds, userId];
      return { ...prev, targetUserIds: next };
    });
  };

  const validateForm = (publish: boolean) => {
    if (!form.title.trim()) return "Pergunta obrigatória.";
    const options = normalizeOptions(form.options);
    if (options.length < 2) return "Informe pelo menos duas opções.";
    if (options.length > 8) return "Limite máximo de 8 opções.";
    const deduped = new Set(options.map((option) => option.toLowerCase()));
    if (deduped.size !== options.length) return "Opções duplicadas não são permitidas.";

    if (form.targetType === "GROUP" && !form.targetGroupKey) {
      return "Selecione o grupo destinatário.";
    }

    if (form.targetType === "INDIVIDUAL" && form.targetUserIds.length === 0) {
      return "Selecione ao menos um atleta.";
    }

    if (form.allowMultiple && form.maxChoices < 2) {
      return "Limite de escolhas deve ser no mínimo 2.";
    }

    if (!form.startNow) {
      if (!form.startAt) return "Defina a data de início.";
      if (publish && !form.endAtEnabled) {
        return "Enquetes agendadas precisam de data final.";
      }
    }

    if (form.endAtEnabled && form.endAt) {
      const startValue = form.startNow ? null : toIsoString(form.startAt);
      const endValue = toIsoString(form.endAt);
      if (!endValue) return "Data final inválida.";
      if (startValue && endValue && new Date(startValue) >= new Date(endValue)) {
        return "Data final deve ser maior que a inicial.";
      }
    }

    return null;
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      options: normalizeOptions(form.options),
      targetType: form.targetType,
      allowChangeVote: form.allowChangeVote,
      resultsVisibility: form.resultsVisibility,
      allowMultiple: form.allowMultiple,
      maxChoices: form.allowMultiple ? form.maxChoices : undefined,
      isAnonymous: form.isAnonymous,
      startAt: form.startNow ? undefined : toIsoString(form.startAt),
      endAt: form.endAtEnabled ? toIsoString(form.endAt) : undefined,
    };

    if (form.targetType === "GROUP") {
      payload.targetGroupKey = form.targetGroupKey;
    }

    if (form.targetType === "INDIVIDUAL") {
      payload.targetUserIds = form.targetUserIds;
    }

    return payload;
  };

  const buildPublishPayload = () => {
    const payload: Record<string, string> = {};
    if (!form.startNow) {
      const startAt = toIsoString(form.startAt);
      if (startAt) payload.startAt = startAt;
    }
    if (form.endAtEnabled) {
      const endAt = toIsoString(form.endAt);
      if (endAt) payload.endAt = endAt;
    }
    return payload;
  };

  const savePoll = async (publish: boolean) => {
    const validation = validateForm(publish);
    if (validation) {
      setFeedback({ type: "error", message: validation });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const payload = buildPayload();
      let pollId = editingId;
      if (pollId) {
        const response = await fetch(`/api/admin/comunicacao/enquetes/${pollId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error || body?.message || "Falha ao atualizar enquete");
        }
      } else {
        const response = await fetch("/api/admin/comunicacao/enquetes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error || body?.message || "Falha ao criar enquete");
        }
        pollId = body?.id ?? null;
      }

      if (publish && pollId) {
        const publishPayload = buildPublishPayload();
        const response = await fetch(`/api/admin/comunicacao/enquetes/${pollId}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(publishPayload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error || body?.message || "Falha ao publicar enquete");
        }
      }

      setFeedback({
        type: "success",
        message: publish
          ? "Enquete publicada com sucesso."
          : editingId
            ? "Enquete atualizada com sucesso."
            : "Enquete criada com sucesso.",
      });
      resetForm();
      await Promise.all([mutate(), refreshPreview()]);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao salvar enquete.",
      });
    } finally {
      setSaving(false);
    }
  };

  const closePoll = async (id: string) => {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/comunicacao/enquetes/${id}/close`, {
        method: "POST",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || body?.message || "Falha ao encerrar enquete");
      }
      setConfirmCloseId(null);
      setFeedback({ type: "success", message: "Enquete encerrada." });
      await mutate();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao encerrar enquete.",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalVotes = resultsData?.options?.reduce(
    (sum, option) => sum + (option.voteCount ?? 0),
    0
  );

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
        <FaPoll /> Enquetes
      </h1>

      <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
        <div className="font-bold text-yellow-300 mb-1">Engajamento rápido</div>
        <p className="text-gray-200 text-sm">
          Crie enquetes para decidir horários, eventos e temas importantes. Resultados atualizam em
          tempo real e ficam visíveis para admin e atletas conforme a configuração.
        </p>
      </div>

      {feedback && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-900/40 text-emerald-200 border border-emerald-700"
              : "bg-red-900/40 text-red-200 border border-red-700"
          }`}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
        <div className="flex-1 flex items-center gap-3 bg-[#1b1b1e] border border-yellow-400 rounded-lg px-3 py-2">
          <FaSearch className="text-yellow-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Buscar enquetes por título ou descrição"
            className="bg-transparent flex-1 text-gray-200 outline-none text-sm"
          />
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="bg-[#1b1b1e] border border-yellow-400 text-yellow-200 rounded px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="DRAFT">Rascunho</option>
            <option value="SCHEDULED">Agendada</option>
            <option value="ACTIVE">Ativa</option>
            <option value="CLOSED">Encerrada</option>
            <option value="ARCHIVED">Arquivada</option>
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Nova Enquete
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400">Carregando enquetes...</div>
        ) : error ? (
          <div className="text-center text-red-400">Falha ao carregar enquetes.</div>
        ) : polls.length === 0 ? (
          <div className="text-center text-gray-400">Nenhuma enquete encontrada.</div>
        ) : (
          polls.map((poll) => {
            const periodLabel = poll.startAt
              ? `${formatDateTime(poll.startAt)} até ${
                  poll.endAt ? formatDateTime(poll.endAt) : "sem fim"
                }`
              : "Início imediato";
            return (
              <div
                key={poll.id}
                className="bg-[#1f1f23] border border-[#2b2b2f] rounded-xl p-4 shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-yellow-200">{poll.title}</div>
                    {poll.description && (
                      <div className="text-sm text-gray-300 mt-1">{poll.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      Público:{" "}
                      <span className="text-yellow-200">
                        {poll.targetLabel || targetTypeLabels[poll.targetType]}
                      </span>{" "}
                      • Destinatários:{" "}
                      <span className="text-yellow-200">{poll.recipientsCount ?? "--"}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Período: {periodLabel}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-400/20 text-yellow-300">
                      {statusLabels[poll.status]}
                    </span>
                    <div className="text-xs text-gray-400 mt-2">
                      Total de votos:{" "}
                      <span className="text-yellow-200">{poll.totalVotes ?? 0}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["DRAFT", "SCHEDULED"].includes(poll.status) && (
                    <button
                      type="button"
                      onClick={() => openEdit(poll)}
                      className="px-3 py-1 rounded bg-zinc-800 text-gray-200 text-sm hover:bg-zinc-700"
                    >
                      Editar
                    </button>
                  )}
                  {poll.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => setConfirmCloseId(poll.id)}
                      className="px-3 py-1 rounded bg-red-700/80 text-white text-sm hover:bg-red-600"
                    >
                      Encerrar
                    </button>
                  )}
                  {poll.status !== "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => setResultsPollId(poll.id)}
                      className="px-3 py-1 rounded bg-yellow-400 text-black text-sm hover:bg-yellow-300 flex items-center gap-2"
                    >
                      <FaChartBar /> Resultados
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-10">
          <div className="bg-[#1f1f23] border border-yellow-400 rounded-2xl shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-yellow-300">
                  {editingId ? "Editar Enquete" : "Criar Nova Enquete"}
                </h2>
                <p className="text-sm text-gray-300">
                  Defina público, opções e configurações de voto antes de publicar.
                </p>
              </div>
              <button type="button" onClick={resetForm} className="text-gray-300 hover:text-white">
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-gray-300 text-sm font-semibold">Pergunta</label>
                  <input
                    className="w-full mt-1 bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2"
                    maxLength={120}
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Ex: Qual horário preferido?"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-semibold">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="w-full mt-1 bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2 min-h-[80px]"
                    maxLength={400}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Contexto adicional da enquete."
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-semibold">Opções de resposta</label>
                  <div className="space-y-2 mt-2">
                    {form.options.map((option, index) => (
                      <div key={`${index}-${option}`} className="flex items-center gap-2">
                        <input
                          className="flex-1 bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2"
                          maxLength={60}
                          value={option}
                          onChange={(event) => updateOption(index, event.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-2 py-2 rounded bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                          disabled={form.options.length <= 2}
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 text-sm text-yellow-300 hover:text-yellow-200"
                    disabled={form.options.length >= 8}
                  >
                    + Adicionar opção
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#151515] border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-200 mb-2">Público-alvo</h3>
                  <select
                    className="w-full bg-[#111] border border-yellow-400 text-yellow-200 rounded px-3 py-2 text-sm"
                    value={form.targetType}
                    onChange={(event) => {
                      const next = event.target.value as PollTargetType;
                      setForm((prev) => ({
                        ...prev,
                        targetType: next,
                        targetUserIds: next === "INDIVIDUAL" ? prev.targetUserIds : [],
                      }));
                    }}
                  >
                    <option value="ALL">Todos os atletas</option>
                    <option value="GROUP">Grupo específico</option>
                    <option value="INDIVIDUAL">Seleção individual</option>
                  </select>

                  {form.targetType === "GROUP" && (
                    <select
                      className="mt-3 w-full bg-[#111] border border-yellow-400 text-yellow-200 rounded px-3 py-2 text-sm"
                      value={form.targetGroupKey}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, targetGroupKey: event.target.value }))
                      }
                    >
                      {groupedOptions.map((section) => (
                        <optgroup key={section.section} label={section.section}>
                          {section.groups.map((group) => (
                            <option key={group.key} value={group.key}>
                              {group.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  )}

                  {form.targetType === "INDIVIDUAL" && (
                    <div className="mt-3">
                      <input
                        className="w-full bg-[#111] border border-yellow-400 text-gray-200 rounded px-3 py-2 text-sm"
                        placeholder="Buscar atletas..."
                        value={playerSearch}
                        onChange={(event) => setPlayerSearch(event.target.value)}
                      />
                      <div className="mt-2 max-h-44 overflow-y-auto space-y-2">
                        {jogadoresLoading ? (
                          <div className="text-xs text-gray-400">Carregando atletas...</div>
                        ) : jogadoresError ? (
                          <div className="text-xs text-red-300">Falha ao carregar atletas.</div>
                        ) : filteredPlayers.length === 0 ? (
                          <div className="text-xs text-gray-400">Nenhum atleta encontrado.</div>
                        ) : (
                          filteredPlayers.map((player) => (
                            <label
                              key={player.userId || player.id}
                              className="flex items-center gap-2 text-sm text-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={form.targetUserIds.includes(player.userId || "")}
                                onChange={() => player.userId && toggleUserId(player.userId)}
                              />
                              <span>
                                {player.nome}
                                {player.apelido ? ` (${player.apelido})` : ""}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-3">
                    {previewLoading ? "Carregando contagem..." : null}
                    {form.targetType === "INDIVIDUAL" ? (
                      <div>
                        Destinatários selecionados:{" "}
                        <span className="text-yellow-200">{form.targetUserIds.length}</span>
                      </div>
                    ) : selectedPreview ? (
                      <div>
                        Destinatários elegíveis:{" "}
                        <span className="text-yellow-200">{selectedPreview.previewCount}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-[#151515] border border-zinc-700 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-yellow-200">Configurações</h3>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Resultados</span>
                    <select
                      className="bg-[#111] border border-yellow-400 text-yellow-200 rounded px-2 py-1 text-xs"
                      value={form.resultsVisibility}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          resultsVisibility: event.target.value as PollResultsVisibility,
                        }))
                      }
                    >
                      <option value="REALTIME">{resultsVisibilityLabels.REALTIME}</option>
                      <option value="AFTER_CLOSE">{resultsVisibilityLabels.AFTER_CLOSE}</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Permitir alterar voto</span>
                    <Switch
                      checked={form.allowChangeVote}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, allowChangeVote: checked }))
                      }
                      ariaLabel="Permitir alterar voto"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Voto anônimo</span>
                    <Switch
                      checked={form.isAnonymous}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isAnonymous: checked }))
                      }
                      ariaLabel="Voto anônimo"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Múltipla escolha</span>
                    <Switch
                      checked={form.allowMultiple}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, allowMultiple: checked }))
                      }
                      ariaLabel="Múltipla escolha"
                    />
                  </div>
                  {form.allowMultiple && (
                    <div className="text-sm text-gray-200">
                      <label className="block text-xs text-gray-400 mb-1">Limite de escolhas</label>
                      <input
                        type="number"
                        min={2}
                        max={8}
                        value={form.maxChoices}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            maxChoices: Number(event.target.value) || 2,
                          }))
                        }
                        className="w-full bg-[#111] border border-yellow-400 text-yellow-200 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-[#151515] border border-zinc-700 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-yellow-200">Período</h3>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Início imediato</span>
                    <Switch
                      checked={form.startNow}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          startNow: checked,
                          startAt: checked ? "" : prev.startAt,
                          endAtEnabled: checked ? prev.endAtEnabled : true,
                        }))
                      }
                      ariaLabel="Início imediato"
                    />
                  </div>
                  {!form.startNow && (
                    <input
                      type="datetime-local"
                      className="w-full bg-[#111] border border-yellow-400 text-yellow-200 rounded px-2 py-1 text-sm"
                      value={form.startAt}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, startAt: event.target.value }))
                      }
                    />
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Definir término</span>
                    <Switch
                      checked={form.endAtEnabled}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          endAtEnabled: checked,
                          endAt: checked ? prev.endAt : "",
                        }))
                      }
                      ariaLabel="Definir término"
                    />
                  </div>
                  {form.endAtEnabled && (
                    <input
                      type="datetime-local"
                      className="w-full bg-[#111] border border-yellow-400 text-yellow-200 rounded px-2 py-1 text-sm"
                      value={form.endAt}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, endAt: event.target.value }))
                      }
                    />
                  )}
                  <div className="text-xs text-gray-400">
                    Enquetes agendadas precisam de data final para encerramento automático.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded bg-zinc-800 text-gray-200 hover:bg-zinc-700"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => savePoll(false)}
                className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                disabled={saving}
              >
                {editingId ? "Salvar alterações" : "Salvar rascunho"}
              </button>
              <button
                type="button"
                onClick={() => savePoll(true)}
                className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                disabled={saving}
              >
                Publicar enquete
              </button>
            </div>
          </div>
        </div>
      )}

      {resultsPollId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4 py-10">
          <div className="bg-[#1f1f23] border border-yellow-400 rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
                <FaChartBar /> Resultados
              </h2>
              <button
                type="button"
                onClick={() => setResultsPollId(null)}
                className="text-gray-300 hover:text-white"
              >
                Fechar
              </button>
            </div>
            {resultsLoading || !resultsData ? (
              <div className="text-center text-gray-400">Carregando resultados...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-lg text-yellow-200 font-semibold">{resultsData.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Status: {statusLabels[resultsData.status]}
                  </div>
                  <div className="text-xs text-gray-400">
                    Total de votos: <span className="text-yellow-200">{totalVotes ?? 0}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {resultsData.options.map((option) => {
                    const votes = option.voteCount ?? 0;
                    const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-200">
                          <span>{option.text}</span>
                          <span>
                            {votes} votos ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {resultsData.status === "ACTIVE" && (
                  <div className="text-xs text-gray-400">
                    Atualizando automaticamente enquanto a enquete estiver ativa.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmCloseId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
          <div className="bg-[#1f1f23] border border-red-500 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-300 mb-2">Encerrar enquete</h3>
            <p className="text-sm text-gray-300">
              Tem certeza que deseja encerrar esta enquete? Os votos ficarão bloqueados.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCloseId(null)}
                className="px-3 py-2 rounded bg-zinc-700 text-gray-200 hover:bg-zinc-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => closePoll(confirmCloseId)}
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                disabled={saving}
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
