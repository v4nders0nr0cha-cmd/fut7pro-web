"use client";

import { useMemo, useState } from "react";
import { FaArchive, FaCheckCircle, FaEdit, FaPlus, FaTimesCircle } from "react-icons/fa";
import useSWR from "swr";
import type {
  ComunicadoItem,
  ComunicadoListResponse,
  ComunicadoSeverity,
  ComunicadoStatus,
} from "@/types/comunicado";

const severityOptions: Array<{ value: ComunicadoSeverity; label: string }> = [
  { value: "INFO", label: "Info" },
  { value: "ALERTA", label: "Alerta" },
  { value: "REGRA", label: "Regra" },
  { value: "FINANCEIRO", label: "Financeiro" },
];

const statusLabels: Record<ComunicadoStatus, string> = {
  AGENDADO: "Agendado",
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
  ARQUIVADO: "Arquivado",
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
    throw new Error(body?.error || body?.message || "Falha ao carregar");
  }
  return body as T;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

const toIsoString = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const resolveStatus = (item: { archivedAt?: string | null; startAt: string; endAt: string }) => {
  if (item.archivedAt) return "ARQUIVADO" as ComunicadoStatus;
  const now = new Date();
  const start = new Date(item.startAt);
  const end = new Date(item.endAt);
  if (now < start) return "AGENDADO" as ComunicadoStatus;
  if (now > end) return "ENCERRADO" as ComunicadoStatus;
  return "ATIVO" as ComunicadoStatus;
};

