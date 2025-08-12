// src/components/lists/mockRankingHistorico.ts

import type { RankingAtleta } from "@/types/estatisticas";

export const rankingHistorico: RankingAtleta[] = [
  {
    id: "1",
    nome: "Carlos Santana",
    slug: "carlos-santana",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    pontos: 480,
    jogos: 210,
    vitorias: 134,
    empates: 28,
    derrotas: 48,
    gols: 139,
    assistencias: 62,
  },
  {
    id: "2",
    nome: "Renato Souza",
    slug: "renato-souza",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    pontos: 465,
    jogos: 205,
    vitorias: 128,
    empates: 30,
    derrotas: 47,
    gols: 120,
    assistencias: 71,
  },
  {
    id: "3",
    nome: "Thiago Oliveira",
    slug: "thiago-oliveira",
    foto: "/images/jogadores/jogador_padrao_03.jpg",
    pontos: 452,
    jogos: 198,
    vitorias: 125,
    empates: 33,
    derrotas: 40,
    gols: 98,
    assistencias: 88,
  },
  // Adicione mais atletas fictícios conforme quiser
];
