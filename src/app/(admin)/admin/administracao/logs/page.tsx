"use client";

import { useAdminLogs } from "@/hooks/useAdminLogs";
import { useAdmin } from "@/hooks/useAdmin";
import { useRacha } from "@/context/RachaContext";

// Forçar renderização no cliente para evitar problemas de template
export const dynamic = "force-dynamic";
import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";

export default function LogsAdminPage() {
  const { rachaId } = useRacha();
  const { logs, isLoading, isError, error } = useAdminLogs(rachaId);
  const { admins } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando logs...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar logs</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const normalizedLogs = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        actionLabel: log.acao,
        description: log.detalhes ?? "",
        adminLabel: log.adminNome ?? log.adminEmail ?? log.usuarioId,
        timestamp: log.criadoEm ?? log.data,
        resource: log.recurso ?? "—",
      })),
    [logs],
  );

  const filteredLogs = normalizedLogs.filter((log) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      log.actionLabel.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      (log.adminLabel ?? "").toLowerCase().includes(term);

    const matchesAction = !selectedAction || log.actionLabel === selectedAction;
    const matchesAdmin = !selectedAdmin || log.adminId === selectedAdmin;

    return matchesSearch && matchesAction && matchesAdmin;
  });

  const uniqueActions = Array.from(new Set(normalizedLogs.map((log) => log.actionLabel)));
  const uniqueAdmins = Array.from(new Set(normalizedLogs.map((log) => log.adminId)));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4 md:mb-0">Logs de Administração</h1>

          <div className="flex flex-col sm:flex-row gap-2">
            <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition flex items-center gap-2">
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#232323] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            className="px-4 py-2 bg-[#232323] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Todos os admins</option>
            {uniqueAdmins.map((adminId) => {
              const admin = admins.find((a) => a.id === adminId);
              return (
                <option key={adminId} value={adminId}>
                  {admin?.nome || adminId}
                </option>
              );
            })}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedAction("");
              setSelectedAdmin("");
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Lista de Logs */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-textoSuave">Nenhum log encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#232323] rounded-lg p-4 border-l-4 border-yellow-400"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-yellow-400">{log.actionLabel}</span>
                      <span className="text-xs text-gray-400">por {log.adminLabel}</span>
                    </div>
                    {log.description && <p className="text-sm text-gray-300">{log.description}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString("pt-BR")
                        : "Sem data"}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-600 rounded">{log.resource}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
