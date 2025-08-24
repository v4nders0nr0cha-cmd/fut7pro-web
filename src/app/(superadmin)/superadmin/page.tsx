// src/app/superadmin/page.tsx

"use client";

import Head from "next/head";
import {
  FaUsers,
  FaMoneyBillWave,
  FaFutbol,
  FaTrophy,
  FaLock,
  FaDownload,
} from "react-icons/fa";

// MOCKS de dados SaaS (trocar para integração real depois)
const mockDashboard = {
  rachasVendidos: 28,
  usuariosAtivos: 726,
  partidasRegistradas: 2358,
  receitaTotal: 7840.4, // em reais
  ultimosRachas: [
    { nome: "Racha São Bento", admin: "lucas.souza", criadoEm: "2025-06-29" },
    { nome: "Fut7 Resenha", admin: "joao.paulo", criadoEm: "2025-06-28" },
    { nome: "Domingueira FC", admin: "vinicius.ramos", criadoEm: "2025-06-28" },
    { nome: "Brothers Ball", admin: "carlos.silva", criadoEm: "2025-06-27" },
    {
      nome: "Futebol dos Amigos",
      admin: "leandro.melo",
      criadoEm: "2025-06-27",
    },
  ],
  podeBaixarManual: false, // só libera após 1 venda
};

export default function SuperAdminDashboard() {
  const dashboard = mockDashboard;

  return (
    <>
      <Head>
        <title>Painel SuperAdmin – Fut7Pro SaaS</title>
        <meta
          name="description"
          content="Painel do SuperAdmin Fut7Pro: visão global das vendas, receita, estatísticas do sistema, clubes/rachas criados e ações exclusivas do dono da plataforma SaaS."
        />
        <meta
          name="keywords"
          content="fut7pro, superadmin, painel do dono, SaaS, futebol 7, sistema de rachas, dashboard SaaS, vendas, gestão, receita, multi-tenant, plataforma"
        />
      </Head>
      <main className="min-h-screen bg-[#101826] px-2 py-6 text-white md:px-6">
        {/* Header Institucional */}
        <div className="mb-6 flex w-full flex-col items-center rounded-t-xl bg-[#181f2a] px-4 py-3 shadow md:flex-row md:justify-between">
          <span className="text-xl font-bold text-yellow-400 drop-shadow-sm md:text-2xl">
            Painel Fut7Pro – SuperAdmin
          </span>
          <span className="mt-1 text-sm text-white/80 md:mt-0">
            Olá, Dono do Sistema
          </span>
        </div>

        {/* Cards principais */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-tr from-yellow-400 to-yellow-600/80 p-4 shadow-lg">
            <FaTrophy className="mb-2 text-3xl text-white drop-shadow" />
            <span className="text-lg font-bold text-white md:text-2xl">
              {dashboard.rachasVendidos}
            </span>
            <span className="text-xs text-white/80 md:text-base">
              Rachas Vendidos
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-tr from-blue-400 to-blue-600/80 p-4 shadow-lg">
            <FaUsers className="mb-2 text-3xl text-white drop-shadow" />
            <span className="text-lg font-bold text-white md:text-2xl">
              {dashboard.usuariosAtivos}
            </span>
            <span className="text-xs text-white/80 md:text-base">
              Usuários Ativos
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-tr from-green-400 to-green-600/80 p-4 shadow-lg">
            <FaFutbol className="mb-2 text-3xl text-white drop-shadow" />
            <span className="text-lg font-bold text-white md:text-2xl">
              {dashboard.partidasRegistradas}
            </span>
            <span className="text-xs text-white/80 md:text-base">
              Partidas Registradas
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-600/80 p-4 shadow-lg">
            <FaMoneyBillWave className="mb-2 text-3xl text-white drop-shadow" />
            <span className="text-lg font-bold text-white md:text-2xl">
              R${" "}
              {dashboard.receitaTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-white/80 md:text-base">
              Receita Total
            </span>
          </div>
        </section>

        {/* Últimos rachas vendidos */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-yellow-400 drop-shadow-sm md:text-2xl">
            Últimos Rachas Criados
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full rounded-xl bg-[#181f2a]">
              <thead>
                <tr className="bg-[#101826] text-sm text-yellow-300 md:text-base">
                  <th className="px-2 py-2 text-left">Nome do Racha</th>
                  <th className="px-2 py-2 text-left">Administrador</th>
                  <th className="px-2 py-2 text-left">Criado Em</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.ultimosRachas.map((racha, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-yellow-400/10"
                  >
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

        {/* Manual de Monetização */}
        <section className="mb-10 flex flex-col items-center justify-center">
          <h2 className="mb-2 text-lg font-semibold text-yellow-300 md:text-xl">
            Manual: Técnicas para Monetizar Seu Racha
          </h2>
          <p className="mb-3 max-w-xl text-center text-sm text-white/80 md:text-base">
            Ao realizar sua primeira venda real, o manual exclusivo de
            monetização será desbloqueado para você. Aprenda técnicas para
            alavancar a receita dos clubes e explorar o potencial do Fut7Pro.
          </p>
          <button
            className={`flex items-center gap-2 rounded-lg px-5 py-2 font-bold text-white shadow ${
              dashboard.podeBaixarManual
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:scale-105"
                : "cursor-not-allowed bg-gray-600"
            } transition-all`}
            disabled={!dashboard.podeBaixarManual}
          >
            <FaDownload />
            Baixar Manual de Monetização
            {!dashboard.podeBaixarManual && <FaLock className="ml-2" />}
          </button>
        </section>

        {/* SEO extra (oculto) */}
        <section className="hidden">
          <h2>
            Painel do dono da plataforma Fut7Pro – Gestão SaaS, receita global,
            estatísticas, vendas de rachas, administração multi-tenant,
            dashboard institucional.
          </h2>
          <p>
            Plataforma SaaS líder para administração de rachas de futebol 7 no
            Brasil. O painel SuperAdmin permite controle absoluto sobre vendas,
            receita, clubes, usuários, além de desbloquear recursos premium e
            relatórios completos.
          </p>
        </section>
      </main>
    </>
  );
}
