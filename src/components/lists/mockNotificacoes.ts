import type { Notificacao } from "@/types/notificacao";

export const mockNotificacoes: Notificacao[] = [
  {
    id: "1",
    tipo: "Atualizações de Sistema",
    mensagem: "Nova atualização no Fut7Pro",
    data: "15/06/2025 09:00",
    destino: "Todos",
    status: "enviado",
    enviadoPor: "SuperAdmin",
  },
  {
    id: "2",
    tipo: "Cobrança/Financeiro",
    mensagem: "Cobrança automática mensal",
    data: "10/06/2025 10:00",
    destino: "Rachas Mensal",
    status: "enviado",
    enviadoPor: "SuperAdmin",
  },
  {
    id: "3",
    tipo: "Onboarding/Boas-vindas",
    mensagem: "Boas-vindas ao novo presidente",
    data: "08/06/2025 08:30",
    destino: "Novos Admin",
    status: "enviado",
    enviadoPor: "SuperAdmin",
  },
  {
    id: "4",
    tipo: "Gamificação e Conquistas",
    mensagem: "Seu racha bateu recorde de assiduidade!",
    data: "05/06/2025 11:20",
    destino: "Todos",
    status: "enviado",
    enviadoPor: "SuperAdmin",
  },
  {
    id: "5",
    tipo: "Promoções e Ofertas",
    mensagem: "Semana do Futebol: Planos com 10% OFF!",
    data: "01/06/2025 13:00",
    destino: "Todos",
    status: "enviado",
    enviadoPor: "SuperAdmin",
  },
];
