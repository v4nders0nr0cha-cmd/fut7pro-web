import { render, screen } from "@testing-library/react";
import CardProximosJogos from "@/components/admin/CardProximosJogos";

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "demo" }),
}));

jest.mock("@/hooks/usePublicMatches", () => ({
  usePublicMatches: () => ({
    matches: [
      {
        id: "m1",
        date: "2025-07-06T10:00:00.000Z",
        teamA: { name: "Time Azul" },
        teamB: { name: "Time Verde" },
      },
    ],
    isLoading: false,
  }),
}));

describe("CardProximosJogos", () => {
  it("exibe lista com adversários e datas", () => {
    render(<CardProximosJogos />);

    expect(screen.getByText(/Pr.+ximos Jogos/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Azul/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Verde/i)).toBeInTheDocument();
    expect(screen.getByText(/06\/07/)).toBeInTheDocument();
    expect(screen.getByText(/•\s\d{2}:\d{2}/)).toBeInTheDocument();
  });
});
