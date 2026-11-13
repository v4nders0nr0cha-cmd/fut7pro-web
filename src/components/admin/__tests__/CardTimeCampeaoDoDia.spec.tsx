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

  it("abre a edicao do campeao publicado com a data oficial", () => {
    usePublicDestaquesDoDiaMock.mockReturnValue({
      destaque: {
        date: "2026-08-24T03:00:00.000Z",
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

    render(<CardTimeCampeaoDoDia />);

    expect(screen.getByText(/Time Campeão do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Campeão definido em/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Editar Time Campeão do Dia/i })).toHaveAttribute(
      "href",
      "/admin/partidas/time-campeao-do-dia?data=2026-08-24"
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

  it("mantém o título durante o carregamento e não confunde erro com cadastro", () => {
    usePublicDestaquesDoDiaMock.mockReturnValue({ destaque: null, isLoading: true, isError: false });
    const view = render(<CardTimeCampeaoDoDia />);
    expect(screen.getByText("Time Campeão do Dia")).toBeInTheDocument();
    expect(screen.getByText("Carregando campeão do dia")).toBeInTheDocument();
    usePublicDestaquesDoDiaMock.mockReturnValue({ destaque: null, isLoading: false, isError: true });
    view.rerender(<CardTimeCampeaoDoDia />);
    expect(screen.getByText("Ver resultados")).toBeInTheDocument();
    expect(screen.queryByText("Cadastrar Campeão")).not.toBeInTheDocument();
  });
});
