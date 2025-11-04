"use client";
import type { LancamentoFinanceiro } from "@/types/financeiro";

function formatarData(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR");
}
function formatarValor(v: number, tipo: string) {
  return `${tipo === "saida" ? "-" : "+"} R$ ${v.toFixed(2)}`;
}

type Props = {
  lancamentos: LancamentoFinanceiro[];
};

export default function FinanceiroList({ lancamentos }: Props) {
  if (!lancamentos.length)
    return <div className="p-4 text-center text-gray-400">Nenhum lançamento financeiro.</div>;
  return (
    <div className="w-full flex flex-col gap-2">
      {lancamentos.map((l) => (
        <div
          key={l.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <span className="font-bold text-yellow-400">{l.categoria ?? "outros"}</span>
            <span
              className={`ml-2 font-bold ${l.tipo === "saida" ? "text-red-400" : "text-green-400"}`}
            >
              {formatarValor(l.valor, l.tipo)}
            </span>
            <span className="ml-2 text-xs text-gray-500">{l.adminNome ?? l.responsavel}</span>
            <span className="ml-2 text-xs text-gray-400">{formatarData(l.data)}</span>
            {l.descricao && <span className="ml-2 text-xs text-gray-500">{l.descricao}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
