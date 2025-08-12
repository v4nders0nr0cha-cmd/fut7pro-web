"use client";

export default function CardResumoFinanceiro() {
  // Exemplo de mock, substituir por dados reais depois
  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col items-center justify-center h-full min-h-[140px]">
      <span className="text-[#8de97c] font-bold text-lg">Saldo do Mês</span>
      <span className="text-2xl font-extrabold text-white mt-2">R$ 1.250,00</span>
      <span className="text-xs text-gray-400 mt-1">Entradas: R$ 1.500,00 | Saídas: R$ 250,00</span>
    </div>
  );
}
