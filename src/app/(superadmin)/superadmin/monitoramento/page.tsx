"use client";

import Head from "next/head";
import useSWR from "swr";
import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import { useBranding } from "@/hooks/useBranding";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

type ServiceStatus = {
  nome: string;
  status: "online" | "offline" | string;
  uptime?: number;
  ultimaQueda?: string;
  sla?: string;
  badge?: string;
  detalhes?: string;
  icon?: ReactNode;
};

type Incident = {
  data?: string;
  tipo?: string;
  servico?: string;
  descricao?: string;
  cor?: string;
};

const SERVICOS = [
  {
    nome: "API Fut7Pro",
    icon: <FaCloud size={32} />,
    status: "online",
    uptime: 99.99,
    ultimaQueda: "13/06/2025",
    sla: "99.99%",
    badge: "Excelente",
    detalhes: "Responsável por toda integração do sistema, login, estatísticas e automações.",
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
    detalhes: "Envio de notificações automáticas, alertas de cobrança, boas-vindas.",
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
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = useCallback((text: string) => text.replace(/fut7pro/gi, () => brand), [brand]);
  const { data: systemStats } = useSWR<{
    apiVersion: string;
    nodeVersion: string;
    uptime: number;
    memoryUsage?: Record<string, number>;
    environment?: string;
    services?: ServiceStatus[];
    incidents?: Incident[];
  }>("/api/superadmin/system-stats", fetcher);

  // Filtro por status ou serviço se quiser
  const [search, setSearch] = useState("");
  const uptimeHoras = useMemo(() => {
    if (!systemStats?.uptime) return "-";
    return `${(systemStats.uptime / 3600).toFixed(1)}h`;
  }, [systemStats?.uptime]);

  const servicosBase: ServiceStatus[] = systemStats?.services?.length
    ? systemStats.services
    : SERVICOS;
  const servicosBrand = useMemo(
    () =>
      servicosBase.map((s) => ({
        ...s,
        nome: brandText(s.nome),
        detalhes: s.detalhes ? brandText(s.detalhes) : s.detalhes,
      })),
    [brandText, servicosBase]
  );

  const iconByService = (nome?: string) => {
    const key = (nome || "").toLowerCase();
    if (key.includes("api")) return <FaCloud size={32} />;
    if (key.includes("banco") || key.includes("db")) return <FaDatabase size={32} />;
    if (key.includes("pagamento")) return <FaCreditCard size={32} />;
    if (key.includes("mail") || key.includes("email")) return <FaEnvelope size={32} />;
    if (key.includes("push") || key.includes("storage")) return <FaBell size={32} />;
    return <FaInfoCircle size={32} />;
  };

  const servicosRender = servicosBrand.map((s) => ({
    ...s,
    icon: s.icon ?? iconByService(s.nome),
    sla: s.sla || (s.status === "online" ? "99.9%" : s.sla),
    ultimaQueda: s.ultimaQueda || "-",
    uptime: s.uptime ?? undefined,
  }));

  const historicoBase: Incident[] = systemStats?.incidents?.length
    ? systemStats.incidents
    : HISTORICO;
  const historico = useMemo(
    () =>
      historicoBase.map((h) => ({
        ...h,
        servico: h.servico ? brandText(h.servico) : h.servico,
        descricao: h.descricao ? brandText(h.descricao) : h.descricao,
      })),
    [brandText, historicoBase]
  );

  return (
    <>
      <Head>
        <title>{brandText("Monitoramento & Uptime – Fut7Pro SuperAdmin")}</title>
        <meta
          name="description"
          content={brandText(
            "Acompanhe em tempo real o status da API, banco de dados, pagamentos, notificações e storage do Fut7Pro. Monitoramento de uptime, histórico de incidentes e SLA da plataforma líder em futebol 7/SaaS."
          )}
        />
        <meta
          name="keywords"
          content={brandText(
            "monitoramento, uptime, status API, SaaS Fut7, futebol 7, plataforma, status Fut7Pro, banco de dados, pagamentos, notificações"
          )}
        />
      </Head>
      <div className="flex flex-col gap-6 py-6 px-4 md:px-10 max-w-6xl mx-auto">
        {/* Status resumido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#181c27] p-4 shadow border border-green-500">
            <div className="text-sm text-gray-400">Versão API</div>
            <div className="text-xl font-bold text-white">{systemStats?.apiVersion ?? "-"}</div>
          </div>
          <div className="rounded-xl bg-[#181c27] p-4 shadow border border-blue-500">
            <div className="text-sm text-gray-400">Node</div>
            <div className="text-xl font-bold text-white">{systemStats?.nodeVersion ?? "-"}</div>
          </div>
          <div className="rounded-xl bg-[#181c27] p-4 shadow border border-yellow-500">
            <div className="text-sm text-gray-400">Uptime</div>
            <div className="text-xl font-bold text-white">{uptimeHoras}</div>
          </div>
          <div className="rounded-xl bg-[#181c27] p-4 shadow border border-purple-500">
            <div className="text-sm text-gray-400">Ambiente</div>
            <div className="text-xl font-bold text-white">{systemStats?.environment ?? "-"}</div>
          </div>
        </div>

        {/* Título e Onboarding */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Monitoramento & Uptime</h1>
            <p className="text-gray-300 max-w-xl">
              {brandText(
                "Acompanhe o status dos principais serviços do Fut7Pro. Plataforma monitorada 24h para garantir máxima disponibilidade para seus rachas."
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por serviço..."
              className="bg-[#181c27] border border-yellow-500/60 rounded-lg px-3 py-2 text-white"
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl px-5 py-2 flex items-center gap-2 shadow-lg font-bold transition">
              <FaFileExport /> Exportar Histórico
            </button>
          </div>
        </div>

        {/* Painel de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {servicosRender
            .filter(
              (s) =>
                s.nome.toLowerCase().includes(search.toLowerCase()) ||
                (s.detalhes || "").toLowerCase().includes(search.toLowerCase())
            )
            .map((s, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 shadow-lg bg-[#181c27] border-2 ${
                  s.status === "online"
                    ? "border-green-400"
                    : s.status === "offline"
                      ? "border-red-400"
                      : "border-yellow-400"
                } flex flex-col gap-2 min-h-[170px]`}
              >
                <div className="flex items-center gap-3">
                  {s.icon}
                  <span className="text-lg font-bold text-white">{s.nome}</span>
                  <span
                    className={`ml-auto text-xs px-2 py-1 rounded-full ${
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
                <div className="flex items-center text-gray-300 text-sm gap-5 mt-1">
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
                <div className="text-xs text-gray-400 italic">{s.detalhes}</div>
                <div className="flex items-center mt-2 gap-2">
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-yellow-300 font-semibold">
                    {s.badge}
                  </span>
                  {s.status === "offline" && (
                    <span className="ml-2 text-red-400 flex items-center gap-1">
                      <FaClock /> Em investigação
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Alertas & Histórico */}
        <div className="mt-4">
          <h2 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <FaInfoCircle /> Histórico & Alertas Recentes
          </h2>
          <div className="rounded-2xl bg-[#181c27] p-4 shadow-lg">
            <ul className="space-y-2">
              {historico.map((h, i) => (
                <li key={i} className={`flex flex-col md:flex-row md:items-center gap-2`}>
                  <span className="min-w-[110px] font-mono text-gray-400">{h.data ?? "-"}</span>
                  <span className={`font-bold ${h.cor ?? ""}`}>{h.servico ?? "Serviço"}</span>
                  <span className="text-sm text-gray-300">
                    {h.descricao ?? "Evento registrado."}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Monitoramento */}
        <div className="rounded-2xl bg-[#181c27] p-4 shadow-md mt-6">
          <h3 className="text-md font-bold text-white mb-2">O que monitoramos?</h3>
          <ul className="text-gray-300 text-sm list-disc ml-6 space-y-1">
            <li>{brandText("API principal Fut7Pro e gateways de login")}</li>
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
