import { render, screen } from "@testing-library/react";
import CardCicloPlano from "@/components/admin/CardCicloPlano";

const subscriptionBase = {
  id: "sub-1",
  tenantId: "tenant-1",
  planKey: "pro-month",
  status: "trialing" as const,
  trialEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  marketingEnabled: false,
  requiresUpfront: false,
};

describe("CardCicloPlano", () => {
  it("mostra dias restantes do trial e mensagem de alerta", () => {
    render(<CardCicloPlano subscription={subscriptionBase} />);

    expect(screen.getByText(/Ciclo do plano/i)).toBeInTheDocument();
    expect(screen.getByText(/dias/i)).toBeInTheDocument();
    expect(screen.getByText(/Falta pouco para acabar o teste/i)).toBeInTheDocument();
  });

  it("exibe aviso de pagamento pendente", () => {
    render(
      <CardCicloPlano
        subscription={{ ...subscriptionBase, status: "active" }}
        status={{ preapproval: "pending", upfront: "pending", active: false }}
      />
    );

    expect(screen.getByText(/pagamento pendente/i)).toBeInTheDocument();
  });

  it("prioriza acesso liberado por compensação", () => {
    render(
      <CardCicloPlano
        subscription={{ ...subscriptionBase, status: "past_due" }}
        status={{
          preapproval: "pending",
          upfront: "pending",
          active: false,
          access: {
            status: "ATIVO",
            accessStatus: "LIBERADO_POR_COMPENSACAO",
            blocked: false,
            canAccess: true,
            source: "COMPENSATION",
            daysRemaining: 21,
            effectiveAccessUntil: "2026-05-11T00:00:00.000Z",
          },
        }}
      />
    );

    expect(screen.getByText(/Acesso liberado/i)).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText(/compensação de acesso temporária/i)).toBeInTheDocument();
  });

  it("mostra plano e valor recorrente com cupom no ciclo do trial", () => {
    render(
      <CardCicloPlano
        subscription={{
          ...subscriptionBase,
          planKey: "monthly_essential",
          trialEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
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
      />
    );

    expect(screen.getAllByText(/teste do Mensal Essencial/i)).toHaveLength(2);
    expect(screen.getByText(/recorrência em R\$\s*99,00\/mês/i)).toBeInTheDocument();
  });

  it("usa recorrência anual quando o plano é anual", () => {
    render(
      <CardCicloPlano
        subscription={{
          ...subscriptionBase,
          planKey: "yearly_essential",
          interval: "year",
          trialEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 150000,
        }}
      />
    );

    expect(screen.getAllByText(/teste do Anual Essencial/i)).toHaveLength(2);
    expect(screen.getByText(/valor recorrente será R\$\s*1\.500,00\/ano/i)).toBeInTheDocument();
  });
});
