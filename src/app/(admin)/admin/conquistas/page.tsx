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

      <main className="min-h-screen bg-fundo text-white px-4 pt-[64px] md:pt-[80px] pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 text-center">
            Gestão de Conquistas
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Gerencie de forma simples e organizada todos os títulos, premiações e conquistas do seu
            racha. Ao finalizar a temporada, os Campeões do Ano são gerados automaticamente. Você
            também pode registrar os campeões dos Grandes Torneios, como campeonatos internos, copas
            e eventos especiais. Todos os ícones de conquistas são exibidos de forma automática nos
            perfis dos atletas, valorizando suas trajetórias e incentivando a competitividade.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/admin/conquistas/os-campeoes"
              className="flex flex-col items-center bg-zinc-900 border-2 border-yellow-400 rounded-xl p-6 hover:shadow-xl transition group w-full sm:w-1/2"
            >
              <FaCrown className="text-yellow-400 text-4xl mb-3 group-hover:scale-110 transition" />
              <span className="font-bold text-lg text-yellow-300 mb-1">Os Campeões</span>
              <span className="text-gray-300 text-center text-sm">
                Finalize a temporada para gerar os campeões do ano. Se não finalizar, o sistema
                encerrará automaticamente na virada do ano.
                <br />
                Controle automático dos ícones de premiação.
              </span>
            </Link>

            <Link
              href="/admin/conquistas/grandes-torneios"
              className="flex flex-col items-center bg-zinc-900 border-2 border-yellow-400 rounded-xl p-6 hover:shadow-xl transition group w-full sm:w-1/2"
            >
              <FaTrophy className="text-yellow-400 text-4xl mb-3 group-hover:scale-110 transition" />
              <span className="font-bold text-lg text-yellow-300 mb-1">Grandes Torneios</span>
              <span className="text-gray-300 text-center text-sm">
                Cadastre ou edite torneios especiais, campeonatos de confraternização e campeões
                históricos do seu racha.
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
