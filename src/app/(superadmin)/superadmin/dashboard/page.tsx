// src/app/superadmin/dashboard/page.tsx

"use client";

import Head from "next/head";
import useSWR from "swr";
import {
  FaUserShield,
  FaUsers,
  FaMoneyBillWave,
  FaGift,
  FaTimesCircle,
  FaChartBar,
  FaBell,
} from "react-icons/fa";
import { MdOutlineSportsSoccer } from "react-icons/md";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useBranding } from "@/hooks/useBranding";

const DynamicChart = dynamic(() => import("@/components/superadmin/DashboardChart"), {
  ssr: false,
});

type DashboardResponse = {
  userCount: number;
  tenantCount: number;
  matchCount: number;
  lastUpdated?: string;
};

type FinanceResumo = {
  receitaTotal: number;
  mrr: number;
  arr: number;
  ticketMedio: number;
  churn: number;
  ativos: number;
  inadimplentes: number;
};

type FinanceRacha = {
  id: string;
  nome: string;
  slug: string;
  presidente: string;
  plano: string;
  status: string;
  valor: number;
  vencimento: string | null;
  contato?: string | null;
};

type FinanceOverview = {
  resumo: FinanceResumo;
  porPlano: Array<{
    key: string;
    nome: string;
    tipo: string;
    ativos: number;
    receita: number;
    inadimplentes: number;
    vencimentos: number;
  }>;
  graficoReceita: Array<{ mes: string; receita: number }>;
  rachas: FinanceRacha[];
  inadimplentes: FinanceRacha[];
};

type SystemStats = { environment?: string; apiVersion?: string; uptime?: number };

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

