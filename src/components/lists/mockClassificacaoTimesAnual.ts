import type { TimeClassificacao } from "@/types/estatisticas";

export const classificacaoTimesAnual: Record<number, TimeClassificacao[]> = {
  2025: [
    {
      id: 1,
      nome: "Time Falcões",
      logo: "/images/times/time_padrao_01.png",
      pontos: 48,
      jogos: 20,
      vitorias: 15,
      empates: 3,
      derrotas: 2,
      golsPro: 42,
      golsContra: 18,
      saldoGols: 24,
    },
    {
      id: 2,
      nome: "Leões da Serra",
      logo: "/images/times/time_padrao_02.png",
      pontos: 45,
      jogos: 20,
      vitorias: 14,
      empates: 3,
      derrotas: 3,
      golsPro: 40,
      golsContra: 20,
      saldoGols: 20,
    },
  ],
  2024: [
    {
      id: 1,
      nome: "Águias Urbanas",
      logo: "/images/times/time_padrao_03.png",
      pontos: 39,
      jogos: 20,
      vitorias: 12,
      empates: 3,
      derrotas: 5,
      golsPro: 35,
      golsContra: 26,
      saldoGols: 9,
    },
  ],
};
