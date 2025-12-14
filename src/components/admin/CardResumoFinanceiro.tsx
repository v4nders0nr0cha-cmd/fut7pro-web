"use client";

type Resumo = {
  saldo: number;
  receitas: number;
  despesas: number;
  periodoLabel?: string;
};

type Props = {
  resumo?: Resumo;
  isLoading?: boolean;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CardResumoFinanceiro({ resumo, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col gap-3 h-full min-h-[140px] animate-pulse">
        <div className="h-4 w-32 bg-neutral-700 rounded" />
        <div className="h-6 w-24 bg-neutral-600 rounded" />
        <div className="h-3 w-40 bg-neutral-700 rounded" />
      </div>
    );
  }

  if (!resumo) {
    return (
      <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col items-center justify-center h-full min-h-[140px] text-center">
        <span className="text-sm text-gray-300 font-semibold">Sem lancamentos no periodo</span>
        <span className="text-xs text-gray-500 mt-1">
          Adicione receitas ou despesas para ver o saldo.
        </span>
      </div>
    );
  }

  const { saldo, receitas, despesas, periodoLabel } = resumo;

  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col items-center justify-center h-full min-h-[140px]">
      <span className="text-[#8de97c] font-bold text-lg">
        {periodoLabel ? `Saldo (${periodoLabel})` : "Saldo do periodo"}
      </span>
      <span className="text-2xl font-extrabold text-white mt-2">{formatCurrency(saldo)}</span>
      <span className="text-xs text-gray-400 mt-1">
        Entradas: {formatCurrency(receitas)} | Saidas: {formatCurrency(Math.abs(despesas))}
      </span>
    </div>
  );
}
