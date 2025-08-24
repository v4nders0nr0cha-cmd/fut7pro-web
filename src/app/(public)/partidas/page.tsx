"use client";

import Head from "next/head";
import Link from "next/link";
import { FaHistory, FaUsers, FaRandom } from "react-icons/fa";

export default function PartidasPage() {
  const isAdmin = false;

  return (
    <>
      <Head>
        <title>
          Partidas de Futebol 7 | Histórico, Times do Dia e Sorteio Inteligente
          | Fut7Pro
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
      <h1 className="mb-3 mt-10 text-center text-3xl font-extrabold leading-tight text-yellow-400 drop-shadow-sm md:text-4xl">
        Partidas
      </h1>
      {/* DESCRIÇÃO PADRÃO */}
      <p className="mx-auto mb-8 max-w-2xl text-center text-base font-medium leading-relaxed text-gray-300 md:text-lg">
        Escolha o que deseja visualizar: histórico, detalhes ou times do dia.
      </p>

      <div className="flex w-full justify-center">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
          {/* Histórico de Partidas */}
          <Link href="/partidas/historico">
            <div className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-between rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-[#181818cc] to-[#212121] p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-yellow-400 hover:shadow-[0_0_16px_2px_#FFD60090] sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#222] transition group-hover:bg-yellow-400/90 sm:mb-6 sm:h-16 sm:w-16">
                <FaHistory className="text-2xl text-yellow-400 transition group-hover:text-black sm:text-4xl" />
              </div>
              <span className="mb-1 text-center text-base font-bold text-white sm:mb-2 sm:text-lg">
                Histórico de Partidas
              </span>
              <span className="text-textoSuave mb-4 text-center text-xs sm:mb-6 sm:text-base">
                Veja todos os jogos já realizados, com placares, locais e
                filtros detalhados.
              </span>
              <span className="mt-auto rounded-xl bg-yellow-400 px-5 py-2 text-xs font-semibold text-black transition group-hover:bg-black group-hover:text-yellow-400 sm:text-base">
                Acessar
              </span>
            </div>
          </Link>

          {/* Times do Dia */}
          <Link href="/partidas/times-do-dia">
            <div className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-between rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-[#181818cc] to-[#212121] p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-yellow-400 hover:shadow-[0_0_16px_2px_#FFD60090] sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#222] transition group-hover:bg-yellow-400/90 sm:mb-6 sm:h-16 sm:w-16">
                <FaUsers className="text-2xl text-yellow-400 transition group-hover:text-black sm:text-4xl" />
              </div>
              <span className="mb-1 text-center text-base font-bold text-white sm:mb-2 sm:text-lg">
                Times do Dia
              </span>
              <span className="text-textoSuave mb-4 text-center text-xs sm:mb-6 sm:text-base">
                Confira os times sorteados e a escalação oficial do próximo
                jogo.
              </span>
              <span className="mt-auto rounded-xl bg-yellow-400 px-5 py-2 text-xs font-semibold text-black transition group-hover:bg-black group-hover:text-yellow-400 sm:text-base">
                Acessar
              </span>
            </div>
          </Link>

          {/* Sorteio Inteligente */}
          <div
            title="Apenas administradores podem acessar esta área"
            className={`group flex flex-col items-center justify-between rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-[#181818cc] to-[#212121] p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-yellow-400 hover:shadow-[0_0_16px_2px_#FFD60090] sm:p-6 ${
              isAdmin ? "cursor-pointer" : "cursor-not-allowed"
            } min-h-[280px]`}
          >
            <div className="absolute left-0 right-0 top-0 flex justify-center">
              <span className="rounded-b-2xl bg-red-600 px-4 py-1 text-xs font-bold tracking-wide text-white shadow-md">
                ÁREA RESTRITA PARA ADMINISTRADORES
              </span>
            </div>
            <div className="mb-4 mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#222] transition group-hover:bg-yellow-400/90 sm:mb-6 sm:h-16 sm:w-16">
              <FaRandom className="text-2xl text-yellow-400 transition group-hover:text-black sm:text-4xl" />
            </div>
            <span className="mb-1 text-center text-base font-bold text-white sm:mb-2 sm:text-lg">
              Sorteio Inteligente
            </span>
            <span className="text-textoSuave mb-4 text-center text-xs sm:mb-6 sm:text-base">
              Gere times equilibrados usando o sistema exclusivo.
            </span>
            {isAdmin ? (
              <Link href="/admin/sorteio-inteligente">
                <span className="mt-auto rounded-xl bg-yellow-400 px-5 py-2 text-xs font-semibold text-black transition sm:text-base">
                  Acessar
                </span>
              </Link>
            ) : (
              <span className="mt-auto cursor-not-allowed rounded-xl border border-yellow-400 bg-[#222] px-5 py-2 text-xs font-semibold text-yellow-400 opacity-80 sm:text-base">
                Acesso restrito
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
