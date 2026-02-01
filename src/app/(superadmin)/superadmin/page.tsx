// src/app/superadmin/page.tsx

"use client";

import Head from "next/head";
import useSWR from "swr";
import { FaUsers, FaMoneyBillWave, FaFutbol, FaTrophy, FaLock, FaDownload } from "react-icons/fa";
import { useBranding } from "@/hooks/useBranding";

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

type FinanceOverview = {
  resumo: FinanceResumo;
  rachas: Array<{ nome: string; slug: string; presidente: string; createdAt?: string }>;
  graficoReceita: Array<{ mes: string; receita: number }>;
};

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function SuperAdminDashboard() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const brandLabel = brandText("Fut7Pro");

  const { data: dashboardData } = useSWR<DashboardResponse>("/api/superadmin/dashboard", fetcher);
  const { data: financeiro } = useSWR<FinanceOverview>("/api/superadmin/financeiro", fetcher);

  const rachasVendidos = dashboardData?.tenantCount ?? 0;
  const usuariosAtivos = dashboardData?.userCount ?? 0;
  const partidasRegistradas = dashboardData?.matchCount ?? 0;
  const receitaTotal = financeiro?.resumo?.receitaTotal ?? 0;
  const ultimosRachas =
    financeiro?.rachas?.slice(0, 5).map((r) => ({
      nome: r.nome,
      admin: r.presidente,
      criadoEm: r.createdAt ?? dashboardData?.lastUpdated ?? new Date().toISOString(),
    })) ?? [];
  const podeBaixarManual = rachasVendidos > 0;

  return (
    <>
      <Head>
        <title>{`Painel SuperAdmin - ${brand} SaaS`}</title>
        <meta
          name="description"
          content={`Painel do SuperAdmin ${brandLabel}: visão global das vendas, receita, estatísticas do sistema, clubes/rachas criados e ações exclusivas do dono da plataforma SaaS.`}
        />
        <meta
          name="keywords"
          content={`saas, painel do dono, futebol 7, sistema de rachas, dashboard SaaS, vendas, gestão, receita, multi-tenant, plataforma, ${brandLabel}`}
        />
      </Head>
      <main className="min-h-screen bg-[#101826] text-white py-6 px-2 md:px-6">
        {/* Header Institucional */}
        <div className="w-full px-4 py-3 flex flex-col md:flex-row items-center md:justify-between bg-[#181f2a] shadow rounded-t-xl mb-6">
          <span className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-sm">
            {`Painel ${brandLabel} - SuperAdmin`}
          </span>
          <span className="text-white/80 text-sm mt-1 md:mt-0">Olá, Dono do Sistema</span>
        </div>

        {/* Cards principais */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center bg-gradient-to-tr from-yellow-400 to-yellow-600/80 rounded-2xl shadow-lg p-4">
            <FaTrophy className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">{rachasVendidos}</span>
            <span className="text-xs md:text-base text-white/80">Rachas Vendidos</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-blue-400 to-blue-600/80 rounded-2xl shadow-lg p-4">
            <FaUsers className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">{usuariosAtivos}</span>
            <span className="text-xs md:text-base text-white/80">Usuários Ativos</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-green-400 to-green-600/80 rounded-2xl shadow-lg p-4">
            <FaFutbol className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">{partidasRegistradas}</span>
            <span className="text-xs md:text-base text-white/80">Partidas Registradas</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-emerald-400 to-emerald-600/80 rounded-2xl shadow-lg p-4">
            <FaMoneyBillWave className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">
              R$ {receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs md:text-base text-white/80">Receita Total</span>
          </div>
        </section>

        {/* Ultimos rachas vendidos */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-yellow-400 drop-shadow-sm">
            Últimos Rachas Criados
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-[#181f2a] rounded-xl">
              <thead>
                <tr className="text-sm md:text-base bg-[#101826] text-yellow-300">
                  <th className="px-2 py-2 text-left">Nome do Racha</th>
                  <th className="px-2 py-2 text-left">Administrador</th>
                  <th className="px-2 py-2 text-left">Criado Em</th>
                </tr>
              </thead>
              <tbody>
                {ultimosRachas.map((racha, idx) => (
                  <tr key={idx} className="hover:bg-yellow-400/10 transition-colors">
                    <td className="px-2 py-2">{racha.nome}</td>
                    <td className="px-2 py-2">{racha.admin}</td>
                    <td className="px-2 py-2">
                      {new Date(racha.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Manual de Monetizacao */}
        <section className="mb-10 flex flex-col items-center justify-center">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-yellow-300">
            Manual: Técnicas para Monetizar Seu Racha
          </h2>
          <p className="mb-3 text-center max-w-xl text-sm md:text-base text-white/80">
            {`Ao realizar sua primeira venda real, o manual exclusivo de monetização será desbloqueado para você. Aprenda técnicas para alavancar a receita dos clubes e explorar o potencial do ${brandLabel}.`}
          </p>
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white shadow
                            ${podeBaixarManual ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:scale-105" : "bg-gray-600 cursor-not-allowed"} transition-all`}
            disabled={!podeBaixarManual}
          >
            <FaDownload />
            Baixar Manual de Monetização
            {!podeBaixarManual && <FaLock className="ml-2" />}
          </button>
        </section>

        {/* SEO extra (oculto) */}
        <section className="hidden">
          <h2>
            {`Painel do dono da plataforma ${brandLabel} - Gestão SaaS, receita global, estatísticas, vendas de rachas, administração multi-tenant, dashboard institucional.`}
          </h2>
          <p>
            {`Plataforma SaaS líder para administração de rachas de futebol 7 no Brasil. O painel SuperAdmin permite controle absoluto sobre vendas, receita, clubes, usuários, além de desbloquear recursos premium e relatórios completos em ${brandLabel}.`}
          </p>
        </section>
      </main>
    </>
  );
}
