"use client";

import { useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import PartidaCard from "./PartidaCard";

export default function HistoricoPartidas() {
  const [search, setSearch] = useState("");
  const [ano, setAno] = useState("2025");
  const { partidas, isLoading, isError, error } = usePartidas();

  const partidasFiltradas = partidas
    .filter((p) => p.ano?.toString() === ano)
    .filter((p) =>
      [p.timeCasa, p.timeFora, p.local].some((txt) =>
        txt?.toLowerCase().includes(search.toLowerCase())
      )
    );

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Histórico de Partidas</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-textoSuave">Carregando partidas...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Histórico de Partidas</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Erro ao carregar partidas: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-2">Histórico de Partidas</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="px-3 py-2 rounded bg-secundario text-white outline-none"
          placeholder="Buscar time ou local..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar time ou local"
        />
        <select
          className="px-3 py-2 rounded bg-secundario text-white"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {partidasFiltradas.length === 0 && (
          <p className="text-textoSuave">Nenhuma partida encontrada.</p>
        )}
        {partidasFiltradas.map((partida) => (
          <PartidaCard key={partida.id} partida={partida} />
        ))}
      </div>
    </div>
  );
}
