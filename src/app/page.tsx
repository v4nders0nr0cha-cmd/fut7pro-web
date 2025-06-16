"use client";

import Head from "next/head";
import ChampionBanner from "@/components/cards/ChampionBanner";
import PlayerCard from "@/components/cards/PlayerCard";
import GameCard from "@/components/cards/GameCard";
import GamesOfTheDay from "@/components/cards/GamesOfTheDay";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import Card from "@/components/cards/Card";
import { partidas } from "@/components/lists/mockPartidas";
import { Tooltip } from "react-tooltip";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fut7Pro – Sistema de Racha e Futebol 7</title>
        <meta
          name="description"
          content="Fut7Pro é o sistema ideal para gerenciar rachas, estatísticas e conquistas no futebol 7 entre amigos."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, sistema de racha, sorteio de times, ranking, futebol amador"
        />
      </Head>

      <main className="px-4 pb-10 pt-6">
        <h1 className="sr-only">Fut7Pro: Sistema para Racha, Fut7 e Futebol Amador</h1>

        {/* Banner Campeão */}
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
        />

        {/* Jogadores do Dia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-10">
          <Tooltip id="tooltip" place="top" className="z-50" />

          <div data-tooltip-id="tooltip" data-tooltip-content="3 gols">
            <PlayerCard
              title="Atacante do Dia"
              name="Jogador XPTO"
              value="3 gols"
              image="/images/jogadores/jogador_padrao_01.jpg"
              href="/estatisticas/atacantes"
            />
          </div>

          <div data-tooltip-id="tooltip" data-tooltip-content="2 assistências">
            <PlayerCard
              title="Meia do Dia"
              name="Jogador Genérico"
              value="2 assistências"
              image="/images/jogadores/jogador_padrao_02.jpg"
              href="/estatisticas/meias"
            />
          </div>

          <div data-tooltip-id="tooltip" data-tooltip-content="Melhor zagueiro do dia">
            <PlayerCard
              title="Zagueiro do Dia"
              name="Jogador Modelo"
              value="5 desarmes"
              image="/images/jogadores/jogador_padrao_03.jpg"
              href="/estatisticas/zagueiros"
            />
          </div>

          <div data-tooltip-id="tooltip" data-tooltip-content="Melhor goleiro do dia">
            <PlayerCard
              title="Goleiro do Dia"
              name="Jogador Fictício"
              value="4 defesas"
              image="/images/jogadores/jogador_padrao_04.jpg"
              href="/estatisticas/goleiros"
            />
          </div>
        </div>

        {/* Navegação rápida por recursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card title="🏆 Campeões" description="Veja quem se destacou nos rachas." />
          <Card title="📊 Estatísticas" description="Acompanhe sua performance em tempo real." />
          <Card title="🎯 Ranking" description="Compare seu desempenho com os melhores." />
          <Card
            title="🎮 Sorteio Inteligente"
            description="Equipes equilibradas com base no histórico."
          />
          <Card title="🔥 Conquistas" description="Colecione medalhas e evolua seu perfil." />
          <Card
            title="💬 Tira Teima"
            description="Compare jogadores lado a lado com dados reais."
          />
        </div>

        {/* Jogos do Dia + Classificação dos Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="cursor-pointer">
            <GamesOfTheDay partidas={partidas} />
          </div>

          <TopTeamsCard />
        </div>
      </main>
    </>
  );
}
