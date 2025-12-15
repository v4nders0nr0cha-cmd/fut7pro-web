import { render, screen } from "@testing-library/react";
import CardAlertaDashboard from "@/components/admin/CardAlertaDashboard";
import { useNotification } from "@/context/NotificationContext";

jest.mock("@/context/NotificationContext", () => ({
  useNotification: jest.fn(),
}));

const mockedUseNotification = useNotification as jest.Mock;

describe("CardAlertaDashboard", () => {
  beforeEach(() => {
    mockedUseNotification.mockReturnValue({ jogadores: 2, partidas: 1, config: 0 });
  });

  it("não renderiza quando não há alertas", () => {
    mockedUseNotification.mockReturnValue({ jogadores: 0, partidas: 0, config: 0 });
    const { container } = render(<CardAlertaDashboard />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza lista de alertas com quantidades", () => {
    render(<CardAlertaDashboard />);
    expect(screen.getByText(/Atenção, presidente/i)).toBeInTheDocument();
    expect(screen.getByText(/2 jogadores aguardando aprovação/i)).toBeInTheDocument();
    expect(screen.getByText(/1 partida com pendência/i)).toBeInTheDocument();
  });
});
