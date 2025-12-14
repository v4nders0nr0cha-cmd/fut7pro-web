"use client";

import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";
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
  StatusPagamento,
} from "@/components/financeiro/types";
import { useBranding } from "@/hooks/useBranding";

type SuperAdminFinanceiro = {
  resumo: {
    receitaTotal: number;
    mrr: number;
    arr: number;
    ticketMedio: number;
    churn: number;
    ativos: number;
    inadimplentes: number;
  };
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
  rachas: Array<{
    id: string;
    nome: string;
    presidente: string;
    plano: string;
    status: string;
    valor: number;
    vencimento: string | null;
    contato?: string | null;
  }>;
  inadimplentes: Array<{
    id: string;
    nome: string;
    presidente: string;
    plano: string;
    status: string;
    valor: number;
    vencimento: string | null;
    contato?: string | null;
  }>;
};

const PLAN_COLORS = ["#32d657", "#4c6fff", "#ffbe30", "#ff7043"];
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

function mapStatus(status?: string): StatusPagamento {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("trial")) return "Trial";
  if (normalized.includes("past") || normalized.includes("due") || normalized.includes("overdue")) {
    return "Em aberto";
  }
  if (normalized.includes("cancel")) return "Cancelado";
  if (
    normalized.includes("inactive") ||
    normalized.includes("paused") ||
    normalized.includes("expired")
  ) {
    return "Cancelado";
  }
  return "Pago";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
}

function formatCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
}

