// src/app/superadmin/dashboard/page.tsx

"use client";

import Head from "next/head";
import {
  FaArrowUp,
  FaArrowDown,
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

// Gráfico dinâmico
const DynamicChart = dynamic(() => import("@/components/superadmin/DashboardChart"), {
  ssr: false,
});

const KPIS = [
  {
    title: "Rachas Ativos",
    value: 14,
    icon: <MdOutlineSportsSoccer size={34} />,
    change: "+6%",
    changeType: "up",
    desc: "Comparado ao mês anterior",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Admins/Presidentes",
    value: 9,
    icon: <FaUserShield size={34} />,
    change: "+1%",
    changeType: "up",
    desc: "Novos presidentes",
    color: "from-blue-400 to-blue-600",
  },
  {
    title: "Atletas",
    value: 312,
    icon: <FaUsers size={34} />,
    change: "+12%",
    changeType: "up",
    desc: "Novos atletas",
    color: "from-green-400 to-green-600",
  },
  {
    title: "Receita (R$)",
    value: "7.430,00",
    icon: <FaMoneyBillWave size={34} />,
    change: "+8%",
    changeType: "up",
    desc: "Receita total mês",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    title: "Trial Ativos",
    value: 3,
    icon: <FaGift size={34} />,
    change: "-2",
    changeType: "down",
    desc: "Trials vencendo",
    color: "from-purple-400 to-purple-600",
  },
  {
    title: "Inadimplentes",
    value: 1,
    icon: <FaTimesCircle size={34} />,
    change: "+1",
    changeType: "up",
    desc: "Novos inadimplentes",
    color: "from-red-400 to-red-600",
  },
];

// Mock feed atividades
const FEED = [
  { type: "novo_racha", text: "Novo racha cadastrado: Ponte Preta", date: "15/06/2025 14:40" },
  { type: "pagamento", text: "Recebido R$ 500 de Racha Galáticos", date: "14/06/2025 09:32" },
  { type: "trial", text: "Trial convertido: Racha Real Matismo", date: "13/06/2025 12:11" },
  {
    type: "inadimplente",
    text: "Racha Bola na Rede entrou em inadimplência",
    date: "12/06/2025 16:55",
  },
];

export default function DashboardSuperAdminPage() {
  // SEO
  const title = "Dashboard Fut7Pro SaaS – Painel SuperAdmin";
  const description =
    "Painel de controle SaaS Fut7Pro: visualize KPIs, faturamento, atividades recentes e dados globais dos rachas da plataforma. Tudo para gestão de vendas, finanças e operações Fut7Pro SaaS.";
  const keywords =
    "dashboard fut7pro, painel superadmin, saas futebol, gestão de racha, estatísticas, financeiro fut7, plataforma racha, futebol amador";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>
      <main className="w-full min-h-screen bg-[#101826] px-2 md:px-8 py-6">
        {/* Título centralizado e botão exportação */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-center md:text-left">
              Dashboard Fut7Pro SaaS
            </h1>
            <p className="text-zinc-400 text-base text-center md:text-left">
              Visão geral do ecossistema Fut7Pro: vendas, clubes, admins e status financeiro global.
            </p>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <button className="flex items-center gap-2 bg-zinc-900 text-white font-semibold rounded-xl px-4 py-2 shadow hover:scale-105 transition">
              <FaChartBar /> Exportar Relatório
            </button>
          </div>
        </div>

        {/* Cards KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {KPIS.map((kpi) => (
            <div
              key={kpi.title}
              className={`rounded-xl p-4 flex flex-col items-center bg-gradient-to-tr ${kpi.color} shadow-lg`}
            >
              <div className="mb-2">{kpi.icon}</div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-white">{kpi.title}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {kpi.changeType === "up" ? (
                  <FaArrowUp className="text-green-300" />
                ) : (
                  <FaArrowDown className="text-red-300" />
                )}
                <span className={kpi.changeType === "up" ? "text-green-300" : "text-red-300"}>
                  {kpi.change}
                </span>
              </div>
              <span className="text-xs text-zinc-100 opacity-80 mt-1">{kpi.desc}</span>
              <button className="mt-2 px-3 py-1 text-xs bg-white/10 rounded hover:bg-white/20 transition text-white">
                Ver detalhes
              </button>
            </div>
          ))}
        </div>

        {/* Gráfico Faturamento */}
        <section className="mb-8 rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">
            Faturamento dos Últimos 6 Meses
          </h2>
          <DynamicChart />
        </section>

        {/* Feed e Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feed Atividades */}
          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Atividades Recentes</h2>
            <ul className="space-y-2">
              {FEED.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-200 text-sm">
                  <FaBell className="text-yellow-400" aria-label="Notificação" />
                  <span>{item.text}</span>
                  <span className="ml-auto text-zinc-400 text-xs">{item.date}</span>
                </li>
              ))}
            </ul>
          </section>
          {/* Alertas e Próximos Passos */}
          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white mb-2">Alertas & Próximos Passos</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-red-400 text-sm font-bold">
                <FaTimesCircle /> 1 racha inadimplente!{" "}
                <span className="ml-auto">
                  <a href="#" className="underline text-zinc-100">
                    Ver detalhes
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2 text-purple-400 text-sm">
                <FaGift /> 2 trials vencendo em 2 dias{" "}
                <span className="ml-auto">
                  <a href="#" className="underline text-zinc-100">
                    Renovar trials
                  </a>
                </span>
              </li>
              {/* Exemplo para futuros alertas globais:
                            <li className="flex items-center gap-2 text-blue-400 text-sm">
                                <FaBell /> 1 ticket de suporte pendente{" "}
                                <span className="ml-auto">
                                    <a href="#" className="underline text-zinc-100">
                                        Ver suporte
                                    </a>
                                </span>
                            </li>
                            */}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
