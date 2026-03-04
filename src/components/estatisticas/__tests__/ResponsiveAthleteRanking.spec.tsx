import { render, screen } from "@testing-library/react";
import ResponsiveAthleteRanking from "@/components/estatisticas/ResponsiveAthleteRanking";
import type { RankingAtleta } from "@/types/estatisticas";

const athletes: RankingAtleta[] = [
  {
    id: "a1",
    nome: "Joao Silva",
    slug: "joao-silva",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    pontos: 21,
    jogos: 10,
    vitorias: 7,
    empates: 2,
    derrotas: 1,
    gols: 11,
    assistencias: 0,
  },
  {
    id: "a2",
    nome: "Pedro Lima",
    slug: "pedro-lima",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    pontos: 18,
    jogos: 10,
    vitorias: 6,
    empates: 0,
    derrotas: 4,
    gols: 7,
    assistencias: 0,
  },
];

describe("ResponsiveAthleteRanking", () => {
  it("renderiza cards mobile e tabela desktop com os dados do ranking", () => {
    render(<ResponsiveAthleteRanking athletes={athletes} publicHref={(href) => `/slug${href}`} />);

    expect(screen.getAllByText("Joao Silva").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pedro Lima").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pontos").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Ver perfil de Joao Silva/i })).toHaveAttribute(
      "href",
      "/slug/atletas/joao-silva"
    );
    expect(screen.getByRole("columnheader", { name: "#" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Atleta" })).toBeInTheDocument();
  });

  it("renderiza mensagem de vazio quando não há atletas", () => {
    render(<ResponsiveAthleteRanking athletes={[]} publicHref={(href) => href} />);
    expect(screen.getByText("Nenhum atleta encontrado.")).toBeInTheDocument();
  });
});
