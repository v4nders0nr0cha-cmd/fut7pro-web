"use client";

import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import KPI from "@/components/financeiro/KPI";
import CardPlano from "@/components/financeiro/CardPlano";
import TabelaRachas from "@/components/financeiro/TabelaRachas";
import ModalInadimplentes from "@/components/financeiro/ModalInadimplentes";
import type {
  Inadimplente,
  RachaDetalheResumido,
} from "@/components/financeiro/types";

const PLANS = [
  {
    key: "mensal_essencial",
    name: "Mensal Essencial",
    price: 150,
    freq: "mês",
  },
  {
    key: "mensal_marketing",
    name: "Mensal + Marketing",
    price: 280,
    freq: "mês",
  },
  { key: "anual_essencial", name: "Anual Essencial", price: 1500, freq: "ano" },
  {
    key: "anual_marketing",
    name: "Anual + Marketing",
    price: 2800,
    freq: "ano",
  },
];

const PLAN_COLORS = ["#32d657", "#4c6fff", "#ffbe30", "#ff7043"];

const MOCK_FINANCEIRO = {
  receitaTotal: 10860,
  mrr: 1380,
  arr: 10800,
  ticketMedio: 209.2,
  churn: 2.1,
  ativos: 12,
  inadimplentes: 2,
  porPlano: [
    {
      key: "mensal_essencial",
      ativos: 5,
      receita: 750,
      inadimplentes: 1,
      vencimentos: 2,
    },
    {
      key: "mensal_marketing",
      ativos: 2,
      receita: 360,
      inadimplentes: 0,
      vencimentos: 0,
    },
    {
      key: "anual_essencial",
      ativos: 4,
      receita: 6000,
      inadimplentes: 1,
      vencimentos: 1,
    },
    {
      key: "anual_marketing",
      ativos: 1,
      receita: 1800,
      inadimplentes: 0,
      vencimentos: 0,
    },
  ],
};

const MOCK_GRAFICO_RECEITA = [
  { mes: "Jan", receita: 1700 },
  { mes: "Fev", receita: 1550 },
  { mes: "Mar", receita: 1720 },
  { mes: "Abr", receita: 1810 },
  { mes: "Mai", receita: 2400 },
  { mes: "Jun", receita: 1680 },
  { mes: "Jul", receita: 2500 },
];

const MOCK_GRAFICO_PLANOS = PLANS.map((plan, i) => ({
  name: plan.name,
  value: MOCK_FINANCEIRO.porPlano[i]?.ativos ?? 0,
}));

const MOCK_RACHAS: RachaDetalheResumido[] = [
  {
    id: "1",
    racha: "Vila União",
    presidente: "João Silva",
    plano: "Mensal Essencial",
    status: "Pago",
    valor: 150,
    vencimento: "12/07/2025",
  },
  {
    id: "2",
    racha: "Galáticos",
    presidente: "Pedro Souza",
    plano: "Mensal + Marketing",
    status: "Em aberto",
    valor: 180,
    vencimento: "18/07/2025",
  },
  {
    id: "3",
    racha: "Real Matismo",
    presidente: "Paulo Lima",
    plano: "Anual Essencial",
    status: "Pago",
    valor: 1500,
    vencimento: "31/07/2025",
  },
  {
    id: "4",
    racha: "Racha Show",
    presidente: "Carlos Mendes",
    plano: "Anual + Marketing",
    status: "Pago",
    valor: 1800,
    vencimento: "02/08/2025",
  },
  {
    id: "5",
    racha: "Os Bons de Bola",
    presidente: "Rafael Silva",
    plano: "Mensal Essencial",
    status: "Em aberto",
    valor: 150,
    vencimento: "09/07/2025",
  },
];

const MOCK_INADIMPLENTES: Inadimplente[] = [
  {
    id: "2",
    racha: "Galáticos",
    presidente: "Pedro Souza",
    plano: "Mensal + Marketing",
    valor: 180,
    vencimento: "18/07/2025",
    contato: "5511999998888",
  },
  {
    id: "5",
    racha: "Os Bons de Bola",
    presidente: "Rafael Silva",
    plano: "Mensal Essencial",
    valor: 150,
    vencimento: "09/07/2025",
    contato: "rafael@email.com",
  },
];

type Status = "Pago" | "Em aberto" | "Trial" | "Cancelado";

