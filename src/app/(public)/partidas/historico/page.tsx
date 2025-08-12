"use client";

import HistoricoPartidas from "@/components/partidas/HistoricoPartidas";
import { usePartidas } from "@/hooks/usePartidas";

export default function HistoricoPage() {
  const { partidas, isLoading, isError, error } = usePartidas();

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando histórico de partidas...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar histórico</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <HistoricoPartidas />
    </div>
  );
}
