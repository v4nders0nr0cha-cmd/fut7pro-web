"use client";

import { useMemo, useState } from "react";
import { Download, Search, RefreshCw } from "lucide-react";
import { useAdminLogs } from "@/hooks/useAdminLogs";
import type { AdminLog } from "@/types/admin";

type AdminOption = {
  id: string;
  label: string;
};

const LIMIT_OPTIONS = [50, 100, 200];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function normalizeText(value?: string | null) {
  return (value || "").toString().toLowerCase();
}

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsv(logs: AdminLog[]) {
  const header = ["Data", "Ação", "Administrador", "E-mail", "Detalhes", "Recurso"];
  const rows = logs.map((log) => [
    formatDate((log.timestamp as string) || log.criadoEm || log.data),
    log.action || log.acao || "",
    log.adminName || log.adminNome || "",
    log.adminEmail || "",
    log.details || log.detalhes || "",
    log.resource || "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(String(cell ?? ""))).join(";"))
    .join("\n");
}

function downloadCsv(logs: AdminLog[]) {
  const csv = buildCsv(logs);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `logs-administracao-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function LogsAdminClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(100);

  const filters = useMemo(() => {
    const payload: {
      action?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {
      limit,
    };
    if (selectedAction) payload.action = selectedAction;
    if (selectedAdmin && selectedAdmin !== "__system__") payload.userId = selectedAdmin;
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;
    return payload;
  }, [selectedAction, selectedAdmin, startDate, endDate, limit]);

  const { logs, isLoading, isError, error, mutate } = useAdminLogs(filters);

  const uniqueActions = useMemo(() => {
    const seen = new Set<string>();
    const actions: string[] = [];
    logs.forEach((log) => {
      const action = log.action || log.acao || "";
      if (action && !seen.has(action)) {
        seen.add(action);
        actions.push(action);
      }
    });
    return actions;
  }, [logs]);

  const adminOptions = useMemo<AdminOption[]>(() => {
    const map = new Map<string, AdminOption>();
    logs.forEach((log) => {
      if (!log.adminId) return;
      if (!map.has(log.adminId)) {
        const label = log.adminName || log.adminNome || log.adminEmail || log.adminId;
        map.set(log.adminId, { id: log.adminId, label });
      }
    });
    return Array.from(map.values());
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const search = normalizeText(searchTerm);
    return logs.filter((log) => {
      const action = normalizeText(log.action || log.acao);
      const details = normalizeText(log.details || log.detalhes);
      const adminName = normalizeText(log.adminName || log.adminNome || log.adminEmail);
      const matchesSearch =
        !search ||
        action.includes(search) ||
        details.includes(search) ||
        adminName.includes(search);

      const matchesAction = !selectedAction || action === normalizeText(selectedAction);
      const matchesAdmin =
        !selectedAdmin ||
        (selectedAdmin === "__system__" ? !log.adminId : log.adminId === selectedAdmin);

      return matchesSearch && matchesAction && matchesAdmin;
    });
  }, [logs, searchTerm, selectedAction, selectedAdmin]);

  const hasLogs = filteredLogs.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Logs de Administração</h1>
        <p className="text-zinc-300">
          Auditoria completa das ações realizadas no painel. Os dados são carregados em tempo real
          do backend do racha.
        </p>
      </div>

      <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-zinc-200">
          <span className="font-semibold text-yellow-300">Total carregado:</span> {logs.length}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => mutate()}
            className="px-3 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-xs font-semibold hover:bg-zinc-700/40 inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(filteredLogs)}
            disabled={!hasLogs}
            className="px-3 py-2 rounded-lg border border-yellow-500/40 text-yellow-200 text-xs font-semibold hover:bg-yellow-500/10 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por ação, detalhes ou admin"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#232323] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">Todas as ações</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        <select
          value={selectedAdmin}
          onChange={(e) => setSelectedAdmin(e.target.value)}
          className="px-3 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">Todos os administradores</option>
          <option value="__system__">Sistema/Automação</option>
          {adminOptions.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {LIMIT_OPTIONS.map((value) => (
            <option key={value} value={value}>
              Últimos {value}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>Erro ao carregar logs. {error || ""}</span>
          <button
            type="button"
            onClick={() => mutate()}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4">
              <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : hasLogs ? (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-[#202126] rounded-2xl shadow border border-[#2a2d34]">
              <thead>
                <tr className="text-zinc-400 text-sm border-b border-[#292929]">
                  <th className="py-3 px-4 text-left font-semibold">Data</th>
                  <th className="py-3 px-4 text-left font-semibold">Ação</th>
                  <th className="py-3 px-4 text-left font-semibold">Administrador</th>
                  <th className="py-3 px-4 text-left font-semibold">Detalhes</th>
                  <th className="py-3 px-4 text-left font-semibold">Recurso</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#242429] hover:bg-[#242529] transition"
                  >
                    <td className="py-3 px-4 text-sm text-zinc-300">
                      {formatDate((log.timestamp as string) || log.criadoEm || log.data)}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-yellow-300">
                      {log.action || log.acao || "Ação"}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-200">
                      <div>{log.adminName || log.adminNome || "Sistema"}</div>
                      {log.adminEmail && (
                        <div className="text-xs text-zinc-500">{log.adminEmail}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300">
                      {log.details || log.detalhes || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {log.resource || "Registro"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-400">
                    {formatDate((log.timestamp as string) || log.criadoEm || log.data)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
                    {log.resource || "Registro"}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-yellow-300">
                  {log.action || log.acao || "Ação"}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {log.adminName || log.adminNome || "Sistema"}
                </div>
                {log.adminEmail && <div className="text-xs text-zinc-600">{log.adminEmail}</div>}
                <div className="mt-2 text-sm text-zinc-300">
                  {log.details || log.detalhes || "—"}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-6 text-center text-zinc-400">
          Nenhum log encontrado com os filtros aplicados.
        </div>
      )}
    </div>
  );
}
