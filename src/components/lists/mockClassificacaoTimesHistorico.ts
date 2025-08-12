// src/components/lists/mockClassificacaoTimesHistorico.ts

import type { TimeClassificacao } from "@/types/estatisticas";

export const classificacaoTimesHistorico: TimeClassificacao[] = [
  {
    id: "1",
    nome: "Time Falcões",
    logo: "/images/times/time_falcoes.png",
    pontos: 85,
    jogos: 45,
    vitorias: 27,
    empates: 4,
    derrotas: 14,
    golsPro: 99,
    golsContra: 61,
    saldoGols: 38,
  },
  {
    id: "2",
    nome: "Leões da Serra",
    logo: "/images/times/leoes_serra.png",
    pontos: 79,
    jogos: 45,
    vitorias: 23,
    empates: 10,
    derrotas: 12,
    golsPro: 92,
    golsContra: 70,
    saldoGols: 22,
  },
  // ...adicione mais times se quiser
];
