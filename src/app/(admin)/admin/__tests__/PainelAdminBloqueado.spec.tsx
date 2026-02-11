import { render, screen } from "@testing-library/react";
import PainelAdminBloqueado from "../PainelAdminBloqueado";

describe("PainelAdminBloqueado", () => {
  it("exibe CTA de regularizacao e suporte com destinos validos", () => {
    render(<PainelAdminBloqueado motivo="Pagamento vencido." />);

    expect(screen.getByText(/Painel bloqueado por inadimplência/i)).toBeInTheDocument();
    expect(screen.getByText(/Pagamento vencido\./i)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Ir para pagamento e regularizar acesso/i })
    ).toHaveAttribute("href", "/admin/financeiro/planos-limites");

    expect(
      screen.getByRole("link", { name: /Precisa de ajuda\? Fale com o suporte\./i })
    ).toHaveAttribute(
      "href",
      "mailto:social@fut7pro.com.br?subject=Regulariza%C3%A7%C3%A3o%20de%20assinatura%20-%20Fut7Pro"
    );
  });
});
