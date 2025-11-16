"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import type { TeamRankingEntry } from "@/types/ranking";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";

const periodos = [
  { label: "Temporada atual", value: "current", disabled: false },
  { label: "Quadrimestres (em breve)", value: "quarter", disabled: true },
  { label: "Anual (em breve)", value: "year", disabled: true },
  { label: "Histórico (em breve)", value: "historic", disabled: true },
];

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

export default function ClassificacaoTimesPage() {
  const slug = usePublicTenantSlug();
  const { rankings, isLoading, isError, error, updatedAt, availableYears } =
    usePublicTeamRankings(slug);

  const [periodo, setPeriodo] = useState("current");

  const ultimaAtualizacao = useMemo(() => {
    if (!updatedAt) return null;
    const data = new Date(updatedAt);
    if (Number.isNaN(data.getTime())) return null;
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [updatedAt]);

  const classificacao = useMemo<TeamRankingEntry[]>(() => {
    return [...rankings].sort((a, b) => {
      if (a.posicao === b.posicao) {
        return b.pontos - a.pontos;
      }
      return a.posicao - b.posicao;
    });
  }, [rankings]);

  const renderTabela = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: 8 }, (_, idx) => (
            <tr key={`skeleton-${idx}`} className="border-t border-gray-800 animate-pulse">
              <td className="p-2">
                <div className="h-3 w-6 rounded bg-neutral-700" />
              </td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-neutral-700" />
                  <div className="h-3 w-32 rounded bg-neutral-700" />
                </div>
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-10 rounded bg-neutral-700" />
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-8 rounded bg-neutral-700" />
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-8 rounded bg-neutral-700" />
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-8 rounded bg-neutral-700" />
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-8 rounded bg-neutral-700" />
              </td>
              <td className="p-2 text-right">
                <div className="ml-auto h-3 w-12 rounded bg-neutral-700" />
              </td>
            </tr>
          ))}
        </tbody>
      );
    }

    if (isError) {
      return (
        <tbody>
          <tr>
            <td colSpan={8} className="py-8 text-center text-sm text-red-300">
              {error ?? "Não foi possível carregar a classificação dos times agora."}
            </td>
          </tr>
        </tbody>
      );
    }

    if (!classificacao.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
              Ainda não existem times ranqueados para este racha.
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {classificacao.map((time) => {
          const destaque = time.posicao === 1 ? "border-2 border-yellow-400 bg-[#232100]" : "";
          return (
            <tr
              key={time.rankingId}
              className={`border-t border-gray-800 hover:bg-[#232323] transition-all ${destaque}`}
            >
              <td className="p-2 font-bold text-yellow-400">{time.posicao}</td>
              <td className="flex items-center gap-3 p-2 whitespace-nowrap font-semibold text-white">
                <Image
                  src={time.logo || DEFAULT_LOGO}
                  alt={`Escudo do time ${time.nome}`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded object-cover bg-zinc-900"
                />
                <span>{time.nome}</span>
              </td>
              <td className="text-right p-2 font-extrabold text-yellow-300 text-base">
                {time.pontos}
              </td>
              <td className="text-right p-2">{time.jogos}</td>
              <td className="text-right p-2">{time.vitorias}</td>
              <td className="text-right p-2">{time.empates}</td>
              <td className="text-right p-2">{time.derrotas}</td>
              <td className="text-right p-2">{formatPercent(time.aproveitamento)}</td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <>
      <Head>
        <title>Classificação dos Times | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Tabela oficial de classificação dos times do seu racha, calculada automaticamente pelo backend multi-tenant do Fut7Pro."
        />
        <meta
          name="keywords"
          content="classificação de times, futebol 7, ranking, tabela, historico, temporadas, pontos, estatisticas, fut7, racha, SaaS, Fut7Pro"
        />
      </Head>

      <main className="w-full min-h-screen bg-fundo text-white pb-16">
        <h1 className="sr-only">
          Classificação dos Times - Tabela oficial de desempenho dos times do racha no Fut7Pro
        </h1>

        <section className="mt-8 flex flex-col items-center gap-4 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
            Classificação dos Times
          </h2>
          <select
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none disabled:opacity-60"
            aria-label="Selecionar período da classificação"
          >
            {periodos.map((periodoOption) => (
              <option
                key={periodoOption.value}
                value={periodoOption.value}
                disabled={periodoOption.disabled}
              >
                {periodoOption.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 max-w-xl text-center">
            Filtros por quadrimestre e histórico detalhado serão habilitados assim que o backend
            consolidar as agregações de ranking. Enquanto isso exibimos a temporada corrente com
            dados reais vindos da API multi-tenant.
          </p>
          {(availableYears?.length ?? 0) > 0 && (
            <p className="text-xs text-gray-500">
              Anos com dados registrados: {availableYears?.sort().join(", ")}
            </p>
          )}
          {ultimaAtualizacao && (
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
              Atualizado em {ultimaAtualizacao}
            </span>
          )}
        </section>

        <section className="mt-6 px-4 text-center text-sm text-gray-400 max-w-3xl mx-auto">
          Veja a classificação oficial calculada pelo backend do Fut7Pro com base nas partidas
          registradas no painel administrativo. Os dados abaixo representam a temporada ativa para o
          racha <span className="text-yellow-300">{slug ?? "selecionado"}</span>.
        </section>

        <section className="mt-8 px-4">
          <div
            className="w-full overflow-x-auto pb-8"
            style={{
              scrollbarColor: "#2a2a2a #111",
              scrollbarWidth: "thin",
            }}
            tabIndex={0}
            aria-label="Tabela de classificação dos times, role lateralmente para ver todas as colunas"
          >
            <table className="w-full min-w-[640px] text-xs sm:text-sm border border-gray-800 bg-[#181818] rounded-xl overflow-hidden">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-right text-yellow-300 text-base">Pontos</th>
                  <th className="p-2 text-right">Jogos</th>
                  <th className="p-2 text-right">Vitórias</th>
                  <th className="p-2 text-right">Empates</th>
                  <th className="p-2 text-right">Derrotas</th>
                  <th className="p-2 text-right">Aproveitamento</th>
                </tr>
              </thead>
              {renderTabela()}
            </table>
          </div>
        </section>

        <section className="px-4 max-w-3xl mx-auto text-sm text-gray-400 flex items-start gap-3">
          <FaInfoCircle className="mt-1 text-yellow-300" aria-hidden="true" />
          <p>
            Os endpoints de agregação por quadrimestre, ano e histórico completo estão em
            desenvolvimento no backend. Assim que estiverem disponíveis, este seletor de período
            passará a alterar a tabela automaticamente e publicar cada variação no site público.
          </p>
        </section>
      </main>
    </>
  );
}
