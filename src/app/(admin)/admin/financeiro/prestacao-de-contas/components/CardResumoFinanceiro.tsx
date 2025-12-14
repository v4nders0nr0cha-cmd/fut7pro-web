import type { LancamentoFinanceiro } from "@/types/financeiro";

type Props = { lancamentos: LancamentoFinanceiro[] };

export default function CardResumoFinanceiro({ lancamentos }: Props) {
  const saldoAtual = lancamentos.reduce((acc, l) => acc + (l.valor ?? 0), 0);
  const receitas = lancamentos
    .filter((l) => (l.valor ?? 0) > 0)
    .reduce((acc, l) => acc + (l.valor ?? 0), 0);
  const despesas = lancamentos
    .filter((l) => (l.valor ?? 0) < 0)
    .reduce((acc, l) => acc + (l.valor ?? 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-neutral-800 rounded-lg p-5 flex flex-col items-center shadow-sm">
        <span className="text-gray-400 text-xs mb-1">Receitas</span>
        <span className="text-green-400 font-bold text-xl">R$ {receitas.toFixed(2)}</span>
      </div>
      <div className="bg-neutral-800 rounded-lg p-5 flex flex-col items-center shadow-sm">
        <span className="text-gray-400 text-xs mb-1">Despesas</span>
        <span className="text-red-400 font-bold text-xl">R$ {despesas.toFixed(2)}</span>
      </div>
      <div className="bg-neutral-900 border border-yellow-500 rounded-lg p-5 flex flex-col items-center shadow-lg">
        <span className="text-yellow-500 text-xs mb-1">Saldo Atual</span>
        <span className="text-yellow-300 font-extrabold text-xl">R$ {saldoAtual.toFixed(2)}</span>
      </div>
    </div>
  );
}
