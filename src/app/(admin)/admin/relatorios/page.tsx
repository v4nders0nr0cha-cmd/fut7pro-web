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

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 bg-fundo min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-cyan-400 text-3xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                Relatórios de Engajamento
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={baixarImagemRelatorio}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow transition"
              >
                <FaCamera /> Baixar Relatório
              </button>
              <button
                onClick={() => compartilharRelatorio(periodo)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow transition"
              >
                <FaShareAlt /> Compartilhar
              </button>
            </div>
          </div>

          <div ref={relatorioRef} className="bg-[#181b20] p-4 rounded-2xl shadow-lg">
            <p className="text-gray-300 mb-8">
              Acompanhe as principais métricas do seu racha: acessos, engajamento, tempo médio e
              movimentações.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {PERIODOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm border ${
                    periodo === p.value
                      ? "bg-cyan-500 text-white border-cyan-600"
                      : "bg-[#181b20] text-gray-300 border-[#23272f] hover:bg-cyan-900"
                  } transition`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaEye className="text-cyan-300 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.acessos}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Acessos</div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUsers className="text-yellow-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.jogadores}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Jogadores únicos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUserCheck className="text-green-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.engajamento}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Engajamentos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaClock className="text-cyan-200 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.tempo}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Tempo médio
                </div>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-cyan-400 mr-2" />
                <span className="text-white font-bold">
                  Evolução do Engajamento ({PERIODOS.find((p) => p.value === periodo)?.label})
                </span>
              </div>
              <div className="w-full h-48 flex items-center justify-center text-gray-500 bg-[#181B20] rounded-lg">
                <span className="text-lg font-semibold opacity-60">[GRÁFICO DE ENG. AQUI]</span>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6">
              <div className="flex items-center mb-4">
                <FaArrowRight className="text-yellow-400 mr-2" />
                <span className="text-white font-bold">Movimentações Recentes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-[#23272F]">
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Evento</th>
                      <th className="py-2 px-3">Jogador</th>
                      <th className="py-2 px-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">06/07/2025</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">Acesso ao painel</td>
                      <td className="py-2 px-3 text-white">Matheus Silva</td>
                      <td className="py-2 px-3 text-gray-400">Mobile - 7m31s</td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">06/07/2025</td>
                      <td className="py-2 px-3 text-yellow-400 font-semibold">Ranking acessado</td>
                      <td className="py-2 px-3 text-white">Lucas Rocha</td>
                      <td className="py-2 px-3 text-gray-400">Desktop - 3m45s</td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">05/07/2025</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">Perfil visualizado</td>
                      <td className="py-2 px-3 text-white">Pedro Alves</td>
                      <td className="py-2 px-3 text-gray-400">Mobile - 1m58s</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-gray-300">05/07/2025</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">Acesso ao painel</td>
                      <td className="py-2 px-3 text-white">Carlos Freitas</td>
                      <td className="py-2 px-3 text-gray-400">Desktop - 6m12s</td>
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