export default function ComunicadosClient() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "INFO" as ComunicadoSeverity,
    startAt: "",
    endAt: "",
  });
  const [filters, setFilters] = useState({ status: "", severity: "" });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.severity) params.set("severity", filters.severity);
    return params.toString();
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<ComunicadoListResponse>(
    query ? `/api/admin/comunicacao/comunicados?${query}` : "/api/admin/comunicacao/comunicados",
    fetcher,
    { revalidateOnFocus: false }
  );

  const comunicados = data?.results ?? [];

  const resetForm = () => {
    setForm({ title: "", message: "", severity: "INFO", startAt: "", endAt: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: ComunicadoItem) => {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      title: item.title,
      message: item.message,
      severity: item.severity,
      startAt: item.startAt ? item.startAt.slice(0, 16) : "",
      endAt: item.endAt ? item.endAt.slice(0, 16) : "",
    });
  };

  const validatePeriod = () => {
    if (!form.startAt || !form.endAt) return "Periodo obrigatorio";
    const start = new Date(form.startAt);
    const end = new Date(form.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Periodo invalido";
    }
    if (start >= end) return "Inicio deve ser menor que o fim";
    return null;
  };

  const handleSubmit = async () => {
    const periodError = validatePeriod();
    if (periodError) {
      setFeedback({ type: "error", message: periodError });
      return;
    }
    if (!form.message.trim()) {
      setFeedback({ type: "error", message: "Mensagem obrigatoria" });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        title: form.title.trim() || "Comunicado",
        message: form.message.trim(),
        severity: form.severity,
        startAt: toIsoString(form.startAt),
        endAt: toIsoString(form.endAt),
      };

      const response = await fetch(
        editingId
          ? `/api/admin/comunicacao/comunicados/${editingId}`
          : "/api/admin/comunicacao/comunicados",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || body?.message || "Falha ao salvar comunicado");
      }

      setFeedback({
        type: "success",
        message: editingId ? "Comunicado atualizado." : "Comunicado publicado.",
      });
      resetForm();
      await mutate();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao salvar comunicado.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/comunicacao/comunicados/${id}/archive`, {
        method: "POST",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || body?.message || "Falha ao arquivar");
      }
      setConfirmArchiveId(null);
      setFeedback({ type: "success", message: "Comunicado arquivado." });
      await mutate();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao arquivar comunicado.",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewStatus = useMemo(() => {
    if (!form.startAt || !form.endAt) return null;
    const status = resolveStatus({
      startAt: toIsoString(form.startAt),
      endAt: toIsoString(form.endAt),
    });
    return statusLabels[status];
  }, [form.startAt, form.endAt]);

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">Comunicados</h1>
      <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
        <div className="font-bold text-yellow-300 mb-1">O que sao Comunicados?</div>
        <p className="text-gray-200">
          Comunicados sao avisos institucionais ou recorrentes com periodo definido. Durante o
          periodo ativo, o atleta ve o comunicado em um modal sempre que fizer login no racha.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300 transition shadow"
          >
            <FaPlus /> Novo Comunicado
          </button>
        )}
        <div className="flex flex-wrap gap-3">
          <select
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="bg-[#111] border border-yellow-400 text-yellow-300 font-bold rounded px-3 py-2"
            value={filters.severity}
            onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
          >
            <option value="">Todos os tipos</option>
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 bg-[#222] rounded-lg p-5 shadow flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">Titulo</label>
              <input
                type="text"
                className="bg-[#111] border border-yellow-400 rounded px-3 py-2 text-yellow-300"
                placeholder="Titulo do comunicado"
                maxLength={80}
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">Tipo</label>
              <select
                className="bg-[#111] border border-yellow-400 rounded px-3 py-2 text-yellow-300"
                value={form.severity}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    severity: event.target.value as ComunicadoSeverity,
                  }))
                }
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 font-semibold">Mensagem</label>
            <textarea
              className="bg-[#111] border border-yellow-400 rounded px-3 py-2 text-gray-200 min-h-[120px]"
              placeholder="Digite a mensagem do comunicado"
              maxLength={2000}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">Inicio</label>
              <input
                type="datetime-local"
                className="bg-[#111] border border-yellow-400 rounded px-3 py-2 text-gray-200"
                value={form.startAt}
                onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">Fim</label>
              <input
                type="datetime-local"
                className="bg-[#111] border border-yellow-400 rounded px-3 py-2 text-gray-200"
                value={form.endAt}
                onChange={(event) => setForm((prev) => ({ ...prev, endAt: event.target.value }))}
              />
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Periodo obrigatorio. Status previsto:{" "}
            <span className="text-yellow-300">{previewStatus || "--"}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300 transition"
            >
              {editingId ? "Salvar" : "Publicar"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={resetForm}
              className="bg-[#333] text-gray-300 px-4 py-2 rounded hover:bg-[#222] transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`mb-6 flex items-center gap-2 px-4 py-3 rounded font-bold shadow ${
            feedback.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {feedback.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {feedback.message}
          <button className="ml-4 text-white text-lg" onClick={() => setFeedback(null)}>
            x
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-400 text-center py-12">Carregando...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">
            Falha ao carregar comunicados.
            <div className="text-xs text-red-300 mt-2">{String(error)}</div>
          </div>
        ) : comunicados.length === 0 ? (
          <div className="text-gray-400 text-center py-12">Nenhum comunicado encontrado.</div>
        ) : (
          comunicados.map((item) => {
            const status = (item.status || resolveStatus(item)) as ComunicadoStatus;
            return (
              <div
                key={item.id}
                className="bg-[#232323] rounded-lg p-4 shadow flex flex-col gap-3 border-l-4 border-yellow-400"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-yellow-300">{item.title}</div>
                    <div className="text-gray-200 mt-1">{item.message}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Periodo: {formatDateTime(item.startAt)} ate {formatDateTime(item.endAt)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Criado por:{" "}
                      <span className="text-gray-300">
                        {item.createdBy?.name || item.createdBy?.email || "--"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                    <span className="px-2 py-1 bg-[#111] rounded">{statusLabels[status]}</span>
                    <span className="px-2 py-1 bg-[#111] rounded">{item.severity}</span>
                    <span>
                      Views: <span className="text-yellow-300">{item.viewsCount ?? 0}</span>
                    </span>
                    <span className="text-gray-400">Ultima: {formatDateTime(item.lastViewAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 font-semibold"
                    onClick={() => openEdit(item)}
                  >
                    <FaEdit /> Editar
                  </button>
                  {!item.archivedAt && (
                    <button
                      type="button"
                      className="flex items-center gap-2 text-gray-300 hover:text-red-400"
                      onClick={() => setConfirmArchiveId(item.id)}
                    >
                      <FaArchive /> Arquivar
                    </button>
                  )}
                </div>

                {confirmArchiveId === item.id && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 px-4">
                    <div className="bg-[#232323] p-6 rounded-lg shadow-xl w-full max-w-md flex flex-col gap-4">
                      <div className="text-lg font-bold text-yellow-300">Arquivar comunicado?</div>
                      <div className="text-gray-400 text-sm">
                        Ao arquivar, o comunicado deixa de aparecer no login dos atletas.
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleArchive(item.id)}
                          disabled={saving}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-bold"
                        >
                          Arquivar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmArchiveId(null)}
                          className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
