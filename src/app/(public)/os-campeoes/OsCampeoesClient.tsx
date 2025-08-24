"use client";

import { useState, useMemo } from "react";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { campeoesAno } from "@/components/lists/mockCampeoesAno";
import { melhoresPorPosicao } from "@/components/lists/mockMelhoresPorPosicao";
import { quadrimestres } from "@/components/lists/mockQuadrimestres";
import { partidasMock } from "@/components/lists/mockPartidas";
import type { QuadrimestresAno } from "@/types/estatisticas";

// Ordem visual padronizada
const ordemCampeoes = [
  "Melhor do Ano",
  "Artilheiro do Ano",
  "Maestro do Ano",
  "Campeão do Ano",
];

const ordemPosicoes = [
  "Atacante do Ano",
  "Meia do Ano",
  "Zagueiro do Ano",
  "Goleiro do Ano",
];

const prioridadeQuadrimestre = [
  "Melhor do Quadrimestre",
  "Artilheiro",
  "Maestro",
  "Campeão do Quadrimestre",
  "Atacante",
  "Meia",
  "Zagueiro",
  "Goleiro",
];

// Fallback enxuto para quando não houver dados naquele ano
const mockQuadrimestresAno: QuadrimestresAno = {
  "1º Quadrimestre": [
    {
      titulo: "Artilheiro",
      nome: "Matheus Silva",
      icone: "⚽",
      slug: "matheus-silva",
    },
    { titulo: "Meia", nome: "Lucas Rocha", icone: "🥇", slug: "lucas-rocha" },
    {
      titulo: "Melhor do Quadrimestre",
      nome: "Vitão Beta",
      icone: "🏆",
      slug: "vitao-beta",
    },
  ],
  "2º Quadrimestre": [
    {
      titulo: "Artilheiro",
      nome: "João Alpha",
      icone: "⚽",
      slug: "joao-alpha",
    },
    { titulo: "Meia", nome: "Cris Mid", icone: "🥇", slug: "cris-mid" },
  ],
  "3º Quadrimestre": [],
};

// Anos existentes a partir do mock de partidas
const anosComPartidas = Array.from(
  new Set(partidasMock.map((p) => Number(p.data.slice(0, 4)))),
).sort((a, b) => b - a);

export default function OsCampeoesClient() {
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(
    anosComPartidas[0],
  );

  // Campeões do ano no padrão e ordem visual
  const campeoesDoAno = useMemo(() => {
    if (!anoSelecionado) return [];
    const lista = ordemCampeoes
      .map((titulo) =>
        campeoesAno.find(
          (c) => c.ano === anoSelecionado && c.titulo === titulo,
        ),
      )
      .filter(Boolean)
      .map((c) => ({ ...c! }));

    // Ajuste visual aprovado: maestro com ícone de chuteira
    const maestro = lista.find((c) => c?.titulo === "Maestro do Ano");
    if (maestro) maestro.icone = "/images/icons/chuteira-de-ouro.png";

    return lista;
  }, [anoSelecionado]);

  // Melhores por posição no ano
  const melhoresPosicaoDoAno = useMemo(() => {
    if (!anoSelecionado) return [];
    return melhoresPorPosicao
      .filter((p) => p.ano === anoSelecionado)
      .sort(
        (a, b) =>
          ordemPosicoes.indexOf(a.posicao) - ordemPosicoes.indexOf(b.posicao),
      );
  }, [anoSelecionado]);

  // Quadrimestres do ano com fallback + ordenação de títulos
  const quadrimestresOrdenados: QuadrimestresAno = useMemo(() => {
    const base: QuadrimestresAno =
      anoSelecionado &&
      quadrimestres[anoSelecionado] &&
      Object.keys(quadrimestres[anoSelecionado]).length > 0
        ? quadrimestres[anoSelecionado]
        : mockQuadrimestresAno;

    const out: QuadrimestresAno = {};
    (
      ["1º Quadrimestre", "2º Quadrimestre", "3º Quadrimestre"] as const
    ).forEach((periodo) => {
      out[periodo] = [...(base[periodo] || [])].sort(
        (a, b) =>
          prioridadeQuadrimestre.indexOf(a.titulo) -
          prioridadeQuadrimestre.indexOf(b.titulo),
      );
    });
    return out;
  }, [anoSelecionado]);

  return (
    <div className="space-y-10">
      {/* Seletor de temporada (central) */}
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="ano" className="font-semibold text-yellow-400">
          Temporada:
        </label>
        <select
          id="ano"
          className="rounded border border-yellow-400 bg-zinc-900 px-3 py-1 text-yellow-200"
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(Number(e.target.value))}
        >
          {anosComPartidas.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      {/* Campeões do Ano */}
      <section className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-yellow-400">
          Campeões do Ano
        </h2>
        <div className="grid grid-cols-1 items-stretch justify-items-center gap-6 md:grid-cols-4">
          {campeoesDoAno.map((c) =>
            c ? (
              <CampeaoAnoCard
                key={c.titulo}
                titulo={c.titulo}
                nome={c.nome}
                image={c.image}
                valor={c.valor}
                icone={c.icone}
                href={c.href}
                slug={c.slug}
                temporario={c.temporario}
              />
            ) : null,
          )}
        </div>
      </section>

      {/* Melhores por Posição */}
      <section className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-yellow-400">
          Melhores por Posição
        </h2>
        <div className="grid grid-cols-1 items-stretch justify-items-center gap-6 md:grid-cols-4">
          {melhoresPosicaoDoAno.map((c) => (
            <CampeaoAnoCard
              key={c.posicao}
              titulo={c.posicao}
              nome={c.nome}
              image={c.image}
              valor={c.valor}
              icone={c.icone}
              href={c.href}
              slug={c.slug}
              temporario={c.temporario}
            />
          ))}
        </div>
      </section>

      {/* Campeões por Quadrimestre */}
      <section className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-yellow-400">
          Campeões por Quadrimestre
        </h2>
        <QuadrimestreGrid dados={quadrimestresOrdenados} />
      </section>
    </div>
  );
}
