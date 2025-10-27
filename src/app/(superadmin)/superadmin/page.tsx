"use client";

import Head from "next/head";
import {
  FaUsers,
  FaMoneyBillWave,
  FaFutbol,
  FaTrophy,
  FaLock,
  FaDownload,
  FaSync,
} from "react-icons/fa";
import { useSuperadminDashboard } from "@/hooks/useSuperadminDashboard";

const fallback = {
  totalRachas: 0,
  totalUsuarios: 0,
  totalPartidas: 0,
  receitaTotal: 0,
  manualLiberado: false,
  ultimosRachas: [],
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch (error) {
    return "-";
  }
}

export default function SuperAdminDashboard() {
  const { metrics, isLoading, error, refresh } = useSuperadminDashboard();
  const dashboard = metrics ?? fallback;

  const downloadButtonClass = [
    "flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white shadow transition-all",
    dashboard.manualLiberado
      ? "bg-emerald-500 hover:bg-emerald-400"
      : "bg-gray-600 cursor-not-allowed opacity-70",
  ].join(" ");

  return (
    <>
      <Head>
        <title>Painel SuperAdmin - Fut7Pro SaaS</title>
        <meta
          name="description"
          content="Painel do SuperAdmin Fut7Pro com visão global de vendas, receita e clubes."
        />
        <meta
          name="keywords"
          content="fut7pro, superadmin, painel, saas, futebol 7, sistema, multi-tenant"
        />
      </Head>
      <main className="min-h-screen bg-[#101826] text-white py-6 px-2 md:px-6">
        <div className="w-full px-4 py-3 flex flex-col md:flex-row items-center md:justify-between bg-[#181f2a] shadow rounded-t-xl mb-6">
          <span className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-sm">
            Painel Fut7Pro - SuperAdmin
          </span>
          <div className="flex items-center gap-3">
            {error ? (
              <span className="text-sm text-red-400">Falha ao carregar métricas</span>
            ) : null}
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold shadow hover:bg-yellow-400"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <FaSync className={isLoading ? "animate-spin" : ""} /> Atualizar
            </button>
          </div>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center bg-gradient-to-tr from-yellow-400 to-yellow-600/80 rounded-2xl shadow-lg p-4">
            <FaTrophy className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">
              {dashboard.totalRachas}
            </span>
            <span className="text-xs md:text-base text-white/80">Rachas vendidos</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-blue-400 to-blue-600/80 rounded-2xl shadow-lg p-4">
            <FaUsers className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">
              {dashboard.totalUsuarios}
            </span>
            <span className="text-xs md:text-base text-white/80">Usuários ativos</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-green-400 to-green-600/80 rounded-2xl shadow-lg p-4">
            <FaFutbol className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">
              {dashboard.totalPartidas}
            </span>
            <span className="text-xs md:text-base text-white/80">Partidas registradas</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-emerald-400 to-emerald-600/80 rounded-2xl shadow-lg p-4">
            <FaMoneyBillWave className="text-3xl text-white mb-2 drop-shadow" />
            <span className="text-lg md:text-2xl font-bold text-white">
              R$ {formatCurrency(dashboard.receitaTotal)}
            </span>
            <span className="text-xs md:text-base text-white/80">Receita líquida</span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-yellow-400 drop-shadow-sm">
            Últimos rachas criados
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full bg-[#181f2a] rounded-xl">
              <thead>
                <tr className="text-sm md:text-base bg-[#101826] text-yellow-300">
                  <th className="px-2 py-2 text-left">Nome do racha</th>
                  <th className="px-2 py-2 text-left">Administrador</th>
                  <th className="px-2 py-2 text-left">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.ultimosRachas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-white/60">
                      {isLoading ? "Carregando dados..." : "Nenhum racha cadastrado até o momento."}
                    </td>
                  </tr>
                ) : (
                  dashboard.ultimosRachas.map((racha) => (
                    <tr key={racha.id} className="hover:bg-yellow-400/10 transition-colors">
                      <td className="px-2 py-2">{racha.nome}</td>
                      <td className="px-2 py-2">{racha.presidente}</td>
                      <td className="px-2 py-2">{formatDate(racha.criadoEm)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 flex flex-col items-center justify-center">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-yellow-300">
            Manual: Técnicas para monetizar seu racha
          </h2>
          <p className="mb-3 text-center max-w-xl text-sm md:text-base text-white/80">
            Assim que você concluir a primeira venda real o manual exclusivo de monetização será
            liberado automaticamente.
          </p>
          <button className={downloadButtonClass} disabled={!dashboard.manualLiberado}>
            <FaDownload />
            Baixar manual de monetização
            {!dashboard.manualLiberado && <FaLock className="ml-2" />}
          </button>
        </section>
      </main>
    </>
  );
}
