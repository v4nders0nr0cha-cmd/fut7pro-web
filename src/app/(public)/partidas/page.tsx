"use client";

import Head from "next/head";
import Link from "next/link";
import { FaHistory, FaUsers, FaRandom } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function PartidasPage() {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("RACHA_UPDATE");
  const { publicHref } = usePublicLinks();

  return (
    <>
      <Head>
        <title>
          Partidas de Futebol 7 | Histórico, Times do Dia e Sorteio Inteligente | Fut7Pro
        </title>
        <meta
          name="description"
          content="Navegue pelo histórico de partidas, confira os times do dia e conheça o sistema de sorteio inteligente do Fut7Pro. Plataforma premium para rachas de Futebol 7."
        />
        <meta
          name="keywords"
          content="fut7, partidas de futebol 7, histórico de jogos, sorteio de times, escalação, racha, futebol amador, sistema balanceamento, admin fut7, times do dia"
        />
      </Head>

      {/* TÍTULO PRINCIPAL PADRÃO */}
      <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-brand text-center leading-tight drop-shadow-sm">
        Partidas
      </h1>
      {/* DESCRIÇÃO PADRÃO */}
      <p className="mb-8 text-base md:text-lg text-gray-300 text-center max-w-2xl mx-auto leading-relaxed font-medium">
        Escolha o que deseja visualizar: histórico, detalhes ou times do dia.
      </p>

      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
          {/* Histórico de Partidas */}
          <Link href={publicHref("/partidas/historico")}>
            <div className="group bg-gradient-to-br from-[#181818cc] to-[#212121] border border-brand-strong/40 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:border-brand hover:shadow-[0_0_16px_2px_var(--brand)] cursor-pointer min-h-[280px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-[#222] rounded-full mb-4 sm:mb-6 group-hover:bg-brand/90 transition">
                <FaHistory className="text-brand group-hover:text-black text-2xl sm:text-4xl transition" />
              </div>
              <span className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white text-center">
                Histórico de Partidas
              </span>
              <span className="text-textoSuave text-center mb-4 sm:mb-6 text-xs sm:text-base">
                Veja todos os jogos já realizados, com placares, locais e filtros detalhados.
              </span>
              <span className="mt-auto px-5 py-2 rounded-xl bg-brand text-black font-semibold group-hover:bg-black group-hover:text-brand transition text-xs sm:text-base">
                Acessar
              </span>
            </div>
          </Link>

          {/* Times do Dia */}
          <Link href={publicHref("/partidas/times-do-dia")}>
            <div className="group bg-gradient-to-br from-[#181818cc] to-[#212121] border border-brand-strong/40 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:border-brand hover:shadow-[0_0_16px_2px_var(--brand)] cursor-pointer min-h-[280px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-[#222] rounded-full mb-4 sm:mb-6 group-hover:bg-brand/90 transition">
                <FaUsers className="text-brand group-hover:text-black text-2xl sm:text-4xl transition" />
              </div>
              <span className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white text-center">
                Times do Dia
              </span>
              <span className="text-textoSuave text-center mb-4 sm:mb-6 text-xs sm:text-base">
                Confira os times sorteados e a escalação oficial do próximo jogo.
              </span>
              <span className="mt-auto px-5 py-2 rounded-xl bg-brand text-black font-semibold group-hover:bg-black group-hover:text-brand transition text-xs sm:text-base">
                Acessar
              </span>
            </div>
          </Link>

          {/* Sorteio Inteligente */}
          <div
            title="Apenas administradores podem acessar esta área"
            className={`group bg-gradient-to-br from-[#181818cc] to-[#212121] border border-brand-strong/40 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:border-brand hover:shadow-[0_0_16px_2px_var(--brand)] ${
              isAdmin ? "cursor-pointer" : "cursor-not-allowed"
            } min-h-[280px]`}
          >
            <div className="absolute top-0 left-0 right-0 flex justify-center">
              <span className="bg-red-600 text-white font-bold text-xs px-4 py-1 rounded-b-2xl tracking-wide shadow-md">
                ÁREA RESTRITA PARA ADMINISTRADORES
              </span>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-[#222] rounded-full mb-4 sm:mb-6 mt-6 group-hover:bg-brand/90 transition">
              <FaRandom className="text-brand group-hover:text-black text-2xl sm:text-4xl transition" />
            </div>
            <span className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-white text-center">
              Sorteio Inteligente
            </span>
            <span className="text-textoSuave text-center mb-4 sm:mb-6 text-xs sm:text-base">
              Gere times equilibrados usando o sistema exclusivo.
            </span>
            {isAdmin ? (
              <Link href="/admin/partidas/sorteio-inteligente">
                <span className="mt-auto px-5 py-2 rounded-xl bg-brand text-black font-semibold transition text-xs sm:text-base">
                  Acessar
                </span>
              </Link>
            ) : (
              <span className="mt-auto px-5 py-2 rounded-xl bg-[#222] text-brand font-semibold opacity-80 cursor-not-allowed border border-brand text-xs sm:text-base">
                Acesso restrito
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
