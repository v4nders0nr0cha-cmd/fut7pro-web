"use client";

import Head from "next/head";
import { useState } from "react";
import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa";

const MOCK_RANK = [
  {
    id: "1",
    nome: "Carlos Silva",
    apelido: "Carlinhos",
    avatar: "/images/jogadores/jogador_padrao_01.jpg",
    jogos: 28,
    mensalista: true,
  },
  {
    id: "2",
    nome: "Lucas Souza",
    apelido: "Luk",
    avatar: "/images/jogadores/jogador_padrao_02.jpg",
    jogos: 27,
    mensalista: false,
  },
  {
    id: "3",
    nome: "Renan Costa",
    apelido: "Rena",
    avatar: "/images/jogadores/jogador_padrao_03.jpg",
    jogos: 24,
    mensalista: true,
  },
];

const PERIODOS = [
  { label: "Este mês", value: "mes" },
  { label: "Quadrimestre", value: "quadrimestre" },
  { label: "Ano", value: "ano" },
  { label: "Todos os anos", value: "todos" },
];

export default function RankingAssiduidade() {
  const [periodo, setPeriodo] = useState("mes");

  const jogadoresFiltrados = MOCK_RANK.map((j) => ({
    ...j,
    jogos:
      periodo === "mes"
        ? Math.max(j.jogos - 20, 1)
        : periodo === "quadrimestre"
          ? Math.max(j.jogos - 10, 1)
          : periodo === "ano"
            ? j.jogos
            : j.jogos + 10,
  })).sort((a, b) => b.jogos - a.jogos);

  return (
    <>
      <Head>
        <title>Ranking de Assiduidade | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o ranking de assiduidade dos jogadores do seu racha: quem mais marcou presença em jogos oficiais no mês, quadrimestre, ano ou geral."
        />
        <meta
          name="keywords"
          content="fut7, racha, ranking assiduidade, presença jogadores, painel admin, SaaS futebol, Fut7Pro"
        />
      </Head>

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-cyan-300">
            Ranking de Assiduidade
          </h1>
          <select
            className="rounded-xl border border-gray-600 bg-[#23272f] px-4 py-2 text-white focus:border-cyan-500"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex flex-col items-start gap-4 rounded-xl border-l-4 border-cyan-400 bg-[#23272f] p-4 sm:flex-row sm:items-center">
          <FaInfoCircle className="shrink-0 text-2xl text-cyan-300" />
          <div className="flex-1 text-sm leading-relaxed text-gray-200">
            <b>O que é o Ranking de Assiduidade?</b>
            <br />
            Ele mostra <b>quais atletas mais participam dos jogos</b> do racha,
            considerando apenas presenças registradas oficialmente.
            <ul className="my-2 list-disc pl-5 text-gray-300">
              <li>Visível apenas para administradores.</li>
              <li>Períodos: mês, quadrimestre, ano ou todos os anos.</li>
              <li>Alta assiduidade = comprometimento e regularidade.</li>
              <li>Use para premiar e incentivar os mais assíduos.</li>
              <li>Baseado nos dados registrados no sistema.</li>
            </ul>
            <span className="mt-2 block">
              <b>Dica:</b> reconheça os mais assíduos com brindes, status VIP ou
              descontos. Isso gera engajamento e fideliza o grupo.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#191b1f] shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-cyan-200">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Jogador</th>
                <th className="px-4 py-3">Apelido</th>
                <th className="px-4 py-3">Jogos</th>
                <th className="px-4 py-3">Mensalista</th>
              </tr>
            </thead>
            <tbody>
              {jogadoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Nenhum jogador registrado no período selecionado.
                  </td>
                </tr>
              )}
              {jogadoresFiltrados.map((j, idx) => (
                <tr
                  key={j.id}
                  className="border-t border-gray-800 hover:bg-[#22242b]"
                >
                  <td className="px-4 py-3 font-bold text-cyan-300">
                    {idx + 1}
                  </td>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <Image
                      src={j.avatar}
                      alt={`Foto do jogador ${j.nome}`}
                      width={38}
                      height={38}
                      className="rounded-full border-2 border-cyan-400 shadow"
                    />
                    <span className="text-white">{j.nome}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-cyan-200">
                    {j.apelido}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">{j.jogos}</td>
                  <td className="px-4 py-3">
                    {j.mensalista && (
                      <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black">
                        Mensalista
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          * Apenas presenças lançadas no sistema são contabilizadas.
        </div>
      </main>
    </>
  );
}
