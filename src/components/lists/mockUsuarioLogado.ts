export const usuarioLogadoMock = {
  slug: "matheus-silva",
  foto: "/images/jogadores/jogador_padrao_01.jpg",
  nome: "Matheus Silva",
  apelido: "Matheusão",
  posicao: "Meia",
  status: "Ativo",
  mensalista: false, // <--- AGORA NÃO É MENSALISTA
  ultimaPartida: "2025-06-20",
  totalJogos: 120,
  estatisticas: {
    anual: {
      2025: {
        jogos: 120,
        gols: 45,
        assistencias: 30,
        campeaoDia: 22,
        mediaVitorias: 0.67,
        pontuacao: 1320,
      },
    },
    historico: {
      jogos: 245,
      gols: 102,
      assistencias: 58,
      campeaoDia: 39,
      mediaVitorias: 0.61,
      pontuacao: 2580,
    },
  },
  conquistas: {
    titulosGrandesTorneios: [
      {
        ano: 2023,
        nome: "Campeão Torneio 2023",
        icone: "🏆",
        descricao: "Torneio Interclubes Fut7",
      },
    ],
    titulosAnuais: [
      {
        ano: 2024,
        nome: "Artilheiro do Ano",
        icone: "🥇",
        descricao: "Maior artilheiro da temporada",
      },
    ],
    titulosQuadrimestrais: [
      {
        periodo: "Jan-Abr 2024",
        ano: 2024,
        nome: "Destaque Quadrimestre",
        icone: "✨",
        descricao: "Jogador destaque no quadrimestre",
      },
    ],
  },
  historico: [
    {
      data: "2025-06-20",
      adversario: "Time Azul",
      resultado: "Vitória",
      gols: 2,
      assistencias: 1,
      nota: 8.0,
      time: "Time Branco",
      campeao: true,
      pontuacao: 120,
    },
    {
      data: "2025-06-13",
      adversario: "Time Vermelho",
      resultado: "Empate",
      gols: 0,
      assistencias: 2,
      nota: 7.2,
      time: "Time Branco",
      campeao: false,
      pontuacao: 90,
    },
    {
      data: "2025-06-05",
      adversario: "Time Laranja",
      resultado: "Derrota",
      gols: 1,
      assistencias: 0,
      nota: 6.5,
      time: "Time Branco",
      campeao: false,
      pontuacao: 65,
    },
  ],
};