export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState("30d");
  const [status, setStatus] = useState<Status | "all">("all");
  const [plano, setPlano] = useState("all");
  const [search, setSearch] = useState("");
  const [modalInadimplentes, setModalInadimplentes] = useState(false);

  const filteredRachas = MOCK_RACHAS.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (plano !== "all") {
      const planObj = PLANS.find((p) => p.key === plano);
      if (!planObj) return false;
      if (row.plano !== planObj.name) return false;
    }
    return (
      row.racha.toLowerCase().includes(search.toLowerCase()) ||
      row.presidente.toLowerCase().includes(search.toLowerCase())
    );
  });

  function exportCSV() {
    alert("Exportação CSV mockada! (implemente backend)");
  }
  function exportPDF() {
    alert("Exportação PDF mockada! (implemente backend)");
  }
  function exportXLSX() {
    alert("Exportação XLSX mockada! (implemente backend)");
  }

  return (
    <>
      <Head>
        <title>Painel Financeiro SaaS - Fut7Pro</title>
        <meta
          name="description"
          content="Controle financeiro SaaS do Fut7Pro: receitas, assinaturas, planos, inadimplência, gráficos e exportação. Gestão inteligente e moderna de rachas de futebol 7."
        />
        <meta
          name="keywords"
          content="financeiro, SaaS, fut7, dashboard, assinatura, racha, plataforma futebol, gestão financeira, planos, mensal, anual, marketing"
        />
      </Head>

      <main className="min-h-screen bg-zinc-900 px-2 pb-12 pt-6 sm:px-4 md:px-8">
        <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Painel Financeiro dos Rachas
        </h1>
        {/* Exportação e filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded bg-yellow-400 px-3 py-2 font-semibold text-black transition hover:bg-yellow-500"
          >
            <FaDownload /> Exportar CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 rounded bg-yellow-400 px-3 py-2 font-semibold text-black transition hover:bg-yellow-500"
          >
            <FaDownload /> Exportar PDF
          </button>
          <button
            onClick={exportXLSX}
            className="flex items-center gap-2 rounded bg-yellow-400 px-3 py-2 font-semibold text-black transition hover:bg-yellow-500"
          >
            <FaDownload /> Exportar XLSX
          </button>
          {/* Filtros */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="ml-2 rounded bg-zinc-800 px-2 py-1 text-white"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="ano">Ano atual</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | "all")}
            className="rounded bg-zinc-800 px-2 py-1 text-white"
          >
            <option value="all">Todos Status</option>
            <option value="Pago">Pago</option>
            <option value="Em aberto">Em aberto</option>
            <option value="Trial">Trial</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <select
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            className="rounded bg-zinc-800 px-2 py-1 text-white"
          >
            <option value="all">Todos Planos</option>
            {PLANS.map((plan) => (
              <option key={plan.key} value={plan.key}>
                {plan.name}
              </option>
            ))}
          </select>
          <div className="relative ml-auto w-full sm:w-auto">
            <FaSearch className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              className="w-full rounded bg-zinc-800 py-2 pl-10 pr-4 text-white sm:w-52"
              placeholder="Buscar racha ou presidente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* KPIs principais */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <KPI
            title="Receita Total (R$)"
            value={MOCK_FINANCEIRO.receitaTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            color="green"
          />
          <KPI
            title="Rachas Ativos Pagos"
            value={MOCK_FINANCEIRO.ativos}
            color="yellow"
          />
          <KPI
            title="Inadimplentes"
            value={
              <span
                className="cursor-pointer underline"
                title="Clique para ver detalhes dos inadimplentes"
                onClick={() => setModalInadimplentes(true)}
              >
                {MOCK_FINANCEIRO.inadimplentes}
              </span>
            }
            color="red"
            tooltip="Quantidade de rachas com pagamento em aberto no sistema. Clique para ver detalhes."
          />
          <KPI
            title="Churn Rate (%)"
            value={MOCK_FINANCEIRO.churn + "%"}
            color="blue"
            tooltip="Percentual de cancelamentos recentes em relação ao total de rachas ativos."
          />
        </div>

        {/* Cards por plano */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {MOCK_FINANCEIRO.porPlano.map((plan, idx) => (
            <CardPlano
              key={plan.key}
              nome={PLANS[idx]?.name ?? "Plano"}
              tipo={PLANS[idx]?.freq === "mês" ? "Mensal" : "Anual"}
              ativos={plan.ativos}
              receita={plan.receita}
              inadimplentes={plan.inadimplentes}
              vencimentos={plan.vencimentos}
              cor={PLAN_COLORS[idx] ?? "#32d657"} // Fallback padrão
              onClickInadimplentes={
                plan.inadimplentes > 0
                  ? () => setModalInadimplentes(true)
                  : undefined
              }
            />
          ))}
        </div>

        {/* Gráficos */}
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-zinc-800 p-4 shadow">
            <h2 className="mb-2 text-base font-semibold text-white">
              Evolução da Receita (R$)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MOCK_GRAFICO_RECEITA}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="mes" tick={{ fill: "#fff" }} />
                <YAxis tick={{ fill: "#fff" }} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="#32d657"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <PieTooltip />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col rounded-2xl bg-zinc-800 p-4 shadow">
            <h2 className="mb-2 text-base font-semibold text-white">
              Rachas Ativos por Plano
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={MOCK_GRAFICO_PLANOS}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {MOCK_GRAFICO_PLANOS.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={PLAN_COLORS[idx % PLAN_COLORS.length]}
                    />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {PLANS.map((plan, idx) => (
                <div key={plan.key} className="flex items-center gap-1 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[idx] }}
                  ></span>
                  <span className="text-white">{plan.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela detalhada */}
        <TabelaRachas
          rachas={filteredRachas}
          onDetalhes={(rachaId) =>
            window.open(`/superadmin/financeiro/${rachaId}`, "_self")
          }
        />

        {/* Modal de inadimplentes */}
        <ModalInadimplentes
          open={modalInadimplentes}
          onClose={() => setModalInadimplentes(false)}
          inadimplentes={MOCK_INADIMPLENTES}
        />
      </main>
    </>
  );
}
