"use client";

import Head from "next/head";
import Link from "next/link";
import { FaCrown, FaTrophy } from "react-icons/fa";

export default function ConquistasAdminPage() {
  return (
    <>
      <Head>
        <title>Gestão de Conquistas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie campeões do ano, torneios especiais e premiações do seu racha com automação de ícones e destaques nos perfis dos jogadores."
        />
        <meta
          name="keywords"
          content="conquistas racha, campeões fut7, torneios internos, gestão de premiações, painel admin fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-[64px] text-white md:pb-8 md:pt-[80px]">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-3 text-center text-3xl font-bold text-yellow-400">
            Gestão de Conquistas
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-gray-300">
            Gerencie de forma simples e organizada todos os títulos, premiações
            e conquistas do seu racha. Ao finalizar a temporada, os Campeões do
            Ano são gerados automaticamente. Você também pode registrar os
            campeões dos Grandes Torneios, como campeonatos internos, copas e
            eventos especiais. Todos os ícones de conquistas são exibidos de
            forma automática nos perfis dos atletas, valorizando suas
            trajetórias e incentivando a competitividade.
          </p>

          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href="/admin/conquistas/os-campeoes"
              className="group flex w-full flex-col items-center rounded-xl border-2 border-yellow-400 bg-zinc-900 p-6 transition hover:shadow-xl sm:w-1/2"
            >
              <FaCrown className="mb-3 text-4xl text-yellow-400 transition group-hover:scale-110" />
              <span className="mb-1 text-lg font-bold text-yellow-300">
                Os Campeões
              </span>
              <span className="text-center text-sm text-gray-300">
                Finalize a temporada para gerar os campeões do ano. Se não
                finalizar, o sistema encerrará automaticamente na virada do ano.
                <br />
                Controle automático dos ícones de premiação.
              </span>
            </Link>

            <Link
              href="/admin/conquistas/grandes-torneios"
              className="group flex w-full flex-col items-center rounded-xl border-2 border-yellow-400 bg-zinc-900 p-6 transition hover:shadow-xl sm:w-1/2"
            >
              <FaTrophy className="mb-3 text-4xl text-yellow-400 transition group-hover:scale-110" />
              <span className="mb-1 text-lg font-bold text-yellow-300">
                Grandes Torneios
              </span>
              <span className="text-center text-sm text-gray-300">
                Cadastre ou edite torneios especiais, campeonatos de
                confraternização e campeões históricos do seu racha.
                <br />
                Premiações aparecem automaticamente no perfil dos atletas.
              </span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
