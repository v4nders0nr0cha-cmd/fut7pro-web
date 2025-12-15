import { render, screen } from "@testing-library/react";
import CardPlanoAtual from "@/components/admin/CardPlanoAtual";

describe("CardPlanoAtual", () => {
  it("renderiza plano trial com CTA de upgrade", () => {
    render(<CardPlanoAtual tipoPlano="trial" />);
    expect(screen.getByText(/Plano atual/i)).toBeInTheDocument();
    expect(screen.getByText(/Teste Gr[áa]tis/i)).toBeInTheDocument();
    expect(screen.getByText(/teste gratuito/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Subir plano/i })).toHaveAttribute(
      "href",
      "/admin/financeiro/upgrade"
    );
  });

  it("renderiza plano mensal com CTA de renovar", () => {
    render(<CardPlanoAtual tipoPlano="mensal" />);
    expect(screen.getByText(/Mensal Essencial/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Renovar plano/i })).toHaveAttribute(
      "href",
      "/admin/financeiro/renovar"
    );
  });
});
