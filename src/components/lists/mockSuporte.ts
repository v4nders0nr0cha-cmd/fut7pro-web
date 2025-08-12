// Tickets mockados para a tabela
export const mockTickets = [
  {
    id: "1",
    assunto: "Dúvida sobre cobrança",
    racha: "Galáticos",
    status: "open" as const,
    onboardingPercent: 80,
    createdAt: "15/06/2025",
    updatedAt: "16/06/2025",
  },
  {
    id: "2",
    assunto: "Problema no cadastro",
    racha: "Vila União",
    status: "resolved" as const,
    onboardingPercent: 100,
    createdAt: "13/06/2025",
    updatedAt: "14/06/2025",
  },
  {
    id: "3",
    assunto: "Configuração de layout",
    racha: "Real Matismo",
    status: "inprogress" as const,
    onboardingPercent: 60,
    createdAt: "10/06/2025",
    updatedAt: "12/06/2025",
  },
  {
    id: "4",
    assunto: "Erro ao importar jogadores",
    racha: "Fut7 Brotas",
    status: "waiting" as const,
    onboardingPercent: 50,
    createdAt: "18/06/2025",
    updatedAt: "18/06/2025",
  },
];

// Onboarding de rachas mockados para o card superior
export const mockOnboardings = [
  {
    racha: "Galáticos",
    status: "parcial" as const,
    percent: 80,
    etapasConcluidas: 4,
    etapasTotais: 5,
  },
  {
    racha: "Vila União",
    status: "completo" as const,
    percent: 100,
    etapasConcluidas: 5,
    etapasTotais: 5,
  },
  {
    racha: "Real Matismo",
    status: "parcial" as const,
    percent: 60,
    etapasConcluidas: 3,
    etapasTotais: 5,
  },
  {
    racha: "Fut7 Brotas",
    status: "incompleto" as const,
    percent: 50,
    etapasConcluidas: 2,
    etapasTotais: 5,
  },
];
