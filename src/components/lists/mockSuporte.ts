export interface TicketMock {
  id: string;
  assunto: string;
  racha: string;
  status: "open" | "resolved" | "inprogress" | "waiting";
  onboardingPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingMock {
  racha: string;
  status: "completo" | "parcial" | "incompleto";
  percent: number;
  etapasConcluidas: number;
  etapasTotais: number;
}

export const mockTickets: TicketMock[] = [];
export const mockOnboardings: OnboardingMock[] = [];
