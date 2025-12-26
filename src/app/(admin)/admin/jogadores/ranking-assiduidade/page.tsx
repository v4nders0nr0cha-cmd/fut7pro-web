"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

const PERIODOS = [
  { label: "Este mês", value: "mes" },
  { label: "Quadrimestre", value: "quadrimestre" },
  { label: "Ano", value: "ano" },
  { label: "Todos os anos", value: "todos" },
];

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

const getQuarter = (date: Date) => Math.floor(date.getMonth() / 4) + 1;

export default function RankingAssiduidade() {
  const [periodo, setPeriodo] = useState("mes");
  const { rachaId } = useRacha();
  const resolvedRachaId = rachaId || rachaConfig.slug;
  const { jogadores, isLoading, isError, error } = useJogadores(resolvedRachaId);

  const jogadoresFiltrados = useMemo(() => {
    const now = new Date();
    const currentQuarter = getQuarter(now);
    const currentYear = now.getFullYear();

    return jogadores
      .map((jogador: any) => {
        const presences = Array.isArray(jogador.presences) ? jogador.presences : [];
        const fallbackJogos =
          typeof jogador.presencas === "number"
            ? jogador.presencas
            : typeof jogador.partidas === "number"
              ? jogador.partidas
              : 0;

        const jogos = presences.length
          ? presences.filter((presence: any) => {
              const status = String(presence?.status || "").toUpperCase();
              if (status === "AUSENTE") return false;
              if (periodo === "todos") return true;
              const rawDate = presence?.match?.date || presence?.match?.data || null;
              if (!rawDate) return false;
              const parsed = new Date(rawDate);
              if (Number.isNaN(parsed.getTime())) return false;
              if (periodo === "mes") {
                return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === currentYear;
              }
              if (periodo === "ano") {
                return parsed.getFullYear() === currentYear;
              }
              if (periodo === "quadrimestre") {
                return (
                  parsed.getFullYear() === currentYear && getQuarter(parsed) === currentQuarter
                );
              }
              return false;
            }).length
          : periodo === "todos"
            ? fallbackJogos
            : 0;

        return {
          id: jogador.id,
          nome: jogador.nome,
          apelido: jogador.apelido,
          avatar: jogador.avatar || jogador.foto || jogador.photoUrl || DEFAULT_AVATAR,
          jogos,
          mensalista: Boolean(jogador.mensalista),
        };
      })
      .sort((a, b) => b.jogos - a.jogos);
  }, [jogadores, periodo]);

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

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-cyan-300">Ranking de Assiduidade</h1>
          <select
            className="rounded-xl px-4 py-2 bg-[#23272f] text-white border border-gray-600 focus:border-cyan-500"
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

        <div className="bg-[#23272f] border-l-4 border-cyan-400 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <FaInfoCircle className="text-cyan-300 text-2xl shrink-0" />
          <div className="flex-1 text-sm text-gray-200 leading-relaxed">
            <b>O que é o Ranking de Assiduidade?</b>
            <br />
            Ele mostra <b>quais atletas mais participam dos jogos</b> do racha, considerando apenas
            presenças registradas oficialmente.
            <ul className="list-disc pl-5 my-2 text-gray-300">
              <li>Visível apenas para administradores.</li>
              <li>Períodos: mês, quadrimestre, ano ou todos os anos.</li>
              <li>Alta assiduidade = comprometimento e regularidade.</li>
              <li>Use para premiar e incentivar os mais assíduos.</li>
              <li>Baseado nos dados registrados no sistema.</li>
            </ul>
            <span className="block mt-2">
              <b>Dica:</b> reconheça os mais assíduos com brindes, status VIP ou descontos. Isso
              gera engajamento e fideliza o grupo.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#191b1f] rounded-2xl shadow border border-gray-800">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-cyan-200 text-left">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Jogador</th>
                <th className="py-3 px-4">Apelido</th>
                <th className="py-3 px-4">Jogos</th>
                <th className="py-3 px-4">Mensalista</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Carregando ranking...
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td colSpan={5} className="text-center text-red-400 py-8">
                    Erro ao carregar ranking.
                    {error && <div className="text-xs text-red-300 mt-1">{error}</div>}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && jogadoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Nenhum jogador registrado no periodo selecionado.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                jogadoresFiltrados.map((j, idx) => (
                  <tr key={j.id} className="border-t border-gray-800 hover:bg-[#22242b]">
                    <td className="py-3 px-4 font-bold text-cyan-300">{idx + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Image
                        src={j.avatar}
                        alt={`Foto do jogador ${j.nome}`}
                        width={38}
                        height={38}
                        className="rounded-full border-2 border-cyan-400 shadow object-cover"
                      />
                      <span className="text-white">{j.nome}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-200 font-semibold">{j.apelido || "-"}</td>
                    <td className="py-3 px-4 text-white font-bold">{j.jogos}</td>
                    <td className="py-3 px-4">
                      {j.mensalista && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-semibold text-xs">
                          Mensalista
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-400 mt-4 text-center">
          * Apenas presenças lançadas no sistema são contabilizadas.
        </div>
      </main>
    </>
  );
}
