import { render, screen } from "@testing-library/react";
import CardResumoFinanceiro from "@/components/admin/CardResumoFinanceiro";

describe("CardResumoFinanceiro (dashboard)", () => {
  it("exibe skeleton enquanto carrega", () => {
    const { container } = render(<CardResumoFinanceiro isLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(1);
  });

  it("mostra estado vazio quando não há resumo", () => {
    render(<CardResumoFinanceiro />);
    expect(screen.getByText(/Sem lancamentos/i)).toBeInTheDocument();
  });

  it("exibe valores formatados quando há dados", () => {
    render(
      <CardResumoFinanceiro
        resumo={{ saldo: 1500.5, receitas: 2000, despesas: -499.5, periodoLabel: "Fev/2025" }}
      />
    );
    expect(screen.getByText(/Saldo \(Fev\/2025\)/i)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("1.500,50"))).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes("Entradas: R$") && text.includes("499,50"))
    ).toBeInTheDocument();
  });
});
