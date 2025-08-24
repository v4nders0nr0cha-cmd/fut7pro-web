// src/app/admin/relatorios/page.tsx
"use client";

import Head from "next/head";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  FaChartLine,
  FaUserCheck,
  FaUsers,
  FaEye,
  FaClock,
  FaArrowRight,
  FaCamera,
  FaShareAlt,
} from "react-icons/fa";

const PERIODOS = [
  { label: "Hoje", value: "hoje" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mês", value: "mes" },
  { label: "Este Ano", value: "ano" },
  { label: "Sempre", value: "all" },
] as const;

const MOCKS = {
  hoje: { acessos: 52, jogadores: 17, engajamento: 34, tempo: "5m 41s" },
  semana: { acessos: 378, jogadores: 39, engajamento: 113, tempo: "7m 21s" },
  mes: { acessos: 1402, jogadores: 52, engajamento: 488, tempo: "8m 12s" },
  ano: { acessos: 17740, jogadores: 86, engajamento: 4102, tempo: "7m 47s" },
  all: { acessos: 18844, jogadores: 94, engajamento: 4388, tempo: "7m 50s" },
};

type PeriodoType = (typeof PERIODOS)[number]["value"];
type MetricsType = (typeof MOCKS)[PeriodoType];

function compartilharRelatorio(periodo: PeriodoType) {
  const label = PERIODOS.find((p) => p.value === periodo)?.label || periodo;
  const metrics = MOCKS[periodo];
  const texto = `Relatório de Engajamento Fut7Pro - ${label}\n\nAcessos: ${metrics.acessos}\nJogadores: ${metrics.jogadores}\nEngajamento: ${metrics.engajamento}\nTempo médio: ${metrics.tempo}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator
      .share({
        title: "Relatório de Engajamento",
        text: texto,
      })
      .catch(() => {});
  } else {
    alert("Seu navegador não suporta compartilhamento direto.");
  }
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<PeriodoType>("semana");
  const metrics = MOCKS[periodo];
  const relatorioRef = useRef<HTMLDivElement>(null);

  async function baixarImagemRelatorio() {
    if (!relatorioRef.current) return;
    const canvas = await html2canvas(relatorioRef.current, {
      useCORS: true,
      backgroundColor: "#181b20",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `relatorio-engajamento-${periodo}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <>
      <Head>
        <title>Relatórios de Engajamento | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Visualize métricas detalhadas do engajamento do seu racha: acessos, jogadores, visualizações e tempo médio. Painel profissional do Fut7Pro."
        />
        <meta
          name="keywords"
          content="relatórios racha, engajamento fut7, métricas futebol, dashboard fut7pro, analytics racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-3xl text-cyan-400" />
              <h1 className="text-2xl font-bold text-yellow-400 md:text-3xl">
                Relatórios de Engajamento
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={baixarImagemRelatorio}
                className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-cyan-700"
              >
                <FaCamera /> Baixar Relatório
              </button>
              <button
                onClick={() => compartilharRelatorio(periodo)}
                className="flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow transition hover:bg-yellow-500"
              >
                <FaShareAlt /> Compartilhar
              </button>
            </div>
          </div>

          <div
            ref={relatorioRef}
            className="rounded-2xl bg-[#181b20] p-4 shadow-lg"
          >
            <p className="mb-8 text-gray-300">
              Acompanhe as principais métricas do seu racha: acessos,
              engajamento, tempo médio e movimentações.
            </p>

            <div className="mb-8 flex flex-wrap gap-2">
              {PERIODOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    periodo === p.value
                      ? "border-cyan-600 bg-cyan-500 text-white"
                      : "border-[#23272f] bg-[#181b20] text-gray-300 hover:bg-cyan-900"
                  } transition`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center rounded-xl bg-[#21272c] p-6 shadow">
                <FaEye className="mb-1 text-2xl text-cyan-300" />
                <div className="text-2xl font-bold text-white">
                  {metrics.acessos}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">
                  Acessos
                </div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-[#21272c] p-6 shadow">
                <FaUsers className="mb-1 text-2xl text-yellow-400" />
                <div className="text-2xl font-bold text-white">
                  {metrics.jogadores}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">
                  Jogadores únicos
                </div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-[#21272c] p-6 shadow">
                <FaUserCheck className="mb-1 text-2xl text-green-400" />
                <div className="text-2xl font-bold text-white">
                  {metrics.engajamento}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">
                  Engajamentos
                </div>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-[#21272c] p-6 shadow">
                <FaClock className="mb-1 text-2xl text-cyan-200" />
                <div className="text-2xl font-bold text-white">
                  {metrics.tempo}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">
                  Tempo médio
                </div>
              </div>
            </div>

            <div className="mb-10 rounded-xl bg-[#23272F] p-6 shadow">
              <div className="mb-4 flex items-center">
                <FaChartLine className="mr-2 text-cyan-400" />
                <span className="font-bold text-white">
                  Evolução do Engajamento (
                  {PERIODOS.find((p) => p.value === periodo)?.label})
                </span>
              </div>
              <div className="flex h-48 w-full items-center justify-center rounded-lg bg-[#181B20] text-gray-500">
                <span className="text-lg font-semibold opacity-60">
                  [GRÁFICO DE ENG. AQUI]
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#23272F] p-6 shadow">
              <div className="mb-4 flex items-center">
                <FaArrowRight className="mr-2 text-yellow-400" />
                <span className="font-bold text-white">
                  Movimentações Recentes
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#23272F] text-left text-gray-400">
                      <th className="px-3 py-2">Data</th>
                      <th className="px-3 py-2">Evento</th>
                      <th className="px-3 py-2">Jogador</th>
                      <th className="px-3 py-2">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#181B20]">
                      <td className="px-3 py-2 text-gray-300">06/07/2025</td>
                      <td className="px-3 py-2 font-semibold text-cyan-400">
                        Acesso ao painel
                      </td>
                      <td className="px-3 py-2 text-white">Matheus Silva</td>
                      <td className="px-3 py-2 text-gray-400">
                        Mobile - 7m31s
                      </td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="px-3 py-2 text-gray-300">06/07/2025</td>
                      <td className="px-3 py-2 font-semibold text-yellow-400">
                        Ranking acessado
                      </td>
                      <td className="px-3 py-2 text-white">Lucas Rocha</td>
                      <td className="px-3 py-2 text-gray-400">
                        Desktop - 3m45s
                      </td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="px-3 py-2 text-gray-300">05/07/2025</td>
                      <td className="px-3 py-2 font-semibold text-green-400">
                        Perfil visualizado
                      </td>
                      <td className="px-3 py-2 text-white">Pedro Alves</td>
                      <td className="px-3 py-2 text-gray-400">
                        Mobile - 1m58s
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-gray-300">05/07/2025</td>
                      <td className="px-3 py-2 font-semibold text-cyan-400">
                        Acesso ao painel
                      </td>
                      <td className="px-3 py-2 text-white">Carlos Freitas</td>
                      <td className="px-3 py-2 text-gray-400">
                        Desktop - 6m12s
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
