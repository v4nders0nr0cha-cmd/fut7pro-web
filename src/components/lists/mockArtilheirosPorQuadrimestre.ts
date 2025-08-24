import type { RankingAtleta } from "@/types/estatisticas";

export const artilheirosPorQuadrimestre: Record<
  number,
  Record<1 | 2 | 3, RankingAtleta[]>
> = {
  2025: {
    1: [
      {
        id: 1,
        nome: "Matheus Silva",
        slug: "matheus-silva",
        foto: "/images/jogadores/jogador_padrao_01.jpg",
        pontos: 0,
        jogos: 18,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 14,
        assistencias: 0,
      },
      {
        id: 2,
        nome: "Lucas Rocha",
        slug: "lucas-rocha",
        foto: "/images/jogadores/jogador_padrao_02.jpg",
        pontos: 0,
        jogos: 15,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 8,
        assistencias: 0,
      },
    ],
    2: [],
    3: [],
  },
  2024: {
    1: [
      {
        id: 1,
        nome: "Pedro Lima",
        slug: "pedro-lima",
        foto: "/images/jogadores/jogador_padrao_04.jpg",
        pontos: 0,
        jogos: 15,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 11,
        assistencias: 0,
      },
    ],
    2: [],
    3: [],
  },
};
