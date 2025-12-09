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
  FaBullseye,
  FaDollarSign,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import type { AnalyticsPeriod } from "@/types/analytics";

const PERIODOS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Hoje", value: "day" },
  { label: "Esta Semana", value: "week" },
  { label: "Este Mês", value: "month" },
  { label: "Este Ano", value: "year" },
  { label: "Sempre", value: "all" },
];

function formatTempo(segundos: number | undefined) {
  if (!segundos || Number.isNaN(segundos)) return "-";
  const mins = Math.floor(segundos / 60);
  const secs = Math.max(0, Math.round(segundos % 60));
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<AnalyticsPeriod>("week");
  const relatorioRef = useRef<HTMLDivElement>(null);

  const { analytics, isLoading } = useAdminAnalytics({ period: periodo });

  const summary = analytics?.summary;
  const resumoCompat = summary
    ? {
        acessos: summary.visits,
        jogadores: summary.uniqueVisitors,
        engajamento: summary.engagements,
        tempo: formatTempo(summary.avgSessionSeconds),
      }
    : undefined;

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

  function compartilharRelatorio() {
    const label = PERIODOS.find((p) => p.value === periodo)?.label || periodo;
    const texto = resumoCompat
      ? `Relatório de Engajamento Fut7Pro - ${label}\n\nAcessos: ${resumoCompat.acessos}\nJogadores: ${resumoCompat.jogadores}\nEngajamento: ${resumoCompat.engajamento}\nTempo médio: ${resumoCompat.tempo}`
      : `Relatório de Engajamento Fut7Pro - ${label}\n\nDados indisponíveis no momento.`;
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
                onClick={compartilharRelatorio}
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
                <div className="text-2xl font-bold text-white">
                  {isLoading ? "-" : (summary?.visits ?? 0)}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Acessos</div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUsers className="text-yellow-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">
                  {isLoading ? "-" : (summary?.uniqueVisitors ?? 0)}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Jogadores únicos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUserCheck className="text-green-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">
                  {isLoading ? "-" : (summary?.engagements ?? 0)}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Engajamentos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaClock className="text-cyan-200 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">
                  {isLoading ? "-" : formatTempo(summary?.avgSessionSeconds)}
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Tempo médio
                </div>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10">
              <div className="flex items-center mb-4">
                <span className="text-white font-bold">Patrocinadores (KPIs)</span>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-5">
                <div className="bg-[#181B20] rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Impressões</div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? "-" : (analytics?.sponsors?.impressions ?? 0)}
                  </div>
                </div>
                <div className="bg-[#181B20] rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Cliques</div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? "-" : (analytics?.sponsors?.clicks ?? 0)}
                  </div>
                </div>
                <div className="bg-[#181B20] rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">CTR</div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading
                      ? "-"
                      : analytics?.sponsors
                        ? `${((analytics.sponsors.ctr ?? 0) * 100).toFixed(2)}%`
                        : "-"}
                  </div>
                </div>
                <div className="bg-[#181B20] rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">
                    Receita (estim.)
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading
                      ? "-"
                      : analytics?.sponsors?.revenue != null
                        ? `R$ ${analytics.sponsors.revenue.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                    ROI:{" "}
                    {isLoading
                      ? "-"
                      : analytics?.sponsors?.roi != null
                        ? `${((analytics.sponsors.roi ?? 0) * 100).toFixed(1)}%`
                        : "n/d"}
                  </div>
                </div>
                <div className="bg-[#181B20] rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide">
                    Custo (estim.)
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading
                      ? "-"
                      : analytics?.sponsors?.cost != null
                        ? `R$ ${analytics.sponsors.cost.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                    <FaDollarSign className="text-green-400" /> CPC/CPM
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10">
              <div className="flex items-center mb-4">
                <FaBullseye className="text-yellow-400 mr-2" />
                <span className="text-white font-bold">Patrocinadores (Impressões x Cliques)</span>
              </div>
              <div className="w-full h-64 text-gray-500 bg-[#181B20] rounded-lg px-2 py-3">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-lg font-semibold opacity-60">
                    Carregando série...
                  </div>
                ) : analytics?.sponsors?.series?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.sponsors.series}>
                      <defs>
                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #1f2937" }}
                        labelStyle={{ color: "#e5e7eb" }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        name="Impressões"
                        stroke="#22d3ee"
                        fillOpacity={1}
                        fill="url(#colorImp)"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        name="Cliques"
                        stroke="#fbbf24"
                        fillOpacity={1}
                        fill="url(#colorClick)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-semibold opacity-60">
                    Sem dados de patrocinadores no período
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-cyan-400 mr-2" />
                <span className="text-white font-bold">
                  Evolução do Engajamento ({PERIODOS.find((p) => p.value === periodo)?.label})
                </span>
              </div>
              <div className="w-full h-64 text-gray-500 bg-[#181B20] rounded-lg px-2 py-3">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-lg font-semibold opacity-60">
                    Carregando série...
                  </div>
                ) : analytics?.timeseries?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.timeseries}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #1f2937" }}
                        labelStyle={{ color: "#e5e7eb" }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        name="Visitas"
                        stroke="#22d3ee"
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                      />
                      <Area
                        type="monotone"
                        dataKey="uniqueVisitors"
                        name="Jogadores únicos"
                        stroke="#facc15"
                        fillOpacity={1}
                        fill="url(#colorUnique)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-semibold opacity-60">
                    Sem dados para o período
                  </div>
                )}
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
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="py-4 px-3 text-gray-400">
                          Carregando eventos...
                        </td>
                      </tr>
                    )}
                    {!isLoading && analytics?.events?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 px-3 text-gray-400">
                          Sem movimentações no período selecionado.
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      analytics?.events?.map((event) => (
                        <tr
                          key={`${event.timestamp}-${event.label}`}
                          className="border-b border-[#181B20]"
                        >
                          <td className="py-2 px-3 text-gray-300">
                            {new Date(event.timestamp).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-2 px-3 text-cyan-400 font-semibold">{event.type}</td>
                          <td className="py-2 px-3 text-white">{event.actor || "-"}</td>
                          <td className="py-2 px-3 text-gray-400">
                            {event.details || event.label}
                          </td>
                        </tr>
                      ))}
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
