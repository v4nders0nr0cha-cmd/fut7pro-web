import React from "react";

type Ticket = {
  id: string;
  assunto: string;
  racha: string;
  status: "open" | "resolved" | "inprogress" | "waiting";
  onboardingPercent: number;
  createdAt: string;
  updatedAt: string;
};

const statusColor: Record<Ticket["status"], string> = {
  open: "text-yellow-400",
  resolved: "text-green-400",
  inprogress: "text-blue-400",
  waiting: "text-zinc-300",
};

const statusLabel: Record<Ticket["status"], string> = {
  open: "Aberto",
  resolved: "Resolvido",
  inprogress: "Em andamento",
  waiting: "Aguardando resposta",
};

interface Props {
  tickets: Ticket[];
}

const TicketTable: React.FC<Props> = ({ tickets }) => (
  <div className="w-full overflow-x-auto bg-zinc-900 rounded-xl mt-3 mb-7">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-400">
          <th className="px-4 py-3 text-left font-semibold">Assunto</th>
          <th className="px-4 py-3 text-left font-semibold">Racha</th>
          <th className="px-4 py-3 text-left font-semibold">Status</th>
          <th className="px-4 py-3 text-left font-semibold">Onboarding</th>
          <th className="px-4 py-3 text-left font-semibold">Criado em</th>
          <th className="px-4 py-3 text-left font-semibold">Última Atualização</th>
          <th className="px-4 py-3 text-left font-semibold">Ações</th>
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
            <td className="px-4 py-3">{t.createdAt}</td>
            <td className="px-4 py-3">{t.updatedAt}</td>
            <td className="px-4 py-3">
              <button className="bg-blue-500 text-white rounded px-3 py-1 text-xs hover:bg-blue-600 transition">
                Ver
              </button>
            </td>
          </tr>
        ))}
        {tickets.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-zinc-400 py-8">
              Nenhum ticket encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TicketTable;
