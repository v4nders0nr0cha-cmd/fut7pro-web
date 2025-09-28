import type { SuperadminTicketResumo } from '@/types/superadmin';

interface TicketTableProps {
  tickets: SuperadminTicketResumo[];
  isLoading?: boolean;
}

const statusStyles: Record<string, string> = {
  aberto: 'text-yellow-400',
  pendente: 'text-orange-300',
  andamento: 'text-blue-400',
  em_andamento: 'text-blue-400',
  resolvido: 'text-green-400',
  fechado: 'text-green-400',
};

const statusLabels: Record<string, string> = {
  aberto: 'Aberto',
  pendente: 'Aguardando',
  andamento: 'Em andamento',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export default function TicketTable({ tickets, isLoading }: TicketTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-zinc-900 rounded-xl px-6 py-8 text-center text-zinc-400">
        Carregando tickets...
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="w-full bg-zinc-900 rounded-xl px-6 py-8 text-center text-zinc-400">
        Nenhum ticket encontrado.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-zinc-900 rounded-xl mt-3 mb-7">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400">
            <th className="px-4 py-3 text-left font-semibold">Assunto</th>
            <th className="px-4 py-3 text-left font-semibold">Racha</th>
            <th className="px-4 py-3 text-left font-semibold">Responsável</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Criado em</th>
            <th className="px-4 py-3 text-left font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const key = ticket.status.toLowerCase();
            return (
              <tr key={ticket.id} className="border-b border-zinc-800 hover:bg-zinc-800 transition">
                <td className="px-4 py-3">{ticket.assunto}</td>
                <td className="px-4 py-3">{ticket.racha ?? '-'}</td>
                <td className="px-4 py-3">{ticket.responsavel ?? '-'}</td>
                <td className="px-4 py-3 font-bold">
                  <span className={statusStyles[key] ?? 'text-zinc-300'}>
                    {statusLabels[key] ?? ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(ticket.criadoEm).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <button className="bg-blue-500 text-white rounded px-3 py-1 text-xs hover:bg-blue-600 transition">
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
