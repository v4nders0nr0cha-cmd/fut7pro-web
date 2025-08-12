import type { RankingAtleta } from "@/types/estatisticas";

export const artilheirosAnual: Record<number, RankingAtleta[]> = {
  2025: [
    {
      id: 1,
      nome: "Matheus Silva",
      slug: "matheus-silva",
      foto: "/images/jogadores/jogador_padrao_01.jpg",
      pontos: 0,
      jogos: 50,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols: 42,
      assistencias: 0,
    },
    {
      id: 2,
      nome: "Lucas Rocha",
      slug: "lucas-rocha",
      foto: "/images/jogadores/jogador_padrao_02.jpg",
      pontos: 0,
      jogos: 44,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols: 28,
      assistencias: 0,
    },
  ],
  2024: [
    {
      id: 1,
      nome: "Pedro Lima",
      slug: "pedro-lima",
      foto: "/images/jogadores/jogador_padrao_04.jpg",
      pontos: 0,
      jogos: 46,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols: 34,
      assistencias: 0,
    },
  ],
};
