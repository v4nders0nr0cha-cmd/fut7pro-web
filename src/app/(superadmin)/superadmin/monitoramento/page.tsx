"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaCloud,
  FaDatabase,
  FaCreditCard,
  FaEnvelope,
  FaBell,
  FaFileExport,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

const SERVICOS = [
  {
    nome: "API Fut7Pro",
    icon: <FaCloud size={32} />,
    status: "online",
    uptime: 99.99,
    ultimaQueda: "13/06/2025",
    sla: "99.99%",
    badge: "Excelente",
    detalhes:
      "Responsável por toda integração do sistema, login, estatísticas e automações.",
  },
  {
    nome: "Banco de Dados",
    icon: <FaDatabase size={32} />,
    status: "online",
    uptime: 99.96,
    ultimaQueda: "12/06/2025",
    sla: "99.95%",
    badge: "Estável",
    detalhes: "PostgreSQL e MongoDB para garantir performance e segurança.",
  },
  {
    nome: "Gateway Pagamento",
    icon: <FaCreditCard size={32} />,
    status: "offline",
    uptime: 99.5,
    ultimaQueda: "15/06/2025",
    sla: "99.5%",
    badge: "Instável",
    detalhes: "Processa mensalidades e cobranças automáticas dos rachas.",
  },
  {
    nome: "E-mail / Notificações",
    icon: <FaEnvelope size={32} />,
    status: "online",
    uptime: 99.9,
    ultimaQueda: "05/06/2025",
    sla: "99.9%",
    badge: "Operacional",
    detalhes:
      "Envio de notificações automáticas, alertas de cobrança, boas-vindas.",
  },
  {
    nome: "Push & Storage",
    icon: <FaBell size={32} />,
    status: "online",
    uptime: 99.98,
    ultimaQueda: "10/06/2025",
    sla: "99.98%",
    badge: "Estável",
    detalhes: "Armazena fotos, logos, avatares e envia notificações push.",
  },
];

// Histórico mockado para demo
const HISTORICO = [
  {
    data: "15/06/2025",
    tipo: "offline",
    servico: "Gateway Pagamento",
    descricao: "Ficou offline por 7 minutos.",
    cor: "text-red-400",
  },
  {
    data: "13/06/2025",
    tipo: "warning",
    servico: "API Fut7Pro",
    descricao: "Latência acima do normal (pico de acessos).",
    cor: "text-yellow-400",
  },
  {
    data: "12/06/2025",
    tipo: "offline",
    servico: "Banco de Dados",
    descricao: "Queda breve durante atualização.",
    cor: "text-red-400",
  },
  {
    data: "10/06/2025",
    tipo: "online",
    servico: "Push & Storage",
    descricao: "100% operacional após ajuste de rota CDN.",
    cor: "text-green-400",
  },
];

export default function MonitoramentoPage() {
  // Filtro por status ou serviço se quiser
  const [search, setSearch] = useState("");

  return (
    <>
      <Head>
        <title>Monitoramento & Uptime – Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Acompanhe em tempo real o status da API, banco de dados, pagamentos, notificações e storage do Fut7Pro. Monitoramento de uptime, histórico de incidentes e SLA da plataforma líder em futebol 7/SaaS."
        />
        <meta
          name="keywords"
          content="monitoramento, uptime, status API, SaaS Fut7, futebol 7, plataforma, status Fut7Pro, banco de dados, pagamentos, notificações"
        />
      </Head>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-10">
        {/* Título e Onboarding */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-white">
              Monitoramento & Uptime
            </h1>
            <p className="max-w-xl text-gray-300">
              Acompanhe o status dos principais serviços do Fut7Pro. Plataforma
              monitorada 24h para garantir máxima disponibilidade para seus
              rachas.
            </p>
          </div>
          <div>
            <button className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2 font-bold text-black shadow-lg transition hover:bg-yellow-600">
              <FaFileExport /> Exportar Histórico
            </button>
          </div>
        </div>

        {/* Painel de Serviços */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICOS.map((s, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border-2 bg-[#181c27] p-6 shadow-lg ${
                s.status === "online"
                  ? "border-green-400"
                  : s.status === "offline"
                    ? "border-red-400"
                    : "border-yellow-400"
              } flex min-h-[170px] flex-col gap-2`}
            >
              <div className="flex items-center gap-3">
                {s.icon}
                <span className="text-lg font-bold text-white">{s.nome}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-1 text-xs ${
                    s.status === "online"
                      ? "bg-green-500 text-black"
                      : s.status === "offline"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-black"
                  } font-semibold shadow`}
                >
                  {s.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-5 text-sm text-gray-300">
                <span>
                  Uptime: <b>{s.uptime}%</b>
                </span>
                <span>
                  SLA: <b>{s.sla}</b>
                </span>
                <span>
                  Última queda: <b>{s.ultimaQueda}</b>
                </span>
              </div>
              <div className="text-xs italic text-gray-400">{s.detalhes}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold text-yellow-300">
                  {s.badge}
                </span>
                {s.status === "offline" && (
                  <span className="ml-2 flex items-center gap-1 text-red-400">
                    <FaClock /> Em investigação
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alertas & Histórico */}
        <div className="mt-4">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-yellow-400">
            <FaInfoCircle /> Histórico & Alertas Recentes
          </h2>
          <div className="rounded-2xl bg-[#181c27] p-4 shadow-lg">
            <ul className="space-y-2">
              {HISTORICO.map((h, i) => (
                <li
                  key={i}
                  className={`flex flex-col gap-2 md:flex-row md:items-center`}
                >
                  <span className="min-w-[110px] font-mono text-gray-400">
                    {h.data}
                  </span>
                  <span className={`font-bold ${h.cor}`}>{h.servico}</span>
                  <span className="text-sm text-gray-300">{h.descricao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Monitoramento */}
        <div className="mt-6 rounded-2xl bg-[#181c27] p-4 shadow-md">
          <h3 className="text-md mb-2 font-bold text-white">
            O que monitoramos?
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-sm text-gray-300">
            <li>API principal Fut7Pro e gateways de login</li>
            <li>Bancos de dados SQL & NoSQL</li>
            <li>Serviço de pagamentos automáticos</li>
            <li>Envio de e-mails e notificações</li>
            <li>Serviço de storage (imagens, backups)</li>
            <li>Latência, uptime, status de incidentes</li>
            <li>Alertas automáticos em caso de falha</li>
          </ul>
        </div>
      </div>
    </>
  );
}
