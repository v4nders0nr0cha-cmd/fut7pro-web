"use client";

import { useMemo } from "react";
import { useFinanceiro } from "@/hooks/useFinanceiro";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CardResumoFinanceiro() {
  const { lancamentos, isLoading, isError, error } = useFinanceiro();

  const resumo = useMemo(() => {
    return lancamentos.reduce(
      (acc, lancamento) => {
        if (lancamento.tipo === "saida") {
          acc.saidas += lancamento.valor;
        } else {
          acc.entradas += lancamento.valor;
        }
        return acc;
      },
      { entradas: 0, saidas: 0 }
    );
  }, [lancamentos]);

  const saldo = resumo.entradas - resumo.saidas;

  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col items-center justify-center h-full min-h-[140px] text-center">
      <span className="text-[#8de97c] font-bold text-lg">Saldo do Mês</span>
      {isLoading ? (
        <span className="text-white text-sm mt-2 animate-pulse">Calculando saldo...</span>
      ) : isError ? (
        <span className="text-red-300 text-sm mt-2">
          {error ?? "Erro ao carregar o resumo financeiro."}
        </span>
      ) : (
        <>
          <span className="text-2xl font-extrabold text-white mt-2">{currency.format(saldo)}</span>
          <span className="text-xs text-gray-400 mt-1">
            Entradas: {currency.format(resumo.entradas)} | Saídas: {currency.format(resumo.saidas)}
          </span>
        </>
      )}
    </div>
  );
}
