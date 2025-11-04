"use client";

import { useEffect, useMemo, useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import PartidaCard from "./PartidaCard";

export default function HistoricoPartidas() {
  const { partidas, isLoading, isError, error } = usePartidas();
  const anosDisponiveis = useMemo(() => {
    const anos = Array.from(new Set(partidas.map((p) => p.ano))).sort((a, b) => b - a);
    return anos.length > 0 ? anos : [new Date().getFullYear()];
  }, [partidas]);

  const [search, setSearch] = useState("");
  const [ano, setAno] = useState(anosDisponiveis[0]?.toString() ?? "");

  useEffect(() => {
    if (!ano && anosDisponiveis.length > 0) {
      setAno(anosDisponiveis[0].toString());
    }
  }, [anosDisponiveis, ano]);

  const partidasFiltradas = partidas
    .filter((p) => (ano ? p.ano.toString() === ano : true))
    .filter((p) =>
      [p.timeCasa, p.timeFora, p.local]
        .filter(Boolean)
        .some((valor) => valor!.toLowerCase().includes(search.toLowerCase())),
    );

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Historico de Partidas</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-textoSuave">Carregando partidas...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-2">Historico de Partidas</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Erro ao carregar partidas: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-2">Historico de Partidas</h2>
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
          {anosDisponiveis.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
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
