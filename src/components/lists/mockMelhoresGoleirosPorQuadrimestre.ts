import type { RankingAtleta } from "@/types/estatisticas";

export const melhoresGoleirosPorQuadrimestre: Record<number, Record<1 | 2 | 3, RankingAtleta[]>> = {
  2025: {
    1: [
      {
        id: 12,
        nome: "Rafael Goleiro",
        slug: "rafael-goleiro",
        foto: "/images/jogadores/jogador_padrao_12.jpg",
        pontos: 120,
        jogos: 13,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
      {
        id: 13,
        nome: "Carlos Paredão",
        slug: "carlos-paredao",
        foto: "/images/jogadores/jogador_padrao_13.jpg",
        pontos: 100,
        jogos: 11,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
    ],
    2: [
      {
        id: 14,
        nome: "Tiago Seguro",
        slug: "tiago-seguro",
        foto: "/images/jogadores/jogador_padrao_14.jpg",
        pontos: 105,
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
        id: 12,
        nome: "Lucas Muralha",
        slug: "lucas-muralha",
        foto: "/images/jogadores/jogador_padrao_15.jpg",
        pontos: 90,
        jogos: 9,
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
