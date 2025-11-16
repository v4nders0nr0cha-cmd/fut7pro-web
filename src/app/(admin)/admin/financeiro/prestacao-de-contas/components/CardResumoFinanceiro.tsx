import type { LancamentoFinanceiro } from "@/types/financeiro";
import { DEFAULT_FORMATTER } from "../constants";

type Props = { lancamentos: LancamentoFinanceiro[] };

export default function CardResumoFinanceiro({ lancamentos }: Props) {
  const { receitas, despesas, saldo } = lancamentos.reduce(
    (acc, lancamento) => {
      const valor = Math.abs(lancamento.valor ?? 0);
      if (lancamento.tipo === "entrada") {
        acc.receitas += valor;
        acc.saldo += valor;
      } else {
        acc.despesas += valor;
        acc.saldo -= valor;
      }
      return acc;
    },
    { receitas: 0, despesas: 0, saldo: 0 }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-neutral-800 rounded-lg p-5 flex flex-col items-center shadow-sm">
        <span className="text-gray-400 text-xs mb-1">Receitas</span>
        <span className="text-green-400 font-bold text-xl">
          {DEFAULT_FORMATTER.format(receitas)}
        </span>
      </div>
      <div className="bg-neutral-800 rounded-lg p-5 flex flex-col items-center shadow-sm">
        <span className="text-gray-400 text-xs mb-1">Despesas</span>
        <span className="text-red-400 font-bold text-xl">{DEFAULT_FORMATTER.format(despesas)}</span>
      </div>
      <div className="bg-neutral-900 border border-yellow-500 rounded-lg p-5 flex flex-col items-center shadow-lg">
        <span className="text-yellow-500 text-xs mb-1">Saldo Atual</span>
        <span className="text-yellow-300 font-extrabold text-xl">
          {DEFAULT_FORMATTER.format(saldo)}
        </span>
      </div>
    </div>
  );
}
