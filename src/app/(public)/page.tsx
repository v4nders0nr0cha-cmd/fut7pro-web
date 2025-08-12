"use client";

import ChampionBanner from "@/components/cards/ChampionBanner";
import GamesOfTheDayMobileModal from "@/components/cards/GamesOfTheDayMobileModal";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import Card from "@/components/cards/Card";
import Sidebar from "@/components/layout/Sidebar";
import PlayerCard from "@/components/cards/PlayerCard";
import GamesOfTheDay from "@/components/cards/GamesOfTheDay";
import { usePartidas } from "@/hooks/usePartidas";
import { Shuffle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const isAdmin = false;

const destaquesDia = [
  {
    title: "Atacante do Dia",
    name: "Matheus Silva",
    value: "3 gols",
    image: "/images/jogadores/jogador_padrao_01.jpg",
    href: "/atletas/matheus-silva",
  },
  {
    title: "Meia do Dia",
    name: "João Genérico",
    value: "2 assistências",
    image: "/images/jogadores/jogador_padrao_02.jpg",
    href: "/atletas/joao-generico",
  },
  {
    title: "Zagueiro do Dia",
    name: "Carlos Modelo",
    value: "",
    image: "/images/jogadores/jogador_padrao_03.jpg",
    href: "/atletas/carlos-modelo",
  },
  {
    title: "Goleiro do Dia",
    name: "Felipe Fictício",
    value: "",
    image: "/images/jogadores/jogador_padrao_04.jpg",
    href: "/atletas/felipe-ficticio",
  },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const { partidas, isLoading, isError } = usePartidas();

  return (
    <>
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10 flex flex-col lg:flex-row gap-8">
        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1">
          <h1 className="sr-only">Fut7Pro: Sistema para Racha, Fut7 e Futebol Amador</h1>

          <ChampionBanner
            image="/images/times/time_campeao_padrao_01.png"
            date="Segunda-Feira, 9 de junho de 2025"
            players={[
              "Jogador 01",
              "Jogador 02",
              "Jogador 03",
              "Jogador 04",
              "Jogador 05",
              "Jogador 06",
              "Jogador 07",
            ]}
            href="/partidas/historico"
          />

          {/* GRID DESTAQUES DO DIA - Desktop: Sempre visível; Mobile: sumir e usar modal */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mt-6 mb-10">
            {destaquesDia.map((destaque) => (
              <PlayerCard
                key={destaque.title}
                title={destaque.title}
                name={destaque.name}
                value={destaque.value}
                image={destaque.image}
                href={destaque.href}
              />
            ))}
          </div>

          {/* Só MOBILE: Botão "Ver todos os destaques do dia" */}
          <div className="block lg:hidden my-6">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 transition text-black font-bold rounded-xl py-3 text-base shadow-lg"
            >
              Ver todos os destaques do dia
            </button>
            <GamesOfTheDayMobileModal open={modalOpen} onClose={() => setModalOpen(false)} />
          </div>

          {/* CARDS PRINCIPAIS COM LINKS E ORDEM CORRETA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            <Link href="/atletas">
              <Card title="🔥 Conquistas" description="Colecione medalhas e evolua seu perfil." />
            </Link>
            <Link href="/estatisticas/ranking-geral">
              <Card title="🎯 Ranking" description="Compare seu desempenho com os melhores." />
            </Link>
            <Link href="/os-campeoes">
              <Card title="🏆 Campeões" description="Veja quem se destacou nos rachas." />
            </Link>
            <Link href="/estatisticas/tira-teima">
              <Card
                title="💬 Tira Teima"
                description="Compare jogadores lado a lado com dados reais."
              />
            </Link>
            <Link href="/estatisticas">
              <Card
                title="📊 Estatísticas"
                description="Acompanhe sua performance em tempo real."
              />
            </Link>
            {/* Sorteio Inteligente só é clicável para admin */}
            {isAdmin ? (
              <Link href="/admin/partidas/sorteio-inteligente">
                <Card
                  title="Sorteio Inteligente"
                  description="Equipes equilibradas com base no histórico."
                  icon={<Shuffle size={22} className="text-[#FFCC00] -ml-1" />}
                  restricted={true}
                  isAdmin={isAdmin}
                />
              </Link>
            ) : (
              <Card
                title="Sorteio Inteligente"
                description="Equipes equilibradas com base no histórico."
                icon={<Shuffle size={22} className="text-[#FFCC00] -ml-1" />}
                restricted={true}
                isAdmin={isAdmin}
              />
            )}
          </div>

          {/* GRID "JOGOS DO DIA" + "CLASSIFICAÇÃO DOS TIMES" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="cursor-pointer">
              <GamesOfTheDay partidas={partidas} isLoading={isLoading} isError={isError} />
            </div>
            <TopTeamsCard />
          </div>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-[340px] flex-shrink-0">
          <Sidebar />
        </aside>
      </div>
    </>
  );
}
