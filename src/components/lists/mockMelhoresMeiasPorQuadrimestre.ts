import type { RankingAtleta } from "@/types/estatisticas";

export const melhoresMeiasPorQuadrimestre: Record<
  number,
  Record<1 | 2 | 3, RankingAtleta[]>
> = {
  2025: {
    1: [
      {
        id: 4,
        nome: "Diego Meia",
        slug: "diego-meia",
        foto: "/images/jogadores/jogador_padrao_04.jpg",
        pontos: 180,
        jogos: 17,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
      {
        id: 5,
        nome: "Arthur Maestro",
        slug: "arthur-maestro",
        foto: "/images/jogadores/jogador_padrao_05.jpg",
        pontos: 155,
        jogos: 15,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols: 0,
        assistencias: 0,
      },
    ],
    2: [
      {
        id: 6,
        nome: "Renato Organizador",
        slug: "renato-organizador",
        foto: "/images/jogadores/jogador_padrao_06.jpg",
        pontos: 160,
        jogos: 16,
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
        id: 4,
        nome: "Marcelo Visionário",
        slug: "marcelo-visionario",
        foto: "/images/jogadores/jogador_padrao_07.jpg",
        pontos: 150,
        jogos: 14,
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
