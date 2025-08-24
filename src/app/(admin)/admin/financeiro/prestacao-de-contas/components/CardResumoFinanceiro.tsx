import type { Lancamento } from "../mocks/mockLancamentosFinanceiro";

type Props = { lancamentos: Lancamento[] };

export default function CardResumoFinanceiro({ lancamentos }: Props) {
  const saldoAtual = lancamentos.reduce((acc, l) => acc + l.valor, 0);
  const receitas = lancamentos
    .filter((l) => l.valor > 0)
    .reduce((acc, l) => acc + l.valor, 0);
  const despesas = lancamentos
    .filter((l) => l.valor < 0)
    .reduce((acc, l) => acc + l.valor, 0);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col items-center rounded-lg bg-neutral-800 p-5 shadow-sm">
        <span className="mb-1 text-xs text-gray-400">Receitas</span>
        <span className="text-xl font-bold text-green-400">
          R$ {receitas.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-center rounded-lg bg-neutral-800 p-5 shadow-sm">
        <span className="mb-1 text-xs text-gray-400">Despesas</span>
        <span className="text-xl font-bold text-red-400">
          R$ {despesas.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-center rounded-lg border border-yellow-500 bg-neutral-900 p-5 shadow-lg">
        <span className="mb-1 text-xs text-yellow-500">Saldo Atual</span>
        <span className="text-xl font-extrabold text-yellow-300">
          R$ {saldoAtual.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
