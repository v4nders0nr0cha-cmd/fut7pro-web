import { render, screen } from "@testing-library/react";
import CardPlanoAtual from "@/components/admin/CardPlanoAtual";
import type { Subscription, SubscriptionStatus } from "@/lib/api/billing";

const baseSubscription: Subscription = {
  id: "sub-1",
  tenantId: "tenant-1",
  planKey: "pro-month",
  status: "trialing",
  trialStart: "2025-12-10T00:00:00.000Z",
  trialEnd: "2025-12-20T00:00:00.000Z",
  currentPeriodStart: "2025-12-10T00:00:00.000Z",
  currentPeriodEnd: "2026-01-10T00:00:00.000Z",
  marketingEnabled: false,
  requiresUpfront: false,
};

const activeStatus: SubscriptionStatus = {
  preapproval: "authorized",
  upfront: "paid",
  active: true,
};
const pendingStatus: SubscriptionStatus = {
  preapproval: "pending",
  upfront: "pending",
  active: false,
};

describe("CardPlanoAtual", () => {
  it("renderiza estado de trial com chamada para ativar", () => {
    render(<CardPlanoAtual subscription={baseSubscription} status={pendingStatus} />);

    expect(screen.getByText(/Plano atual/i)).toBeInTheDocument();
    expect(screen.getByText(/Essencial Mensal/i)).toBeInTheDocument();
    expect(screen.getByText(/Teste válido até/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ativar plano/i })).toHaveAttribute(
      "href",
      "/admin/financeiro/planos-limites"
    );
  });

  it("renderiza plano ativo com link de faturas", () => {
    render(
      <CardPlanoAtual
        subscription={{ ...baseSubscription, status: "active" }}
        status={activeStatus}
      />
    );

    expect(screen.getByText(/Essencial Mensal/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver faturas/i })).toHaveAttribute(
      "href",
      "/admin/financeiro/planos-limites?faturas=1"
    );
  });

  it("mostra acesso liberado quando existe compensação ativa com pagamento pendente", () => {
    render(
      <CardPlanoAtual
        subscription={{ ...baseSubscription, status: "past_due" }}
        status={{
          ...pendingStatus,
          access: {
            status: "ATIVO",
            accessStatus: "LIBERADO_POR_COMPENSACAO",
            blocked: false,
            canAccess: true,
            source: "COMPENSATION",
            daysRemaining: 21,
            effectiveAccessUntil: "2026-05-11T00:00:00.000Z",
          },
          financialStatus: {
            code: "PENDENTE",
            label: "Pagamento pendente",
            message: "Existe pagamento pendente.",
          },
        }}
      />
    );

    expect(screen.getByText(/ACESSO LIBERADO/i)).toBeInTheDocument();
    expect(screen.getByText(/liberado temporariamente por compensação/i)).toBeInTheDocument();
  });

  it("mostra valor recorrente com cupom durante o teste", () => {
    render(
      <CardPlanoAtual
        subscription={{
          ...baseSubscription,
          planKey: "monthly_essential",
          amount: 15000,
          couponCode: "NAYARA10",
          pricingPreview: {
            isFirstPayment: true,
            firstPaymentDiscountApplied: false,
            recurringDiscountApplied: true,
            couponAppliesToRecurring: true,
            baseAmountCents: 15000,
            recurringAmountCents: 9900,
            discountPct: 34,
            discountCents: 5100,
            totalCents: 9900,
          },
        }}
        status={pendingStatus}
      />
    );

    expect(screen.getByText(/Valor recorrente com cupom/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*99,00\/mês/i)).toHaveLength(2);
    expect(screen.getByText(/Após o teste, o plano fica R\$\s*99,00\/mês/i)).toBeInTheDocument();
  });

  it("usa recorrência anual quando o plano é anual", () => {
    render(
      <CardPlanoAtual
        subscription={{
          ...baseSubscription,
          planKey: "yearly_essential",
          interval: "year",
          amount: 150000,
        }}
        status={pendingStatus}
      />
    );

    expect(screen.getByText(/Essencial Anual/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*1\.500,00\/ano/i)).toHaveLength(2);
  });
});
