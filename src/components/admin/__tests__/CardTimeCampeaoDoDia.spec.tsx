import { render, screen } from "@testing-library/react";
import CardTimeCampeaoDoDia from "@/components/admin/CardTimeCampeaoDoDia";

const usePublicDestaquesDoDiaMock = jest.fn();

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "seu-racha" }),
}));

jest.mock("@/hooks/usePublicDestaquesDoDia", () => ({
  usePublicDestaquesDoDia: (...args: unknown[]) => usePublicDestaquesDoDiaMock(...args),
}));

describe("CardTimeCampeaoDoDia", () => {
  beforeEach(() => {
    usePublicDestaquesDoDiaMock.mockReturnValue({
      destaque: null,
      isLoading: false,
      isError: false,
    });
  });

  it("mostra o campeao oficial publicado", () => {
    usePublicDestaquesDoDiaMock.mockReturnValue({
      destaque: {
        date: "2025-12-14T03:00:00.000Z",
        bannerUrl: null,
        zagueiroId: null,
        timeCampeaoDoDia: {
          id: "champion-day-1",
          teamId: "A",
          source: "calculated",
          status: "published",
          updatedAt: "2025-12-14T12:00:00.000Z",
          team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
          atletas: [],
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<CardTimeCampeaoDoDia editLink="/admin/partidas" />);

    expect(screen.getByText(/Time Campeão do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Campeão definido em/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Editar Time Campeão do Dia/i })).toHaveAttribute(
      "href",
      "/admin/partidas"
    );
    expect(screen.getByAltText(/Foto do Time Campeão do Dia/i)).toHaveAttribute(
      "src",
      "/images/Timecampeao.jpg"
    );
  });

  it("exibe chamada para cadastrar quando nao ha dados", () => {
    render(<CardTimeCampeaoDoDia />);

    expect(
      screen.getByText(/Cadastre foto, gols, passes e resultados do dia/i)
    ).toBeInTheDocument();
  });
});