export default function FinanceiroPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const brandLabel = brandText("Fut7Pro");
  const [periodo, setPeriodo] = useState("30d");
  const [status, setStatus] = useState<StatusPagamento | "all">("all");
  const [plano, setPlano] = useState("all");
  const [search, setSearch] = useState("");
  const [modalInadimplentes, setModalInadimplentes] = useState(false);

  const { data } = useSWR<SuperAdminFinanceiro>("/api/superadmin/financeiro", fetcher);

  const plans = data?.porPlano ?? [];

  const rachas: RachaDetalheResumido[] = useMemo(() => {
    return (data?.rachas ?? []).map((row) => ({
      id: row.id,
      racha: row.nome,
      presidente: row.presidente,
      plano: row.plano,
      status: mapStatus(row.status),
      valor: row.valor,
      vencimento: formatDate(row.vencimento),
    }));
  }, [data?.rachas]);

  const inadimplentes: Inadimplente[] = useMemo(() => {
    return (data?.inadimplentes ?? []).map((row) => ({
      id: row.id,
      racha: row.nome,
      presidente: row.presidente,
      plano: row.plano,
      valor: row.valor,
      vencimento: formatDate(row.vencimento),
      contato: row.contato ?? "",
    }));
  }, [data?.inadimplentes]);

  const filteredRachas = rachas.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (plano !== "all") {
      const planObj = plans.find((p) => p.key === plano);
      if (!planObj) return false;
      if (row.plano !== planObj.nome) return false;
    }
    return (
      row.racha.toLowerCase().includes(search.toLowerCase()) ||
      row.presidente.toLowerCase().includes(search.toLowerCase())
    );
  });

  function exportCSV() {
    const rows = [
      ["Racha", "Presidente", "Plano", "Status", "Valor (R$)", "Vencimento"],
      ...filteredRachas.map((r) => [
        r.racha,
        r.presidente,
        r.plano,
        r.status,
        r.valor.toFixed(2).replace(".", ","),
        r.vencimento,
      ]),
    ];
    const blob = new Blob([formatCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financeiro-superadmin.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filteredRachas, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financeiro-superadmin.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Head>
        <title>{`Painel Financeiro SaaS - ${brandLabel}`}</title>
        <meta
          name="description"
          content={`Controle financeiro SaaS do ${brandLabel}: receitas, assinaturas, planos, inadimplencia, graficos e exportacao. Gestao inteligente e moderna de rachas de futebol 7.`}
        />
        <meta
          name="keywords"
          content={`financeiro, SaaS, fut7, dashboard, assinatura, racha, plataforma futebol, gestao financeira, planos, mensal, anual, marketing, ${brandLabel}`}
        />
      </Head>

      <main className="bg-zinc-900 min-h-screen px-2 sm:px-4 md:px-8 pt-6 pb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Painel Financeiro dos Rachas
        </h1>
        {/* Exportacao e filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={exportCSV}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded font-semibold flex items-center gap-2 transition"
          >
            <FaDownload /> Exportar CSV
          </button>
          <button
            onClick={exportJSON}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded font-semibold flex items-center gap-2 transition"
          >
            <FaDownload /> Exportar JSON
          </button>
          {/* Filtros */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-zinc-800 text-white rounded px-2 py-1 ml-2"
          >
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="ano">Ano atual</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusPagamento | "all")}
            className="bg-zinc-800 text-white rounded px-2 py-1"
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
            className="bg-zinc-800 text-white rounded px-2 py-1"
          >
            <option value="all">Todos Planos</option>
            {plans.map((plan) => (
              <option key={plan.key} value={plan.key}>
                {plan.nome}
              </option>
            ))}
          </select>
          <div className="relative ml-auto w-full sm:w-auto">
            <FaSearch className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              className="bg-zinc-800 text-white pl-10 pr-4 py-2 rounded w-full sm:w-52"
              placeholder="Buscar racha ou presidente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPI
            title="Receita Total (R$)"
            value={(data?.resumo?.receitaTotal ?? 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            color="green"
          />
          <KPI title="Rachas Ativos Pagos" value={data?.resumo?.ativos ?? 0} color="yellow" />
          <KPI
            title="Inadimplentes"
            value={
              <span
                className="cursor-pointer underline"
                title="Clique para ver detalhes dos inadimplentes"
                onClick={() => setModalInadimplentes(true)}
              >
                {data?.resumo?.inadimplentes ?? 0}
              </span>
            }
            color="red"
            tooltip="Quantidade de rachas com pagamento em aberto no sistema. Clique para ver detalhes."
          />
          <KPI
            title="Churn Rate (%)"
            value={(data?.resumo?.churn ?? 0) + "%"}
            color="blue"
            tooltip="Percentual de cancelamentos recentes em relacao ao total de rachas ativos."
          />
        </div>

        {/* Cards por plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {plans.map((plan, idx) => (
            <CardPlano
              key={plan.key}
              nome={plan.nome}
              tipo={plan.tipo.toLowerCase().includes("anual") ? "Anual" : "Mensal"}
              ativos={plan.ativos}
              receita={plan.receita}
              inadimplentes={plan.inadimplentes}
              vencimentos={plan.vencimentos}
              cor={PLAN_COLORS[idx] ?? "#32d657"}
              onClickInadimplentes={
                plan.inadimplentes > 0 ? () => setModalInadimplentes(true) : undefined
              }
            />
          ))}
        </div>

        {/* Graficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col">
            <h2 className="text-white font-semibold mb-2 text-base">Evolucao da Receita (R$)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.graficoReceita ?? []}>
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
          <div className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col">
            <h2 className="text-white font-semibold mb-2 text-base">Rachas Ativos por Plano</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={plans.map((p) => ({
                    name: p.nome,
                    value: p.ativos,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {plans.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={PLAN_COLORS[idx % PLAN_COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-2 gap-3 flex-wrap">
              {plans.map((plan, idx) => (
                <div key={plan.key} className="flex items-center gap-1 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[idx] }}
                  ></span>
                  <span className="text-white">{plan.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela detalhada */}
        <TabelaRachas
          rachas={filteredRachas}
          onDetalhes={(rachaId) => window.open(`/superadmin/financeiro/${rachaId}`, "_self")}
        />

        {/* Modal de inadimplentes */}
        <ModalInadimplentes
          open={modalInadimplentes}
          onClose={() => setModalInadimplentes(false)}
          inadimplentes={inadimplentes}
        />
      </main>
    </>
  );
}
