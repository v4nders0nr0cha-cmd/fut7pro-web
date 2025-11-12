// src/components/lists/mockTorneios.ts

import type { Torneio } from "@/types/torneio";

export const torneiosMock: Torneio[] = [
  {
    id: "torneio-1",
    rachaId: "racha-1",
    nome: "Torneio Matador 2025",
    slug: "torneio-matador-2025",
    ano: 2025,
    campeao: "Matheus Silva",
    banner: "/images/torneios/torneio-matador.jpg",
    logo: "/images/times/time_padrao_04.png",
    jogadoresCampeoes: ["matheus-silva", "lucas-rocha", "paredao"],
  },
  {
    id: "torneio-2",
    rachaId: "racha-1",
    nome: "Copa dos Campeões 2025",
    slug: "copa-dos-campeoes-2025",
    ano: 2025,
    campeao: "Craque Master",
    banner: "/images/torneios/copa-campeoes.jpg",
    logo: "/images/times/time_padrao_01.png",
    jogadoresCampeoes: ["craque-master", "meia-artista", "zagueiro-mito"],
  },
  {
    id: "torneio-3",
    rachaId: "racha-1",
    nome: "Torneio Relâmpago 2024",
    slug: "torneio-relampago-2024",
    ano: 2024,
    campeao: "Goleador King",
    banner: "/images/torneios/torneio-relampago.jpg",
    logo: "/images/times/time_padrao_02.png",
    jogadoresCampeoes: ["goleador-king", "armador-x", "defensor-y"],
  },
  {
    id: "torneio-4",
    rachaId: "racha-2",
    nome: "Desafio dos Lendários 2023",
    slug: "desafio-dos-lendarios-2023",
    ano: 2023,
    campeao: "Lenda Viva",
    banner: "/images/torneios/desafio-lendarios.jpg",
    logo: "/images/times/time_padrao_03.png",
    jogadoresCampeoes: ["lenda-viva", "meia-z", "goleiro-hero"],
  },
];
