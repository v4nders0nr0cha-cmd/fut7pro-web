import { render, screen } from "@testing-library/react";
import CardRelatoriosEngajamento from "@/components/admin/CardRelatoriosEngajamento";

describe("CardRelatoriosEngajamento", () => {
  it("exibe CTA e link para relatórios", () => {
    render(<CardRelatoriosEngajamento />);
    expect(screen.getByText(/Relat.+rios de Engajamento/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Ver Relat.+rios/i });
    expect(link).toHaveAttribute("href", "/admin/relatorios");
  });
});
