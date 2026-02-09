export type SupportTicketCategory =
  | "TECHNICAL_ISSUE"
  | "BILLING"
  | "QUESTION"
  | "SUGGESTION"
  | "OTHER";

export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_ADMIN" | "RESOLVED" | "CLOSED";

export type SupportTicketMessageAuthorType = "ADMIN" | "SUPERADMIN" | "SYSTEM";

export type SupportTicketUser = {
  id: string;
  name: string;
  email: string;
};

export type SupportTicketMessage = {
  id: string;
  ticketId: string;
  tenantId: string;
  authorType: SupportTicketMessageAuthorType;
  authorUserId?: string | null;
  authorUser?: SupportTicketUser | null;
  message: string;
  createdAt: string;
};

export type SupportTicketItem = {
  id: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdByAdminUserId: string;
  createdByAdminUser?: SupportTicketUser | null;
  messageCount: number;
  lastMessage?: {
    id: string;
    message: string;
    authorType: SupportTicketMessageAuthorType;
    authorUserId?: string | null;
    authorUser?: SupportTicketUser | null;
    createdAt: string;
  } | null;
};

export type SupportTicketDetail = SupportTicketItem & {
  messages: SupportTicketMessage[];
};

export const supportTicketCategoryLabels: Record<SupportTicketCategory, string> = {
  TECHNICAL_ISSUE: "Problema técnico",
  BILLING: "Financeiro",
  QUESTION: "Dúvida",
  SUGGESTION: "Sugestão",
  OTHER: "Outro",
};

export const supportTicketStatusLabels: Record<SupportTicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_ADMIN: "Aguardando admin",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

export const supportTicketStatusClasses: Record<SupportTicketStatus, string> = {
  OPEN: "bg-yellow-900/50 text-yellow-200",
  IN_PROGRESS: "bg-blue-900/50 text-blue-200",
  WAITING_ADMIN: "bg-orange-900/50 text-orange-200",
  RESOLVED: "bg-emerald-900/50 text-emerald-200",
  CLOSED: "bg-zinc-800 text-zinc-300",
};
