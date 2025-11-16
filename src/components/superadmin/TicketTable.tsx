import React from "react";

type TicketStatus = "novo" | "lido" | "respondido";

type Ticket = {
  id: string;
  assunto: string;
  racha: string;
  status: TicketStatus;
  onboardingPercent: number;
  dataEnvio: string;
  contato: string;
};

const statusColor: Record<TicketStatus, string> = {
  novo: "text-yellow-400",
  lido: "text-blue-400",
  respondido: "text-green-400",
};

const statusLabel: Record<TicketStatus, string> = {
  novo: "Novo",
  lido: "Lido",
  respondido: "Respondido",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Props {
  tickets: Ticket[];
  isLoading?: boolean;
  error?: string | null;
}

const TicketTable: React.FC<Props> = ({ tickets, isLoading = false, error = null }) => (
  <div className="w-full overflow-x-auto bg-zinc-900 rounded-xl mt-3 mb-7">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-400">
          <th className="px-4 py-3 text-left font-semibold">Assunto</th>
          <th className="px-4 py-3 text-left font-semibold">Racha</th>
          <th className="px-4 py-3 text-left font-semibold">Status</th>
          <th className="px-4 py-3 text-left font-semibold">Onboarding</th>
          <th className="px-4 py-3 text-left font-semibold">Recebido em</th>
          <th className="px-4 py-3 text-left font-semibold">Contato</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id} className="border-b border-zinc-800 hover:bg-zinc-800 transition">
            <td className="px-4 py-3">{t.assunto}</td>
            <td className="px-4 py-3">{t.racha}</td>
            <td className="px-4 py-3 font-bold">
              <span className={statusColor[t.status]}>{statusLabel[t.status]}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-20 bg-zinc-800 h-2 rounded">
                  <div
                    className="h-2 rounded bg-yellow-400"
                    style={{ width: `${t.onboardingPercent}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400">{t.onboardingPercent}%</span>
              </div>
            </td>
            <td className="px-4 py-3">{formatDate(t.dataEnvio)}</td>
            <td className="px-4 py-3">{t.contato}</td>
          </tr>
        ))}
        {!isLoading && tickets.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center text-zinc-400 py-8">
              Nenhum ticket encontrado.
              {error && <span className="block text-xs text-red-300 mt-1">{error}</span>}
            </td>
          </tr>
        )}
        {isLoading && (
          <tr>
            <td colSpan={6} className="text-center text-zinc-400 py-8">
              Carregando tickets...
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TicketTable;
