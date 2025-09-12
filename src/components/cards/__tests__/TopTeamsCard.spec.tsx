import { render, screen } from "@testing-library/react";
import TopTeamsCard from "@/components/cards/TopTeamsCard";

describe("TopTeamsCard", () => {
  it('renderiza título e botão "Ver todos"', () => {
    render(<TopTeamsCard />);

    expect(screen.getByText(/Classificação dos Times/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver todos/i })).toBeInTheDocument();
  });

  it("renderiza lista de times corretamente", () => {
    render(<TopTeamsCard />);

    // Verifica se os times mockados estão sendo renderizados
    expect(screen.getByText("Time Alpha")).toBeInTheDocument();
    expect(screen.getByText("Time Beta")).toBeInTheDocument();
    expect(screen.getByText("Time Gama")).toBeInTheDocument();
  });

  it("renderiza pontuação dos times", () => {
    render(<TopTeamsCard />);

    // Verifica se as pontuações dos times mockados estão sendo renderizadas
    expect(screen.getByText("24")).toBeInTheDocument(); // Pontos do Time Alpha
    expect(screen.getByText("23")).toBeInTheDocument(); // Pontos do Time Gama
    expect(screen.getByText("22")).toBeInTheDocument(); // Pontos do Time Ômega
  });

  it("renderiza estrutura da tabela", () => {
    render(<TopTeamsCard />);

    // Verifica se a estrutura da tabela está correta
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("↑↓")).toBeInTheDocument();
    expect(screen.getByText("Pts")).toBeInTheDocument();
  });
});
