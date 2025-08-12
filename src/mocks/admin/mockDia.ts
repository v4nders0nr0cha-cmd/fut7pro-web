import type { Confronto } from "@/types/interfaces";
import { timesDoDiaMock } from "@/components/lists/mockTimesDoDia";

// Mock dos confrontos do dia
export const mockConfrontos: Confronto[] = [
  {
    id: "1",
    timeA: "Leões",
    timeB: "Tigres",
    golsTimeA: 2,
    golsTimeB: 1,
    finalizada: true,
    data: "2024-01-15",
    local: "Campo Principal",
    gols: [
      {
        id: "1",
        jogador: "João",
        time: "Leões",
        minuto: 15,
        tipo: "normal",
      },
      {
        id: "2",
        jogador: "Carlos",
        time: "Leões",
        minuto: 32,
        tipo: "normal",
      },
      {
        id: "3",
        jogador: "Daniel",
        time: "Tigres",
        minuto: 45,
        tipo: "penalti",
      },
    ],
    assistencias: [
      {
        id: "1",
        jogador: "Marcos",
        time: "Leões",
        minuto: 15,
      },
      {
        id: "2",
        jogador: "Pedro",
        time: "Leões",
        minuto: 32,
      },
    ],
  },
  {
    id: "2",
    timeA: "Águias",
    timeB: "Furacão",
    golsTimeA: 0,
    golsTimeB: 3,
    finalizada: true,
    data: "2024-01-15",
    local: "Campo Secundário",
    gols: [
      {
        id: "4",
        jogador: "Bruno Costa",
        time: "Furacão",
        minuto: 8,
        tipo: "normal",
      },
      {
        id: "5",
        jogador: "Diego",
        time: "Furacão",
        minuto: 25,
        tipo: "normal",
      },
      {
        id: "6",
        jogador: "Igor",
        time: "Furacão",
        minuto: 52,
        tipo: "falta",
      },
    ],
    assistencias: [
      {
        id: "3",
        jogador: "Julio",
        time: "Furacão",
        minuto: 8,
      },
      {
        id: "4",
        jogador: "Matheus",
        time: "Furacão",
        minuto: 25,
      },
      {
        id: "5",
        jogador: "Wesley",
        time: "Furacão",
        minuto: 52,
      },
    ],
  },
];

// Mock dos times do dia (reutilizando do arquivo existente)
export const mockTimes = timesDoDiaMock;
