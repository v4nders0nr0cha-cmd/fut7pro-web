import { render, screen, within } from "@testing-library/react";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import { classificacaoTimes } from "@/components/lists/mockClassificacaoTimes";

describe("TopTeamsCard", () => {
  it('renderiza título e chamada "Ver todos"', () => {
    render(<TopTeamsCard />);

    expect(screen.getByText(/Classificação dos Times/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver todos/i)).toBeInTheDocument();
  });

  it("exibe os quatro primeiros times da classificação", () => {
    render(<TopTeamsCard />);

    const top4 = classificacaoTimes.slice(0, 4);
    top4.forEach((time) => {
      expect(screen.getByText(time.nome)).toBeInTheDocument();
    });
  });

  it("exibe pontos e variação para cada time", () => {
    render(<TopTeamsCard />);

    const top4 = classificacaoTimes.slice(0, 4);
    top4.forEach((time) => {
      const row = screen.getByText(time.nome).closest("tr");
      expect(row).not.toBeNull();
      if (row) {
        expect(within(row).getByText(String(time.pontos))).toBeInTheDocument();
      }
    });
  });

  it("envolve o card em um link para a classificação completa", () => {
    render(<TopTeamsCard />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/estatisticas/classificacao-dos-times");
  });
});
