export type Confronto = {
  id: number;
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  finalizada: boolean;
};

export const confrontosDoDia: Confronto[] = [
  { id: 1, timeA: "Time A", timeB: "Time B", golsTimeA: 0, golsTimeB: 0, finalizada: false },
  { id: 2, timeA: "Time C", timeB: "Time D", golsTimeA: 0, golsTimeB: 0, finalizada: false },
];
