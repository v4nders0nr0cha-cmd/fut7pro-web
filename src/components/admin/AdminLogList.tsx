"use client";
import type { LogAdmin } from "@/types/admin";

type Props = {
  logs: LogAdmin[];
};

function formatarData(dt: string) {
  return new Date(dt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminLogList({ logs }: Props) {
  if (!logs.length)
    return <div className="p-4 text-center text-gray-400">Nenhuma ação registrada.</div>;
  return (
    <div className="w-full flex flex-col gap-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <span className="font-bold text-yellow-400">{log.adminNome || "Usuário"}</span>
            <span className="text-xs text-gray-400">{log.adminEmail}</span>
            <span className="ml-2 text-sm text-blue-300">{log.acao}</span>
            {log.detalhes && (
              <span className="ml-2 text-xs text-gray-500">
                {log.detalhes.length > 60 ? log.detalhes.slice(0, 60) + "..." : log.detalhes}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 ml-auto">{formatarData(log.criadoEm)}</span>
        </div>
      ))}
    </div>
  );
}

