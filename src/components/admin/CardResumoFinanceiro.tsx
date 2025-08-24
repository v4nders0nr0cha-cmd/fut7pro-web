"use client";

export default function CardResumoFinanceiro() {
  // Exemplo de mock, substituir por dados reais depois
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center rounded-xl bg-[#23272F] p-6 shadow">
      <span className="text-lg font-bold text-[#8de97c]">Saldo do Mês</span>
      <span className="mt-2 text-2xl font-extrabold text-white">
        R$ 1.250,00
      </span>
      <span className="mt-1 text-xs text-gray-400">
        Entradas: R$ 1.500,00 | Saídas: R$ 250,00
      </span>
    </div>
  );
}