function formatCurrency(value?: number) {
  const safe = typeof value === "number" ? value : 0;
  return safe.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

export default function DashboardSuperAdminPage() {
  const { brandText } = useBranding({ scope: "superadmin" });
  const { data: dashboardData } = useSWR<DashboardResponse>("/api/superadmin/dashboard", fetcher);
  const { data: financeiro } = useSWR<FinanceOverview>("/api/superadmin/financeiro", fetcher);
  const { data: systemStats } = useSWR<SystemStats>("/api/superadmin/system-stats", fetcher);

  const trialsAtivos =
    financeiro?.rachas?.filter((r) => (r.status || "").toLowerCase().includes("trial"))?.length ??
    0;

  const chartData = useMemo(
    () =>
      (financeiro?.graficoReceita ?? []).map((item, idx) => ({
        month: item.mes || `M${idx + 1}`,
        receita: item.receita ?? 0,
      })),
    [financeiro?.graficoReceita]
  );

  const feed = useMemo(() => {
    const items: Array<{ type: string; text: string; date: string }> = [];
    const rachas = financeiro?.rachas ?? [];
    const inad = financeiro?.inadimplentes ?? [];

    rachas.slice(0, 4).forEach((r) => {
      items.push({
        type: "novo_racha",
        text: brandText(`Novo racha: ${r.nome} (${r.plano})`),
        date: formatDate(r.vencimento || dashboardData?.lastUpdated),
      });
    });

    inad.forEach((r) => {
      items.push({
        type: "inadimplente",
        text: brandText(`Racha em inadimplência: ${r.nome}`),
        date: formatDate(r.vencimento || dashboardData?.lastUpdated),
      });
    });

    if (!items.length) {
      items.push({
        type: "status",
        text: brandText("Nenhuma atividade recente encontrada."),
        date: formatDate(dashboardData?.lastUpdated),
      });
    }

    return items.slice(0, 6);
  }, [brandText, dashboardData?.lastUpdated, financeiro?.inadimplentes, financeiro?.rachas]);

  const kpis = [
    {
      title: "Rachas Ativos",
      value: financeiro?.resumo?.ativos ?? 0,
      icon: <MdOutlineSportsSoccer size={34} />,
      desc: "Tenants ativos",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      title: "Admins/Presidentes",
      value: dashboardData?.userCount ?? 0,
      icon: <FaUserShield size={34} />,
      desc: "Total de usuários",
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Partidas Registradas",
      value: dashboardData?.matchCount ?? 0,
      icon: <FaUsers size={34} />,
      desc: "Jogos contabilizados",
      color: "from-green-400 to-green-600",
    },
    {
      title: "Receita Total",
      value: formatCurrency(financeiro?.resumo?.receitaTotal),
      icon: <FaMoneyBillWave size={34} />,
      desc: "Faturamento consolidado",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Trials Ativos",
      value: trialsAtivos,
      icon: <FaGift size={34} />,
      desc: "Assinaturas em trial",
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Inadimplentes",
      value: financeiro?.resumo?.inadimplentes ?? 0,
      icon: <FaTimesCircle size={34} />,
      desc: "Ações prioritárias",
      color: "from-red-400 to-red-600",
    },
  ];

  const title = brandText("Dashboard Fut7Pro SaaS - Painel SuperAdmin");
  const description = brandText(
    "Painel de controle SaaS Fut7Pro: visualize KPIs, faturamento, atividades recentes e dados globais dos rachas da plataforma. Tudo para gestão de vendas, finanças e operações Fut7Pro SaaS."
  );
  const keywords = brandText(
    "dashboard fut7pro, painel superadmin, saas futebol, gestão de racha, estatísticas, financeiro fut7, plataforma racha, futebol amador"
  );

  const alertas = [
    {
      text: brandText(`${financeiro?.resumo?.inadimplentes ?? 0} racha(s) inadimplente(s)`),
      color: "text-red-400",
      icon: <FaTimesCircle />,
    },
    {
      text: brandText(`${trialsAtivos} trial(s) ativos no momento`),
      color: "text-purple-400",
      icon: <FaGift />,
    },
    {
      text: brandText(
        `Ambiente ${systemStats?.environment ?? "desconhecido"} • versão ${
          systemStats?.apiVersion ?? "N/D"
        }`
      ),
      color: "text-blue-300",
      icon: <FaChartBar />,
    },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>
      <main className="w-full min-h-screen bg-[#101826] px-2 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-center md:text-left">
              {brandText("Dashboard Fut7Pro SaaS")}
            </h1>
            <p className="text-zinc-400 text-base text-center md:text-left">
              {brandText(
                "Visão geral do ecossistema Fut7Pro: vendas, clubes, admins e status financeiro global."
              )}
            </p>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <a
              href="/superadmin/financeiro"
              className="flex items-center gap-2 bg-zinc-900 text-white font-semibold rounded-xl px-4 py-2 shadow hover:scale-105 transition"
            >
              <FaChartBar /> {brandText("Ir para Financeiro")}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className={`rounded-xl p-4 flex flex-col items-center bg-gradient-to-tr ${kpi.color} shadow-lg`}
            >
              <div className="mb-2">{kpi.icon}</div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-white">{kpi.title}</div>
              <span className="text-xs text-zinc-100 opacity-80 mt-1">{kpi.desc}</span>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">
            {brandText("Faturamento dos últimos 6 meses")}
          </h2>
          <DynamicChart data={chartData} />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Atividades Recentes</h2>
            <ul className="space-y-2">
              {feed.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-200 text-sm">
                  <FaBell className="text-yellow-400" aria-label="Notificação" />
                  <span>{item.text}</span>
                  <span className="ml-auto text-zinc-400 text-xs">{item.date}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white mb-2">Alertas & Próximos Passos</h2>
            <ul className="space-y-2">
              {alertas.map((alerta, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 text-sm font-semibold ${alerta.color}`}
                >
                  {alerta.icon} {alerta.text}
                  <span className="ml-auto">
                    <a href="/superadmin/financeiro" className="underline text-zinc-100">
                      Ver
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
