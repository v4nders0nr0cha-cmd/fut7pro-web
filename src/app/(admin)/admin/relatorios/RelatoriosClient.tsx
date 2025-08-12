"use client";

import { useState } from "react";
import {
  FaChartLine,
  FaUserCheck,
  FaUsers,
  FaEye,
  FaClock,
  FaArrowRight,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa";
// PDFMake para download profissional de relatórios
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PERIODOS = [
  { label: "Hoje", value: "hoje" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mês", value: "mes" },
  { label: "Este Ano", value: "ano" },
  { label: "Sempre", value: "all" },
];

const MOCKS = {
  hoje: { acessos: 52, jogadores: 17, engajamento: 34, tempo: "5m 41s" },
  semana: { acessos: 378, jogadores: 39, engajamento: 113, tempo: "7m 21s" },
  mes: { acessos: 1402, jogadores: 52, engajamento: 488, tempo: "8m 12s" },
  ano: { acessos: 17740, jogadores: 86, engajamento: 4102, tempo: "7m 47s" },
  all: { acessos: 18844, jogadores: 94, engajamento: 4388, tempo: "7m 50s" },
};

// Função para gerar PDF profissional
function baixarRelatorioPDF(periodo: string) {
  const metrics = MOCKS[periodo as keyof typeof MOCKS];
  const periodoLabel = PERIODOS.find((p) => p.value === periodo)?.label || periodo;
  const docDefinition = {
    content: [
      {
        columns: [
          { image: "logoFut7Pro", width: 60 },
          [
            {
              text: "Relatório de Engajamento",
              fontSize: 20,
              bold: true,
              color: "#ffdf38",
              margin: [10, 0, 0, 2],
            },
            {
              text: `Período: ${periodoLabel}`,
              fontSize: 12,
              color: "#5ad1fc",
              margin: [10, 0, 0, 10],
            },
          ],
        ],
      },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1, lineColor: "#ffdf38" },
        ],
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [{ text: "Acessos ao Sistema", bold: true }, String(metrics.acessos)],
            [{ text: "Jogadores Únicos", bold: true }, String(metrics.jogadores)],
            [{ text: "Engajamentos", bold: true }, String(metrics.engajamento)],
            [{ text: "Tempo Médio de Sessão", bold: true }, metrics.tempo],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10],
      },
      {
        text: "Este relatório pode ser apresentado a patrocinadores como prova do engajamento e da força do seu grupo no Fut7Pro.",
        margin: [0, 16, 0, 12],
        fontSize: 10,
        color: "#666",
      },
      {
        text: "Dashboard Fut7Pro – O melhor sistema para racha do Brasil",
        style: "footer",
      },
    ],
    images: {
      // Logo inline como DataURL (troque pelo seu base64 se quiser outra logo!)
      logoFut7Pro:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAgVBMVEX///8AAADz8/Pb29vZ2dnT09Oc3NwSEhKlpaXk5ORoaGiOjo4fHx/u7u6UlJSPj49TU1NsbGxwcHBiYmKZmZlsbGyCgoKhoaFRUVFycnJiYmK0tLTo6OhKSkpnZ2eQkJBvb28uLi5dXV2mpqbDw8NCQkKZmZnQ0ND39/ft+XpsAAAB5klEQVRoge2W2XLDIAyGVR5jOBiYbtkod///z7WBSSwNn3pqD6TbqlJJjHY/yXyCB7pna/7CEuFu6TqN8RMY1TcVkg1Gkr8VhWyu8YF4XLn6LNakT8FL1DAUn1TkNClKe1ZsRGU0WkAyvIMlTrJw1THqUmA2p2R5oEwlIGYCGqIwckzIm8keQAAI6zDFBxEcG30AnzSR6v5Ds8lAKuKh9URjQjcBv2nqTxZyj3e4KL3EX5oQ8oQKf/W+jssZYuGshHdCTxw5Fj1D+OqEelHzsI3VRXsgFJ/vud4cHoGLcchBrBEr4iW6doR4w9U0yA9eKMrsBy8IIm4VQKp4YyWyGbQLG2e0Hgnw7MIfI7gO9iQkNwQfd4K48ySaQphzZrfCFFCnRK5E1ZAEq25w7eIX/wB1NYDHvWZnSAAAAAElFTkSuQmCC",
    },
    styles: {
      footer: { fontSize: 9, color: "#888", alignment: "center", margin: [0, 20, 0, 0] },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };
  pdfMake.createPdf(docDefinition).download(`relatorio-engajamento-${periodo}.pdf`);
}

// Compartilhamento segue igual
function compartilharRelatorio(periodo: string) {
  const texto = `Relatório de Engajamento Fut7Pro - ${PERIODOS.find((p) => p.value === periodo)?.label}\n\nAcessos: ${MOCKS[periodo as keyof typeof MOCKS].acessos}\nJogadores: ${MOCKS[periodo as keyof typeof MOCKS].jogadores}\nEngajamento: ${MOCKS[periodo as keyof typeof MOCKS].engajamento}\nTempo médio: ${MOCKS[periodo as keyof typeof MOCKS].tempo}`;
  if (navigator.share) {
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

export default function RelatoriosClient() {
  const [periodo, setPeriodo] = useState<keyof typeof MOCKS>("semana");
  const metrics = MOCKS[periodo];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-cyan-400 text-3xl" />
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Relatórios de Engajamento
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => baixarRelatorioPDF(periodo)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow transition"
          >
            <FaDownload /> Baixar PDF Profissional
          </button>
          <button
            onClick={() => compartilharRelatorio(periodo)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow transition"
          >
            <FaShareAlt /> Compartilhar
          </button>
        </div>
      </div>
      <p className="text-gray-300 mb-8">
        Acompanhe as principais métricas do seu racha: acessos ao sistema, engajamento de jogadores,
        visualizações de página, tempo médio e muito mais!
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {PERIODOS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value as keyof typeof MOCKS)}
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
      {/* Cards de Métricas */}
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
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Engajamentos</div>
        </div>
        <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
          <FaClock className="text-cyan-200 text-2xl mb-1" />
          <div className="text-2xl font-bold text-white">{metrics.tempo}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Tempo médio</div>
        </div>
      </div>
      {/* Gráfico de Engajamento (placeholder) */}
      <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10 flex flex-col">
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
      {/* Tabela de Eventos Recentes */}
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
              {/* Mock, troque depois */}
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
  );
}
