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
    expect(screen.getByText(/segundo tempo/i)).toBeInTheDocument();
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
});
