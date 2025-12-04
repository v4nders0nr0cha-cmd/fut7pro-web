export interface PartidaMock {
  id: string;
  data: string;
  adversario?: string;
  resultado?: string;
  timeA?: string;
  timeB?: string;
  golsTimeA?: number;
  golsTimeB?: number;
  local?: string;
  finalizada?: boolean;
}

export const partidasMock: PartidaMock[] = [];
