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
    expect(screen.getByText(/Teste gratis/i)).toBeInTheDocument();
    expect(screen.getByText(/Teste valido ate/i)).toBeInTheDocument();
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

    expect(screen.getByText(/Mensal Essencial/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver faturas/i })).toHaveAttribute(
      "href",
      "/admin/financeiro/planos-limites?faturas=1"
    );
  });
});
