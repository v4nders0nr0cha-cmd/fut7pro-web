// src/mocks/admin/mockDia.ts

export type Confronto = {
  id?: string;
  timeA: string;
  timeB: string;
  horario?: string;
  local?: string;
  golsTimeA?: number;
  golsTimeB?: number;
  golsA?: number;
  golsB?: number;
  finalizada?: boolean;
  jogadoresA: string[];
  jogadoresB: string[];
  destaquesA?: string[];
  destaquesB?: string[];
  ida?: { a: number; b: number };
  volta?: { a: number; b: number };
  resultadoIda?: { placar: { a: number; b: number }; eventos: any[] } | null;
  resultadoVolta?: { placar: { a: number; b: number }; eventos: any[] } | null;
};

export type TimeDoDia = {
  nome: string;
  slug: string;
  escudoUrl?: string;
  corPrincipal?: string;
  corSecundaria?: string;
  jogadores: string[] | { nome: string; apelido: string; pos: string }[];
};

// Times de exemplo para a tela "Time Campeão do Dia"
export const mockTimes: TimeDoDia[] = [
  {
    nome: "Amarelo",
    slug: "amarelo",
    escudoUrl: "/images/escudos/amarelo.png",
    corPrincipal: "#FACC15",
    corSecundaria: "#1F2937",
    jogadores: ["João", "Pedro", "Lucas", "Rafa", "Leo", "César", "Tico"],
  },
  {
    nome: "Preto",
    slug: "preto",
    escudoUrl: "/images/escudos/preto.png",
    corPrincipal: "#111827",
    corSecundaria: "#F3F4F6",
    jogadores: ["Carlos", "Marcos", "Neto", "Davi", "Bruno", "Renan", "Will"],
  },
  {
    nome: "Azul",
    slug: "azul",
    escudoUrl: "/images/escudos/azul.png",
    corPrincipal: "#2563EB",
    corSecundaria: "#EFF6FF",
    jogadores: ["Tiago", "Gustavo", "Henrique", "Biel", "Vini", "Pablo", "Alan"],
  },
  {
    nome: "Verde",
    slug: "verde",
    escudoUrl: "/images/escudos/verde.png",
    corPrincipal: "#10B981",
    corSecundaria: "#ECFDF5",
    jogadores: ["Igor", "Fabrício", "Caio", "Beto", "Rui", "Tales", "Diego"],
  },
];

// Confrontos de exemplo (usados para renderizar cards/tabelas da página)
export const mockConfrontos: Confronto[] = [
  {
    id: "1",
    timeA: "Amarelo",
    timeB: "Preto",
    horario: "19:30",
    local: "Quadra A",
    golsTimeA: 0,
    golsTimeB: 0,
    golsA: 0,
    golsB: 0,
    finalizada: false,
    jogadoresA: ["João", "Pedro", "Lucas", "Rafa", "Leo", "César", "Tico"],
    jogadoresB: ["Carlos", "Marcos", "Neto", "Davi", "Bruno", "Renan", "Will"],
    ida: { a: 0, b: 1 },
    volta: { a: 0, b: 1 },
    resultadoIda: null,
    resultadoVolta: null,
  },
  {
    id: "2",
    timeA: "Azul",
    timeB: "Verde",
    horario: "19:55",
    local: "Quadra A",
    golsTimeA: 0,
    golsTimeB: 0,
    golsA: 0,
    golsB: 0,
    finalizada: false,
    jogadoresA: ["Tiago", "Gustavo", "Henrique", "Biel", "Vini", "Pablo", "Alan"],
    jogadoresB: ["Igor", "Fabrício", "Caio", "Beto", "Rui", "Tales", "Diego"],
    ida: { a: 2, b: 3 },
    volta: { a: 2, b: 3 },
    resultadoIda: null,
    resultadoVolta: null,
  },
  {
    id: "3",
    timeA: "Amarelo",
    timeB: "Azul",
    horario: "20:20",
    local: "Quadra A",
    golsTimeA: 0,
    golsTimeB: 0,
    golsA: 0,
    golsB: 0,
    finalizada: false,
    jogadoresA: ["João", "Pedro", "Lucas", "Rafa", "Leo", "César", "Tico"],
    jogadoresB: ["Tiago", "Gustavo", "Henrique", "Biel", "Vini", "Pablo", "Alan"],
    ida: { a: 0, b: 2 },
    volta: { a: 0, b: 2 },
    resultadoIda: null,
    resultadoVolta: null,
  },
  {
    id: "4",
    timeA: "Preto",
    timeB: "Verde",
    horario: "20:45",
    local: "Quadra A",
    golsTimeA: 0,
    golsTimeB: 0,
    golsA: 0,
    golsB: 0,
    finalizada: false,
    jogadoresA: ["Carlos", "Marcos", "Neto", "Davi", "Bruno", "Renan", "Will"],
    jogadoresB: ["Igor", "Fabrício", "Caio", "Beto", "Rui", "Tales", "Diego"],
    ida: { a: 1, b: 3 },
    volta: { a: 1, b: 3 },
    resultadoIda: null,
    resultadoVolta: null,
  },
];
