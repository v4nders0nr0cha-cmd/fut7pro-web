"use client";

import Head from "next/head";
import { FaDownload, FaSync } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSuperadminFinanceiro } from "@/hooks/useSuperadminFinanceiro";

const COLORS = ["#32d657", "#4c6fff", "#ffbe30", "#ff7043", "#7c3aed"];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SuperAdminFinanceiroPage() {
  const { financeiro, isLoading, error, refresh } = useSuperadminFinanceiro();

  return (
    <>
      <Head>
        <title>Financeiro - SuperAdmin Fut7Pro</title>
        <meta
          name="description"
          content="Acompanhe o resumo financeiro dos rachas vendidos e identifique inadimplências."
        />
      </Head>
      <div className="min-h-screen bg-[#101826] text-white px-4 py-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Financeiro da plataforma</h1>
            <p className="text-sm text-white/70">
              Resumo consolidado de receitas, despesas e status de cobrança dos rachas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {error ? <span className="text-sm text-red-300">Erro ao carregar dados</span> : null}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold shadow hover:bg-yellow-400"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <FaSync className={isLoading ? "animate-spin" : ""} /> Atualizar
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500 text-yellow-300 hover:bg-yellow-500/10"
              onClick={() => window.print()}
            >
              <FaDownload /> Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <ResumoCard
            title="Saldo atual"
            value={financeiro ? formatCurrency(financeiro.valores.saldo) : "R$ 0,00"}
          />
          <ResumoCard
            title="Receitas"
            value={financeiro ? formatCurrency(financeiro.valores.entradas) : "R$ 0,00"}
          />
          <ResumoCard
            title="Despesas"
            value={financeiro ? formatCurrency(financeiro.valores.saidas) : "R$ 0,00"}
          />
          <ResumoCard
            title="Rachas inadimplentes"
            value={financeiro ? String(financeiro.inadimplentes.length) : "0"}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              Receita mensal consolidada
              <span className="text-xs text-zinc-400">
                {financeiro && financeiro.ultimoMeses.length > 0
                  ? `${financeiro.ultimoMeses.length} meses analisados`
                  : "Sem histórico"}
              </span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financeiro?.ultimoMeses ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="mes" stroke="#cbd5f5" fontSize={12} />
                  <YAxis stroke="#cbd5f5" fontSize={12} />
                  <RechartTooltip
                    cursor={{ stroke: "#4c6fff" }}
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Receita por plano comercial</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financeiro?.planos ?? []}
                    dataKey="receita"
                    nameKey="nome"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {(financeiro?.planos ?? []).map((plano, index) => (
                      <Cell key={plano.chave} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {(financeiro?.planos ?? []).map((plano, index) => (
                <li key={plano.chave} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {plano.nome}
                  </span>
                  <span className="text-zinc-300">{formatCurrency(plano.receita)}</span>
                </li>
              ))}
              {financeiro && financeiro.planos.length === 0 ? (
                <li className="text-zinc-400">Nenhum plano com receita registrada.</li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Rachas inadimplentes</h2>
            <div className="space-y-3">
              {financeiro?.inadimplentes.length ? (
                financeiro.inadimplentes.map((item) => (
                  <div key={item.id} className="border border-red-500/30 rounded-lg px-4 py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-red-300">{item.racha}</div>
                        <div className="text-xs text-zinc-400">Presidente: {item.presidente}</div>
                        <div className="text-xs text-zinc-400">
                          Plano: {item.plano ?? "Sem plano"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-red-200">
                          Dias em atraso: {item.diasAtraso}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Valor estimado: {formatCurrency(item.valor)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">Nenhum racha inadimplente cadastrado.</p>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Cobranças recentes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Racha</th>
                    <th className="px-3 py-2 text-left">Presidente</th>
                    <th className="px-3 py-2 text-left">Plano</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-left">Vencimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {financeiro?.cobrancas.length ? (
                    financeiro.cobrancas.map((cobranca) => (
                      <tr key={cobranca.id} className="hover:bg-zinc-800/70">
                        <td className="px-3 py-2">{cobranca.racha}</td>
                        <td className="px-3 py-2">{cobranca.presidente}</td>
                        <td className="px-3 py-2">{cobranca.plano ?? "Sem plano"}</td>
                        <td className="px-3 py-2">{cobranca.status}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(cobranca.valor)}</td>
                        <td className="px-3 py-2">
                          {cobranca.vencimento
                            ? new Date(cobranca.vencimento).toLocaleDateString("pt-BR")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-zinc-400">
                        Nenhuma cobrança registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ResumoCardProps {
  title: string;
  value: string;
}

function ResumoCard({ title, value }: ResumoCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-5 shadow flex flex-col gap-2">
      <span className="text-xs text-zinc-400">{title}</span>
      <span className="text-xl font-bold text-yellow-400">{value}</span>
    </div>
  );
}
