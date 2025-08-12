import type { RankingAtleta } from "@/types/estatisticas";

export const rankingsAnuais: Record<number, RankingAtleta[]> = {
  2025: [
    {
      id: "1", // Corrigido para string
      nome: "Matheus Silva",
      slug: "matheus-silva",
      foto: "/images/jogadores/jogador_padrao_01.jpg",
      pontos: 1100,
      jogos: 50,
      vitorias: 28,
      empates: 12,
      derrotas: 10,
      gols: 42,
      assistencias: 21,
    },
    {
      id: "2",
      nome: "Lucas Rocha",
      slug: "lucas-rocha",
      foto: "/images/jogadores/jogador_padrao_02.jpg",
      pontos: 950,
      jogos: 44,
      vitorias: 20,
      empates: 15,
      derrotas: 9,
      gols: 19,
      assistencias: 13,
    },
    {
      id: "3",
      nome: "João Pedro",
      slug: "joao-pedro",
      foto: "/images/jogadores/jogador_padrao_03.jpg",
      pontos: 870,
      jogos: 40,
      vitorias: 18,
      empates: 12,
      derrotas: 10,
      gols: 15,
      assistencias: 10,
    },
  ],
  2024: [
    // Exemplo para preencher futuramente
    // {
    //   id: "1",
    //   nome: "Fulano 2024",
    //   slug: "fulano-2024",
    //   foto: "/images/jogadores/jogador_padrao_06.jpg",
    //   pontos: 800,
    //   jogos: 38,
    //   vitorias: 22,
    //   empates: 10,
    //   derrotas: 6,
    //   gols: 17,
    //   assistencias: 14,
    // },
  ],
};
