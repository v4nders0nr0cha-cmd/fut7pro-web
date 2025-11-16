"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaDownload, FaSearch } from "react-icons/fa";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as PieTooltip,
  XAxis,
  YAxis,
} from "recharts";

import KPI from "@/components/financeiro/KPI";
import CardPlano from "@/components/financeiro/CardPlano";
import TabelaRachas from "@/components/financeiro/TabelaRachas";
import ModalInadimplentes from "@/components/financeiro/ModalInadimplentes";
import type { Inadimplente, RachaDetalheResumido } from "@/components/financeiro/types";
import { useSuperAdminFinanceiro } from "@/hooks/useSuperAdminFinanceiro";

const PLAN_COLORS: Record<string, string> = {
  mensal_essencial: "#32d657",
  mensal_marketing: "#4c6fff",
  anual_essencial: "#ffbe30",
  anual_marketing: "#ff7043",
};

const STATUS_LABELS: Record<string, { label: RachaDetalheResumido["status"]; color: string }> = {
  active: { label: "Pago", color: "text-green-400" },
  trialing: { label: "Trial", color: "text-yellow-400" },
  past_due: { label: "Em aberto", color: "text-red-400" },
  paused: { label: "Em aberto", color: "text-red-400" },
  canceled: { label: "Cancelado", color: "text-zinc-500" },
  expired: { label: "Cancelado", color: "text-zinc-500" },
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return parsed.toLocaleDateString("pt-BR");
}

function mapStatus(status?: string | null): RachaDetalheResumido["status"] {
  const normalized = status?.toLowerCase() ?? "";
  return STATUS_LABELS[normalized]?.label ?? "Em aberto";
}

export default function FinanceiroSuperAdminPage() {
  const [busca, setBusca] = useState("");
  const [modalInadimplentes, setModalInadimplentes] = useState(false);
  const { data, error, isLoading } = useSuperAdminFinanceiro();

  const resumo = data?.resumo ?? {
    receitaTotal: 0,
    mrr: 0,
    arr: 0,
    ticketMedio: 0,
    churn: 0,
    ativos: 0,
    inadimplentes: 0,
  };

  const planos = data?.porPlano ?? [];
  const graficoReceita = data?.graficoReceita ?? [];

  const tabelaRachas: RachaDetalheResumido[] = useMemo(() => {
    return (data?.rachas ?? [])
      .map((row) => ({
        id: row.id,
        racha: row.nome,
        presidente: row.presidente,
        plano: row.plano,
        status: mapStatus(row.status),
        valor: row.valor,
        vencimento: formatDate(row.vencimento),
      }))
      .filter((row) => {
        if (!busca.trim()) return true;
        const term = busca.trim().toLowerCase();
        return (
          row.racha.toLowerCase().includes(term) ||
          row.presidente.toLowerCase().includes(term) ||
          row.plano.toLowerCase().includes(term)
        );
      });
  }, [data, busca]);

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
  }, [data]);

  return (
    <>
      <Head>
        <title>Financeiro SuperAdmin | Fut7Pro</title>
        <meta
          name="description"
          content="Visao financeira global do SaaS Fut7Pro: planos vendidos, inadimplencia e receita."
        />
      </Head>
      <main className="min-h-screen bg-[#101826] text-white py-6 px-2 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 drop-shadow-sm">Financeiro</h1>
            <p className="text-sm text-white/70">
              Controle global de planos vendidos, receita recorrente e inadimplencia dos rachas.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="flex items-center bg-zinc-900 rounded-full px-4 py-2 text-sm border border-zinc-700">
              <FaSearch className="text-zinc-500 mr-2" />
              <input
                type="text"
                className="bg-transparent outline-none text-white"
                placeholder="Buscar racha ou presidente"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
            <button
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
              onClick={() => window.open("/superadmin/financeiro/export", "_blank")}
            >
              <FaDownload /> Exportar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPI title="Receita Total" value={formatCurrency(resumo.receitaTotal)} color="green" />
          <KPI title="Rachas Ativos Pagos" value={resumo.ativos} color="yellow" />
          <KPI
            title="Inadimplentes"
            value={
              <span
                className="cursor-pointer underline"
                onClick={() => resumo.inadimplentes > 0 && setModalInadimplentes(true)}
              >
                {resumo.inadimplentes}
              </span>
            }
            color="red"
            tooltip="Quantidade de rachas com pagamento em aberto"
          />
          <KPI
            title="Churn (%)"
            value={`${resumo.churn.toFixed(1)}%`}
            color="blue"
            tooltip="Cancelamentos recentes em relacao ao total"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {planos.map((plano) => (
            <CardPlano
              key={plano.key}
              nome={plano.nome}
              tipo={plano.tipo === "anual" ? "Anual" : "Mensal"}
              ativos={plano.ativos}
              receita={plano.receita}
              inadimplentes={plano.inadimplentes}
              vencimentos={plano.vencimentos}
              cor={PLAN_COLORS[plano.key] ?? "#32d657"}
              onClickInadimplentes={
                plano.inadimplentes > 0 ? () => setModalInadimplentes(true) : undefined
              }
            />
          ))}
          {planos.length === 0 && !isLoading && (
            <div className="col-span-2 rounded-2xl border border-dashed border-zinc-600 p-6 text-center text-zinc-400">
              Nenhum plano registrado ainda.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col">
            <h2 className="text-white font-semibold mb-2 text-base">Evolucao da Receita (R$)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={graficoReceita}>
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
            <h2 className="text-white font-semibold mb-2 text-base">Distribuicao por Plano</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planos.map((p) => ({ name: p.nome, value: p.ativos }))}
                  dataKey="value"
                  outerRadius={80}
                  label
                >
                  {planos.map((plano) => (
                    <Cell
                      key={`cell-${plano.key}`}
                      fill={PLAN_COLORS[plano.key] ?? PLAN_COLORS.mensal_essencial}
                    />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-2 gap-3 flex-wrap">
              {planos.map((plano) => (
                <div key={plano.key} className="flex items-center gap-1 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: PLAN_COLORS[plano.key] ?? PLAN_COLORS.mensal_essencial,
                    }}
                  />
                  <span className="text-white">{plano.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TabelaRachas
          rachas={tabelaRachas}
          onDetalhes={(rachaId) => window.open(`/superadmin/financeiro/${rachaId}`, "_self")}
        />

        <ModalInadimplentes
          open={modalInadimplentes}
          onClose={() => setModalInadimplentes(false)}
          inadimplentes={inadimplentes}
        />

        {isLoading && (
          <div className="mt-4 text-center text-sm text-zinc-400">
            Carregando dados financeiros...
          </div>
        )}
      </main>
    </>
  );
}
