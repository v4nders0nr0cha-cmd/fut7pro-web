"use client";

import { useEffect, useMemo, useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import PartidaCard from "./PartidaCard";

function normalize(text?: string | null) {
  return text ? text.toLowerCase() : "";
}

export default function HistoricoPartidas() {
  const { partidas, isLoading, isError, error } = usePartidas();
  const [search, setSearch] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState(() => new Date().getFullYear().toString());

  const anosDisponiveis = useMemo(() => {
    const anos = partidas
      .map((partida) => {
        const data = new Date(partida.data);
        return Number.isNaN(data.getTime()) ? null : data.getFullYear();
      })
      .filter((ano): ano is number => ano !== null);

    return Array.from(new Set(anos))
      .sort((a, b) => b - a)
      .map((ano) => ano.toString());
  }, [partidas]);

  useEffect(() => {
    if (anosDisponiveis.length === 0) {
      return;
    }

    if (!anosDisponiveis.includes(anoSelecionado)) {
      setAnoSelecionado(anosDisponiveis[0]);
    }
  }, [anosDisponiveis, anoSelecionado]);

  const partidasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return partidas.filter((partida) => {
      const data = new Date(partida.data);
      const anoPartida = Number.isNaN(data.getTime()) ? null : data.getFullYear().toString();
      const atendeAno =
        anosDisponiveis.length === 0 || !anoSelecionado || anoPartida === anoSelecionado;

      if (!atendeAno) {
        return false;
      }

      if (!termo) {
        return true;
      }

      return [normalize(partida.timeA), normalize(partida.timeB), normalize(partida.local)].some(
        (campo) => campo.includes(termo)
      );
    });
  }, [partidas, anosDisponiveis, anoSelecionado, search]);

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
          <p className="text-red-400">
            Erro ao carregar partidas: {error ?? "tente novamente mais tarde"}
          </p>
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
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(e.target.value)}
          disabled={anosDisponiveis.length === 0}
        >
          {anosDisponiveis.length === 0 ? (
            <option value={anoSelecionado}>Sem partidas</option>
          ) : (
            anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))
          )}
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
