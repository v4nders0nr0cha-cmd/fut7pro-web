import type { RankingAtleta } from "@/types/estatisticas";

export const melhoresZagueirosPorQuadrimestre: Record<
  number,
  Record<1 | 2 | 3, RankingAtleta[]>
> = {
  2025: {
    1: [
      {
        id: 7,
        nome: "Bruno Zaga",
        slug: "bruno-zaga",
        foto: "/images/jogadores/jogador_padrao_08.jpg",
        pontos: 155,
        jogos: 15,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
      {
        id: 8,
        nome: "Eduardo Muralha",
        slug: "eduardo-muralha",
        foto: "/images/jogadores/jogador_padrao_09.jpg",
        pontos: 140,
        jogos: 14,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
    ],
    2: [
      {
        id: 9,
        nome: "Luís Defensor",
        slug: "luis-defensor",
        foto: "/images/jogadores/jogador_padrao_10.jpg",
        pontos: 120,
        jogos: 12,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
    ],
    3: [],
  },
  2024: {
    1: [
      {
        id: 7,
        nome: "Vitor Fortão",
        slug: "vitor-fortao",
        foto: "/images/jogadores/jogador_padrao_11.jpg",
        pontos: 110,
        jogos: 11,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
    ],
    2: [],
    3: [],
  },
};
