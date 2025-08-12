import type { RankingAtleta } from "@/types/estatisticas";

export const melhoresAtacantesAnual: Record<number, RankingAtleta[]> = {
  2025: [
    {
      id: 1,
      nome: "Matheus Silva",
      slug: "matheus-silva",
      foto: "/images/jogadores/jogador_padrao_01.jpg",
      pontos: 640,
      jogos: 50,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols: 0,
      assistencias: 0,
    },
    // ...outros atacantes
  ],
  2024: [
    // ...outros anos
  ],
};
