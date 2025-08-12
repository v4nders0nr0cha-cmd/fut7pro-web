import type { Atleta } from "@/types/atletas";
import type { ConquistasAtleta } from "@/types/estatisticas";

export const atletasMock: Atleta[] = [
  {
    id: 1,
    nome: "Matheus Silva",
    apelido: "Matheusão",
    slug: "matheus-silva",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    posicao: "Meia",
    status: "Ativo",
    mensalista: true,
    ultimaPartida: "2025-06-10",

    totalJogos: 200,

    estatisticas: {
      historico: {
        jogos: 200,
        gols: 80,
        assistencias: 60,
        campeaoDia: 38,
        mediaVitorias: 0.66,
        pontuacao: 2200,
      },
      anual: {
        2025: {
          jogos: 120,
          gols: 45,
          assistencias: 30,
          campeaoDia: 22,
          mediaVitorias: 0.67,
          pontuacao: 1320,
        },
        2024: {
          jogos: 80,
          gols: 35,
          assistencias: 30,
          campeaoDia: 16,
          mediaVitorias: 0.6,
          pontuacao: 880,
        },
      },
    },

    historico: [
      {
        data: "2025-06-10",
        time: "Time Lendários",
        resultado: "5x3",
        gols: 2,
        campeao: true,
        pontuacao: 14,
      },
      {
        data: "2025-05-29",
        time: "Time Fênix",
        resultado: "2x2",
        gols: 1,
        campeao: false,
        pontuacao: 9,
      },
    ],

    conquistas: {
      titulosGrandesTorneios: [{ descricao: "Campeão Torneio 2023", ano: 2023, icone: "🏆" }],
      titulosAnuais: [{ descricao: "Artilheiro 2024", ano: 2024, icone: "⚽" }],
      titulosQuadrimestrais: [{ descricao: "Melhor Jogador Quadrimestre", ano: 2025, icone: "🥇" }],
    } as ConquistasAtleta,
  },
  {
    id: 2,
    nome: "Lucas Rocha",
    apelido: null,
    slug: "lucas-rocha",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    posicao: "Zagueiro",
    status: "Inativo",
    mensalista: false,
    ultimaPartida: "2025-02-10",

    totalJogos: 120,

    estatisticas: {
      historico: {
        jogos: 120,
        gols: 20,
        assistencias: 22,
        campeaoDia: 18,
        mediaVitorias: 0.58,
        pontuacao: 900,
      },
      anual: {
        2025: {
          jogos: 88,
          gols: 5,
          assistencias: 8,
          campeaoDia: 10,
          mediaVitorias: 0.54,
          pontuacao: 720,
        },
        2024: {
          jogos: 32,
          gols: 15,
          assistencias: 14,
          campeaoDia: 8,
          mediaVitorias: 0.65,
          pontuacao: 180,
        },
      },
    },

    historico: [
      {
        data: "2025-02-10",
        time: "Time Guerreiros",
        resultado: "1x3",
        gols: 0,
        campeao: false,
        pontuacao: 6,
      },
      {
        data: "2025-01-28",
        time: "Time Leões",
        resultado: "3x0",
        gols: 0,
        campeao: true,
        pontuacao: 12,
      },
    ],

    conquistas: {
      titulosGrandesTorneios: [{ descricao: "Campeão Torneio Guerreiros", ano: 2023, icone: "🏆" }],
      titulosAnuais: [{ descricao: "Zagueiro do Ano", ano: 2024, icone: "🥇" }],
      titulosQuadrimestrais: [],
    } as ConquistasAtleta,
  },
];
