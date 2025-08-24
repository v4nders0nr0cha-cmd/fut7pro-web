import type { Mensalista } from "../mocks/mockMensalistas";

type Props = { mensalistas: Mensalista[] };

export default function TabelaMensalistas({ mensalistas }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="px-2 py-2 text-left">Nome</th>
            <th className="px-2 py-2 text-left">Status</th>
            <th className="px-2 py-2 text-left">Valor</th>
            <th className="px-2 py-2 text-left">Últ. Pagamento</th>
            <th className="px-2 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {mensalistas.map((m) => (
            <tr
              key={m.id}
              className="rounded-lg bg-neutral-800 transition hover:bg-neutral-700"
            >
              <td className="px-2 py-1 font-semibold">{m.nome}</td>
              <td
                className={
                  "px-2 py-1 font-bold " +
                  (m.status === "Em dia"
                    ? "text-green-400"
                    : m.status === "A receber"
                      ? "text-yellow-400"
                      : "text-red-400")
                }
              >
                {m.status}
              </td>
              <td className="px-2 py-1">R$ {m.valor.toFixed(2)}</td>
              <td className="px-2 py-1">
                {m.ultimoPagamento
                  ? m.ultimoPagamento.split("-").reverse().join("/")
                  : "-"}
              </td>
              <td className="px-2 py-1">
                <button className="text-xs text-yellow-400 hover:underline">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
