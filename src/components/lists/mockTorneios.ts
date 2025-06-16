export interface Torneio {
  nome: string;
  slug: string;
  ano: number;
  campeao: string;
  imagem: string;
}

export const torneiosMock: Torneio[] = [
  {
    nome: "Copa dos Campeões 2025",
    slug: "craque-master",
    ano: 2025,
    campeao: "Craque Master",
    imagem: "/images/times/time_padrao_01.png",
  },
  {
    nome: "Torneio Relâmpago 2024",
    slug: "goleador-king",
    ano: 2024,
    campeao: "Goleador King",
    imagem: "/images/times/time_padrao_02.png",
  },
  {
    nome: "Desafio dos Lendários 2023",
    slug: "lenda-viva",
    ano: 2023,
    campeao: "Lenda Viva",
    imagem: "/images/times/time_padrao_03.png",
  },
];
