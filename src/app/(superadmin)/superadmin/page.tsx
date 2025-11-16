// src/app/superadmin/page.tsx

"use client";

import { useMemo, type ReactNode } from "react";
import Head from "next/head";
import { FaUsers, FaMoneyBillWave, FaFutbol, FaTrophy, FaLock, FaDownload } from "react-icons/fa";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import type { Racha } from "@/types/superadmin";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("pt-BR");
}

export default function SuperAdminDashboard() {
  const { metricas, rachas, isLoading, error } = useSuperAdmin();

  const ultimosRachas = useMemo(() => {
    return [...(rachas ?? [])]
      .sort((a, b) => {
        const dateA = new Date(a.criadoEm ?? 0).getTime();
        const dateB = new Date(b.criadoEm ?? 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [rachas]);

  const podeBaixarManual = (metricas?.tenantCount ?? 0) > 0;

  return (
    <>
      <Head>
        <title>Painel SuperAdmin - Fut7Pro SaaS</title>
        <meta
          name="description"
          content="Painel do SuperAdmin Fut7Pro: visão global das vendas, receita, estatísticas do sistema, clubes/rachas criados e ações exclusivas do dono da plataforma SaaS."
        />
        <meta
          name="keywords"
          content="fut7pro, superadmin, painel do dono, SaaS, futebol 7, sistema de rachas, dashboard SaaS, vendas, gestão, receita, multi-tenant, plataforma"
        />
      </Head>
      <main className="min-h-screen bg-[#101826] text-white py-6 px-2 md:px-6">
        <div className="w-full px-4 py-3 flex flex-col md:flex-row items-center md:justify-between bg-[#181f2a] shadow rounded-t-xl mb-6">
          <span className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-sm">
            Painel Fut7Pro - SuperAdmin
          </span>
          <span className="text-white/80 text-sm mt-1 md:mt-0">Olá, Dono do Sistema</span>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-100 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <ResumoCard
            icon={<FaTrophy className="text-3xl text-white mb-2 drop-shadow" />}
            label="Rachas Vendidos"
            value={metricas?.tenantCount ?? 0}
            loading={isLoading}
          />
          <ResumoCard
            icon={<FaUsers className="text-3xl text-white mb-2 drop-shadow" />}
            label="Usuários Ativos"
            value={metricas?.userCount ?? 0}
            loading={isLoading}
          />
          <ResumoCard
            icon={<FaFutbol className="text-3xl text-white mb-2 drop-shadow" />}
            label="Partidas Registradas"
            value={metricas?.matchCount ?? 0}
            loading={isLoading}
          />
          <ResumoCard
            icon={<FaMoneyBillWave className="text-3xl text-white mb-2 drop-shadow" />}
            label="Última atualização"
            value={metricas?.lastUpdated ? formatDate(metricas.lastUpdated) : "Sem dados"}
            loading={isLoading}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-yellow-400 drop-shadow-sm">
            Últimos Rachas Criados
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-[#181f2a] rounded-xl">
              <thead>
                <tr className="text-sm md:text-base bg-[#101826] text-yellow-300">
                  <th className="px-2 py-2 text-left">Nome do Racha</th>
                  <th className="px-2 py-2 text-left">Slug</th>
                  <th className="px-2 py-2 text-left">Criado Em</th>
                </tr>
              </thead>
              <tbody>
                {(ultimosRachas as Racha[]).map((racha) => (
                  <tr key={racha.id} className="hover:bg-yellow-400/10 transition-colors">
                    <td className="px-2 py-2">{racha.nome}</td>
                    <td className="px-2 py-2 text-yellow-300">{racha.slug}</td>
                    <td className="px-2 py-2">{formatDate(racha.criadoEm)}</td>
                  </tr>
                ))}
                {ultimosRachas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-4 text-center text-zinc-400">
                      Nenhum racha cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 flex flex-col items-center justify-center">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-yellow-300">
            Manual: Técnicas para Monetizar Seu Racha
          </h2>
          <p className="mb-3 text-center max-w-xl text-sm md:text-base text-white/80">
            Ao realizar sua primeira venda real, o manual exclusivo de monetização será desbloqueado
            para você. Aprenda técnicas para alavancar a receita dos clubes e explorar o potencial
            do Fut7Pro.
          </p>
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white shadow ${
              podeBaixarManual
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:scale-105"
                : "bg-gray-600 cursor-not-allowed"
            } transition-all`}
            disabled={!podeBaixarManual}
          >
            <FaDownload />
            Baixar Manual de Monetização
            {!podeBaixarManual && <FaLock className="ml-2" />}
          </button>
        </section>

        <section className="hidden">
          <h2>
            Painel do dono da plataforma Fut7Pro - Gestão SaaS, receita global, estatísticas, vendas
            de rachas, administração multi-tenant, dashboard institucional.
          </h2>
          <p>
            Plataforma SaaS líder para administração de rachas de futebol 7 no Brasil. O painel
            SuperAdmin permite controle absoluto sobre vendas, receita, clubes, usuários, além de
            desbloquear recursos premium e relatórios completos.
          </p>
        </section>
      </main>
    </>
  );
}

function ResumoCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center bg-gradient-to-tr from-blue-500/40 to-blue-900/40 rounded-2xl shadow-lg p-4 border border-white/5">
      {icon}
      <span className="text-lg md:text-2xl font-bold text-white">{loading ? "..." : value}</span>
      <span className="text-xs md:text-base text-white/80">{label}</span>
    </div>
  );
}
