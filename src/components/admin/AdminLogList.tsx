"use client";
import type { AdminLog } from "@/hooks/useAdminLogs";

type Props = {
  logs: AdminLog[];
};

function formatarData(dt: string) {
  return new Date(dt).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminLogList({ logs }: Props) {
  if (!logs.length)
    return (
      <div className="p-4 text-center text-gray-400">
        Nenhuma ação registrada.
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex flex-col items-center justify-between rounded-xl border bg-fundo p-3 shadow-sm sm:flex-row"
        >
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-bold text-yellow-400">
              {log.adminNome || "Usuário"}
            </span>
            <span className="text-xs text-gray-400">{log.adminEmail}</span>
            <span className="ml-2 text-sm text-blue-300">{log.acao}</span>
            {log.detalhes && (
              <span className="ml-2 text-xs text-gray-500">
                {log.detalhes.length > 60
                  ? log.detalhes.slice(0, 60) + "..."
                  : log.detalhes}
              </span>
            )}
          </div>
          <span className="ml-auto text-xs text-gray-500">
            {formatarData(log.criadoEm)}
          </span>
        </div>
      ))}
    </div>
  );
}
