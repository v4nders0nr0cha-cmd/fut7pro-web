"use client";

import Head from "next/head";
import Link from "next/link";
import { FaChartLine, FaHandshake, FaMoneyBillWave, FaBullhorn } from "react-icons/fa";
import { useMe } from "@/hooks/useMe";
import useSubscription from "@/hooks/useSubscription";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import { useFinanceiro } from "@/hooks/useFinanceiro";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function MonetizacaoPage() {
  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId;
  const { subscription, loading: loadingSubscription } = useSubscription(tenantId);
  const { patrocinadores, isLoading: loadingPatrocinadores } = usePatrocinadores();
  const { lancamentos, isLoading: loadingFinanceiro } = useFinanceiro();

  const receitaFinanceira = (lancamentos || [])
    .filter((item) => (item.valor ?? 0) > 0)
    .reduce((acc, item) => acc + (item.valor ?? 0), 0);

  const receitaPatrocinios = (patrocinadores || []).reduce(
    (acc, item) => acc + (item.valor || 0),
    0
  );

  const hoje = new Date();
  const patrocinadoresVencendo = (patrocinadores || []).filter((item) => {
    const vencimento = parseDate(item.nextDueAt || item.periodoFim);
    if (!vencimento) return false;
    return vencimento.getTime() < hoje.getTime();
  }).length;

  const planLabel = subscription?.planKey || "não identificado";

  return (
    <>
      <Head>
        <title>Monetização | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Painel de monetização com dados reais de patrocínio, financeiro e plano do racha."
        />
        <meta
          name="keywords"
          content="monetização do racha, patrocinadores, financeiro, plano Fut7Pro, gestão esportiva"
        />
      </Head>
      <main className="w-full max-w-5xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">Monetização do Racha</h1>
          <p className="text-zinc-300">
            Acompanhe receita, patrocínios e ações de crescimento com base nos dados reais do seu
            painel.
          </p>
          <div className="rounded-lg border border-zinc-700 bg-[#232323] px-4 py-3 text-sm text-zinc-200">
            {loadingSubscription ? (
              <span>Carregando status do plano...</span>
            ) : (
              <span>
                Plano ativo: <b>{planLabel}</b>
              </span>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-yellow-700 bg-[#23272F] p-4">
            <div className="flex items-center gap-2 text-yellow-300 font-semibold">
              <FaHandshake />
              Patrocinadores ativos
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {loadingPatrocinadores ? "..." : patrocinadores.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-700 bg-[#23272F] p-4">
            <div className="flex items-center gap-2 text-green-300 font-semibold">
              <FaMoneyBillWave />
              Receita financeira
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {loadingFinanceiro ? "..." : formatCurrency(receitaFinanceira)}
            </p>
          </div>

          <div className="rounded-xl border border-cyan-700 bg-[#23272F] p-4">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <FaChartLine />
              Contratos de patrocínio
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {loadingPatrocinadores ? "..." : formatCurrency(receitaPatrocinios)}
            </p>
          </div>

          <div className="rounded-xl border border-red-700 bg-[#23272F] p-4">
            <div className="flex items-center gap-2 text-red-300 font-semibold">
              <FaBullhorn />
              Patrocínios vencidos
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {loadingPatrocinadores ? "..." : patrocinadoresVencendo}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-700 bg-[#23272F] p-5">
          <h2 className="text-xl font-semibold text-yellow-300 mb-3">Ações recomendadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Link
              href="/admin/financeiro/patrocinadores"
              className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition"
            >
              Gerenciar patrocinadores e contratos
            </Link>
            <Link
              href="/admin/financeiro/prestacao-de-contas"
              className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition"
            >
              Atualizar prestação de contas
            </Link>
            <Link
              href="/admin/relatorios"
              className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition"
            >
              Ver relatórios de desempenho
            </Link>
            <Link
              href="/admin/comunicacao/comunicados"
              className="rounded-lg border border-zinc-600 px-4 py-3 hover:bg-zinc-800 transition"
            >
              Publicar comunicado para patrocinadores e atletas
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
