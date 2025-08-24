import type { RankingAtleta } from "@/types/estatisticas";

export const rankingsPorQuadrimestre: Record<
  number,
  Record<1 | 2 | 3, RankingAtleta[]>
> = {
  2025: {
    1: [
      {
        id: "1",
        nome: "Matheus Silva",
        slug: "matheus-silva",
        foto: "/images/jogadores/jogador_padrao_01.jpg",
        pontos: 350,
        jogos: 18,
        vitorias: 11,
        empates: 4,
        derrotas: 3,
        gols: 14,
        assistencias: 9,
      },
      {
        id: "2",
        nome: "Lucas Rocha",
        slug: "lucas-rocha",
        foto: "/images/jogadores/jogador_padrao_02.jpg",
        pontos: 288,
        jogos: 15,
        vitorias: 7,
        empates: 5,
        derrotas: 3,
        gols: 8,
        assistencias: 7,
      },
    ],
    2: [
      {
        id: "1",
        nome: "João Pedro",
        slug: "joao-pedro",
        foto: "/images/jogadores/jogador_padrao_03.jpg",
        pontos: 320,
        jogos: 16,
        vitorias: 9,
        empates: 4,
        derrotas: 3,
        gols: 12,
        assistencias: 8,
      },
    ],
    3: [],
  },
  2024: {
    1: [
      {
        id: "1",
        nome: "Pedro Lima",
        slug: "pedro-lima",
        foto: "/images/jogadores/jogador_padrao_04.jpg",
        pontos: 310,
        jogos: 15,
        vitorias: 8,
        empates: 5,
        derrotas: 2,
        gols: 11,
        assistencias: 7,
      },
    ],
    2: [],
    3: [],
  },
};
