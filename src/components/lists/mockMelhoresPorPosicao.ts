// src/components/lists/mockMelhoresPorPosicao.ts

export type MelhorPorPosicaoItem = {
  ano: number;
  posicao: "Atacante do Ano" | "Meia do Ano" | "Zagueiro do Ano" | "Goleiro do Ano";
  nome: string;
  slug: string;
  image: string;
  valor: string;
  icone: string;
  href: string;
  temporario?: boolean;
};

export const melhoresPorPosicao: MelhorPorPosicaoItem[] = [
  // 2025
  {
    ano: 2025,
    posicao: "Atacante do Ano",
    nome: "Matheus Silva",
    slug: "matheus-silva",
    image: "/images/jogadores/jogador_padrao_01.jpg",
    valor: "45 gols",
    icone: "/images/icons/chuteira-de-ouro.png",
    href: "/estatisticas/artilheiros",
    temporario: true,
  },
  {
    ano: 2025,
    posicao: "Meia do Ano",
    nome: "Lucas Rocha",
    slug: "lucas-rocha",
    image: "/images/jogadores/jogador_padrao_02.jpg",
    valor: "30 assistências",
    icone: "/images/icons/chuteira-de-ouro.png",
    href: "/estatisticas/assistencias",
    temporario: true,
  },
  {
    ano: 2025,
    posicao: "Zagueiro do Ano",
    nome: "Murão Rocha",
    slug: "murao-rocha",
    image: "/images/jogadores/jogador_padrao_03.jpg",
    valor: "Melhor índice defensivo",
    icone: "🛡️",
    href: "/estatisticas/ranking-geral",
    temporario: true,
  },
  {
    ano: 2025,
    posicao: "Goleiro do Ano",
    nome: "Muriel Defensor",
    slug: "muriel-defensor",
    image: "/images/jogadores/jogador_padrao_04.jpg",
    valor: "Menor média de gols sofridos",
    icone: "/images/icons/luva-de-ouro.png",
    href: "/estatisticas/ranking-geral",
    temporario: true,
  },
  // 2024
  {
    ano: 2024,
    posicao: "Atacante do Ano",
    nome: "Matador X",
    slug: "matador-x",
    image: "/images/jogadores/jogador_padrao_04.jpg",
    valor: "27 gols",
    icone: "⚽",
    href: "/estatisticas/artilheiros",
  },
  {
    ano: 2024,
    posicao: "Meia do Ano",
    nome: "Arthur Maia",
    slug: "arthur-maia",
    image: "/images/jogadores/jogador_padrao_05.jpg",
    valor: "18 assistências",
    icone: "/images/icons/chuteira-de-ouro.png",
    href: "/estatisticas/assistencias",
  },
  {
    ano: 2024,
    posicao: "Zagueiro do Ano",
    nome: "Defensor Y",
    slug: "defensor-y",
    image: "/images/jogadores/jogador_padrao_06.jpg",
    valor: "Melhor índice defensivo",
    icone: "🛡️",
    href: "/estatisticas/ranking-geral",
  },
  {
    ano: 2024,
    posicao: "Goleiro do Ano",
    nome: "Goleiro Hero",
    slug: "goleiro-hero",
    image: "/images/jogadores/jogador_padrao_06.jpg",
    valor: "Menor média de gols sofridos",
    icone: "/images/icons/luva-de-ouro.png",
    href: "/estatisticas/ranking-geral",
  },
  // 2023
  {
    ano: 2023,
    posicao: "Atacante do Ano",
    nome: "Canhão de Ouro",
    slug: "canhao-de-ouro",
    image: "/images/jogadores/jogador_padrao_06.jpg",
    valor: "34 gols",
    icone: "⚽",
    href: "/estatisticas/artilheiros",
  },
  {
    ano: 2023,
    posicao: "Meia do Ano",
    nome: "Jean Passador",
    slug: "jean-passador",
    image: "/images/jogadores/jogador_padrao_07.jpg",
    valor: "25 assistências",
    icone: "/images/icons/chuteira-de-ouro.png",
    href: "/estatisticas/assistencias",
  },
  {
    ano: 2023,
    posicao: "Zagueiro do Ano",
    nome: "Zagueiro Mito",
    slug: "zagueiro-mito",
    image: "/images/jogadores/jogador_padrao_03.jpg",
    valor: "Melhor índice defensivo",
    icone: "🛡️",
    href: "/estatisticas/ranking-geral",
  },
  {
    ano: 2023,
    posicao: "Goleiro do Ano",
    nome: "Paredão 2023",
    slug: "paredao-2023",
    image: "/images/jogadores/jogador_padrao_02.jpg",
    valor: "Menor média de gols sofridos",
    icone: "/images/icons/luva-de-ouro.png",
    href: "/estatisticas/ranking-geral",
  },
];
