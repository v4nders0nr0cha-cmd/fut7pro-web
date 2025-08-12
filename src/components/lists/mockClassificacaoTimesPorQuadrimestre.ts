import type { TimeClassificacao } from "@/types/estatisticas";

export const classificacaoTimesPorQuadrimestre: Record<
  number,
  Record<1 | 2 | 3, TimeClassificacao[]>
> = {
  2025: {
    1: [
      {
        id: 1,
        nome: "Time Falcões",
        logo: "/images/times/time_padrao_01.png",
        pontos: 18,
        jogos: 8,
        vitorias: 6,
        empates: 0,
        derrotas: 2,
        golsPro: 17,
        golsContra: 8,
        saldoGols: 9,
      },
      {
        id: 2,
        nome: "Leões da Serra",
        logo: "/images/times/time_padrao_02.png",
        pontos: 16,
        jogos: 8,
        vitorias: 5,
        empates: 1,
        derrotas: 2,
        golsPro: 14,
        golsContra: 10,
        saldoGols: 4,
      },
    ],
    2: [],
    3: [],
  },
  2024: {
    1: [
      {
        id: 1,
        nome: "Águias Urbanas",
        logo: "/images/times/time_padrao_03.png",
        pontos: 12,
        jogos: 8,
        vitorias: 4,
        empates: 0,
        derrotas: 4,
        golsPro: 10,
        golsContra: 13,
        saldoGols: -3,
      },
    ],
    2: [],
    3: [],
  },
};
