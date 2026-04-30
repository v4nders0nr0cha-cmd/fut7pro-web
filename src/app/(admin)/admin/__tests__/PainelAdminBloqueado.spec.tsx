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
      screen.getByRole("link", { name: /\+55 88 99243-1113/i })
    ).toHaveAttribute("href", expect.stringContaining("https://wa.me/5588992431113?text="));
  });
});
