// src/components/lists/mockQuadrimestres.ts

import type { QuadrimestresAno } from "@/types/estatisticas";

export const quadrimestres: Record<number, QuadrimestresAno> = {
  2025: {
    "1º Quadrimestre": [
      {
        titulo: "Artilheiro",
        nome: "Matheus Silva",
        slug: "matheus-silva",
        icone: "/images/icons/bola-de-prata.png", // bola de prata
      },
      {
        titulo: "Maestro",
        nome: "Lucas Rocha",
        slug: "lucas-rocha",
        icone: "/images/icons/chuteira-de-prata.png", // chuteira de prata
      },
      {
        titulo: "Goleiro",
        nome: "Muriel Defensor",
        slug: "muriel-defensor",
        icone: "/images/icons/luva-de-prata.png", // luva de prata
      },
      {
        titulo: "Atacante",
        nome: "Vitinho Artilheiro",
        slug: "vitinho-artilheiro",
        icone: "🥇", // medalha de ouro
      },
      {
        titulo: "Meia",
        nome: "Cris Mid",
        slug: "cris-mid",
        icone: "🥇", // medalha de ouro
      },
      {
        titulo: "Zagueiro",
        nome: "Murão Rocha",
        slug: "murao-rocha",
        icone: "🥇", // medalha de ouro
      },
      {
        titulo: "Melhor do Quadrimestre",
        nome: "Mario Vencedor",
        slug: "mario-vencedor",
        icone: "🥇", // medalha de ouro
      },
      {
        titulo: "Campeão do Quadrimestre",
        nome: "Time Relâmpago",
        slug: "time-relampago",
        icone: "🥇", // medalha de ouro (troféu é só no campeão do ano)
      },
    ],
    "2º Quadrimestre": [],
    "3º Quadrimestre": [],
  },
  2024: {
    "1º Quadrimestre": [],
    "2º Quadrimestre": [],
    "3º Quadrimestre": [],
  },
};
