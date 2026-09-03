import { render, screen } from "@testing-library/react";
import BannerNotificacoes from "../BannerNotificacoes";

const useAdminDestaquesRodadasMock = jest.fn();

jest.mock("@/hooks/useAdminDestaquesRodadas", () => ({
  useAdminDestaquesRodadas: (...args: unknown[]) => useAdminDestaquesRodadasMock(...args),
}));

jest.mock("@/hooks/useProximosRachas", () => ({
  useProximosRachas: () => ({ items: [] }),
}));

describe("BannerNotificacoes", () => {
  it("exibe alertas separados para rodadas incompletas e campeoes pendentes", () => {
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: {
        rodadasIncompletas: [
          { date: "2026-08-24", totalMatches: 12, completedMatches: 11, status: "PARCIAL" },
        ],
        rodadasAguardandoCampeao: [
          { date: "2026-08-30", totalMatches: 12, completedMatches: 12, status: "COMPLETA" },
          { date: "2026-08-27", totalMatches: 12, completedMatches: 12, status: "COMPLETA" },
        ],
        rodadasRegistradas: [],
        rodadasPrecisandoRevisao: [],
        currentPublicSpotlightDate: null,
      },
    });

    render(<BannerNotificacoes />);

    expect(screen.getByText(/1 rodada com resultados pendentes/i)).toBeInTheDocument();
    expect(screen.getByText(/2 rodadas concluídas aguardando/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Concluir resultados/i })).toHaveAttribute(
      "href",
      "/admin/partidas/historico"
    );
    expect(screen.getByRole("link", { name: /Registrar campeões/i })).toHaveAttribute(
      "href",
      "/admin/partidas/time-campeao-do-dia"
    );
  });

  it("exibe alerta para publicacoes que precisam de revisao", () => {
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: {
        rodadasIncompletas: [],
        rodadasAguardandoCampeao: [],
        rodadasRegistradas: [
          {
            date: "2026-08-24",
            totalMatches: 12,
            completedMatches: 12,
            status: "COMPLETA",
            needsReview: true,
            reviewUrl: "/admin/partidas/time-campeao-do-dia?data=2026-08-24",
          },
        ],
        rodadasPrecisandoRevisao: [
          {
            date: "2026-08-24",
            totalMatches: 12,
            completedMatches: 12,
            status: "COMPLETA",
            needsReview: true,
            reviewUrl: "/admin/partidas/time-campeao-do-dia?data=2026-08-24",
          },
        ],
        currentPublicSpotlightDate: null,
      },
    });

    render(<BannerNotificacoes />);

    expect(screen.getByText(/1 rodada publicada com resultados alterados/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Revisar publicação/i })).toHaveAttribute(
      "href",
      "/admin/partidas/time-campeao-do-dia?data=2026-08-24"
    );
  });
});
