export const date = (value?: string | null) => {
  if (!value || !Number.isFinite(Date.parse(value))) return "Não registrado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};
export const money = (value?: number | null, currency = "BRL") =>
  value === null || value === undefined
    ? "Não registrado"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
export function historicalMoney(value: number | null | undefined, currency: string | null) {
  if (value === null || value === undefined) return "Não registrado";
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return money(value, currency);
    } catch {
      /* moeda desconhecida */
    }
  }
  return `${(value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · moeda não registrada`;
}
export function methodLabel(method: string | null) {
  return (
    {
      pix: "PIX",
      visa: "Visa",
      master: "Mastercard",
      credit_card: "Cartão de crédito",
      debit_card: "Cartão de débito",
      ticket: "Boleto",
      account_money: "Saldo Mercado Pago",
      bank_transfer: "Transferência",
    }[method || ""] || (method ? "Outra forma registrada" : "Não registrada")
  );
}
export const statusLabel = (status?: string | null) =>
  ({
    trialing: "Em teste",
    active: "Ativa",
    paused: "Pausada",
    canceled: "Cancelada",
    cancelled: "Cancelada",
    past_due: "Pagamento pendente",
    expired: "Período encerrado",
    pending: "Aguardando pagamento",
    in_process: "Em processamento",
    paid: "Pagamento confirmado",
    approved: "Pagamento confirmado",
    accredited: "Pagamento confirmado",
    refunded: "Devolução registrada",
    charged_back: "Pagamento contestado",
    overdue: "Vencida",
    rejected: "Não aprovado",
  })[status || ""] || "Situação não informada";
export const accessSource = (value?: string) =>
  ({
    TRIAL: "Período de teste",
    SUBSCRIPTION: "Assinatura",
    COMPENSATION: "Concessão de acesso",
    MANUAL_BLOCK: "Bloqueio administrativo",
    LIFECYCLE_ARCHIVED: "Grupo arquivado",
    VITRINE: "Condição especial",
    MISSING_SUBSCRIPTION: "Assinatura não registrada",
  })[value || ""] || "Origem não informada";
export const eventLabel = (value: string) =>
  ({
    SUBSCRIPTION_CREATED: "Assinatura criada",
    PLAN_CHANGED: "Plano alterado",
    COUPON_APPLIED: "Cupom aplicado",
    TRIAL_STARTED: "Período de teste registrado",
    TRIAL_CHANGED: "Período de teste atualizado",
    TRIAL_CLOSED: "Teste encerrado no contrato",
    FIRST_PAYMENT_RECORDED: "Primeiro pagamento registrado",
    CANCELLATION_CONFIRMED: "Cancelamento confirmado",
    STATUS_CHANGED: "Situação atualizada",
    ACCESS_PERIOD_CHANGED: "Prazo de acesso atualizado",
    CONDITIONS_CHANGED: "Condições comerciais atualizadas",
    CONTRACT_CHANGED: "Contrato atualizado",
    INVOICE_CREATED: "Cobrança registrada",
    PAYMENT_CONFIRMED: "Pagamento confirmado",
    REFUND_RECORDED: "Devolução registrada",
    INVOICE_STATUS_CHANGED: "Situação da cobrança atualizada",
    DAYS_GRANTED: "Dias concedidos",
    DAYS_REVERTED: "Concessão revertida",
  })[value] || "Atualização registrada";

export function dateFilter(value: string, end = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const result = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(result.getTime())) return undefined;
  if (end) {
    result.setDate(result.getDate() + 1);
    result.setMilliseconds(-1);
  }
  return result.toISOString();
}
