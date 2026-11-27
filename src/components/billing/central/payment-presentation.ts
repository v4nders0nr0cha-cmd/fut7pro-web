import type { FinancialStatusCode } from "@/lib/api/billing";

export function paymentActionLabel(code?: FinancialStatusCode, pending?: number) {
  if (code === "VENCIDO") return "Regularizar pagamento";
  if (code === "PENDENTE" && pending && pending > 0) return "Pagar cobrança";
  if (code === "TESTE") return "Configurar pagamento";
  return "Opções de pagamento";
}
