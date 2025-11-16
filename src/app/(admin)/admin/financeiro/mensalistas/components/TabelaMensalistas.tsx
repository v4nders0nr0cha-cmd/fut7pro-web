export type MensalistaResumo = {
  id: string;
  nome: string;
  nickname?: string | null;
  status: string;
  valorPrevisto?: number | null;
  ultimoPagamento?: string | null;
  observacao?: string | null;
};

type Props = {
  mensalistas: MensalistaResumo[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function formatValor(valor?: number | null) {
  if (typeof valor !== "number" || Number.isNaN(valor)) {
    return "—";
  }
  return currencyFormatter.format(valor);
}

function formatData(isoDate?: string | null) {
  if (!isoDate) {
    return "—";
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleDateString("pt-BR");
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("inadimpl")) {
    return "text-red-400";
  }
  if (normalized.includes("a receber") || normalized.includes("pend")) {
    return "text-yellow-400";
  }
  return "text-green-400";
}

export default function TabelaMensalistas({ mensalistas }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="text-left px-3 py-2">Nome</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Mensalidade Prevista</th>
            <th className="text-left px-3 py-2">Ult. Pagamento</th>
            <th className="text-left px-3 py-2">Observacao</th>
          </tr>
        </thead>
        <tbody>
          {mensalistas.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-400" colSpan={5}>
                Nenhum mensalista cadastrado.
              </td>
            </tr>
          ) : (
            mensalistas.map((mensalista) => (
              <tr
                key={mensalista.id}
                className="bg-neutral-800/80 hover:bg-neutral-700 transition rounded-lg"
              >
                <td className="px-3 py-2 font-semibold text-gray-100">
                  <div className="flex flex-col">
                    <span>{mensalista.nome}</span>
                    {mensalista.nickname && (
                      <span className="text-xs text-cyan-200">{mensalista.nickname}</span>
                    )}
                  </div>
                </td>
                <td className={`px-3 py-2 font-bold ${statusBadge(mensalista.status)}`}>
                  {mensalista.status}
                </td>
                <td className="px-3 py-2 text-gray-100">{formatValor(mensalista.valorPrevisto)}</td>
                <td className="px-3 py-2 text-gray-100">
                  {formatData(mensalista.ultimoPagamento)}
                </td>
                <td className="px-3 py-2 text-gray-400 text-xs leading-relaxed">
                  {mensalista.observacao ??
                    "Aguardando integracao com backend para detalhes de cobranca."}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
