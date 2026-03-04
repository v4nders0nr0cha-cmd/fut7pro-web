import { render, screen } from "@testing-library/react";
import ResponsiveTeamRanking from "@/components/estatisticas/ResponsiveTeamRanking";
import type { TeamRankingEntry } from "@/hooks/usePublicTeamRankings";

const teams: TeamRankingEntry[] = [
  {
    id: "t1",
    rankingId: "r1",
    nome: "Time Alpha",
    logo: "/images/logos/logo_fut7pro.png",
    cor: "#ffffff",
    pontos: 24,
    jogos: 10,
    vitorias: 8,
    empates: 0,
    derrotas: 2,
    posicao: 1,
    aproveitamento: 80,
    updatedAt: "2026-03-04T00:00:00.000Z",
  },
  {
    id: "t2",
    rankingId: "r2",
    nome: "Time Beta",
    logo: null,
    cor: null,
    pontos: 20,
    jogos: 10,
    vitorias: 6,
    empates: 2,
    derrotas: 2,
    posicao: 2,
    aproveitamento: 66.6,
    updatedAt: "2026-03-04T00:00:00.000Z",
  },
];

describe("ResponsiveTeamRanking", () => {
  it("renderiza cards mobile e tabela desktop com os dados dos times", () => {
    render(<ResponsiveTeamRanking teams={teams} />);

    expect(screen.getAllByText("Time Alpha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Time Beta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pontos").length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: "Time" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Jogos" })).toBeInTheDocument();
  });

  it("renderiza mensagem de vazio quando não há times", () => {
    render(<ResponsiveTeamRanking teams={[]} />);
    expect(screen.getByText("Nenhum time encontrado.")).toBeInTheDocument();
  });
});
