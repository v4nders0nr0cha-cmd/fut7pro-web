import { render, screen } from "@testing-library/react";
import PlayerCard from "../cards/PlayerCard";
import { Role } from "@/common/enums";

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { alt = "", ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...rest} />;
  },
}));

describe("PlayerCard", () => {
  const mockPlayer = {
    id: "player-1",
    name: "João Silva",
    email: "joao@test.com",
    role: Role.ATLETA,
    tenantId: "tenant-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    foto: "/images/jogadores/joao.jpg",
    telefone: "11999999999",
    posicao: "Atacante",
    gols: 15,
    assistencias: 8,
    partidas: 25,
    presencas: 20,
    status: "titular" as const,
  };

  const mockRacha = {
    id: "racha-1",
    name: "Test Racha",
    tenantId: "tenant-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render player information correctly", () => {
    render(<PlayerCard player={mockPlayer} racha={mockRacha} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Atacante")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // Gols
    expect(screen.getByText("8")).toBeInTheDocument(); // Assistências
    expect(screen.getByText("25")).toBeInTheDocument(); // Partidas
    expect(screen.getByText("20")).toBeInTheDocument(); // Presenças
  });

  it("should display player image with alt text", () => {
    render(<PlayerCard player={mockPlayer} racha={mockRacha} />);

    const playerImage = screen.getByAltText("João Silva");
    expect(playerImage).toBeInTheDocument();
    expect(playerImage).toHaveAttribute("src", "/images/jogadores/joao.jpg");
  });

  it("should show status badge correctly", () => {
    render(<PlayerCard player={mockPlayer} racha={mockRacha} />);

    const statusBadge = screen.getByText("titular");
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-green-500");
  });

  it("should handle missing player image gracefully", () => {
    const playerWithoutImage = {
      ...mockPlayer,
      foto: null,
    };

    render(<PlayerCard player={playerWithoutImage} racha={mockRacha} />);

    const defaultImage = screen.getByAltText("João Silva");
    expect(defaultImage).toBeInTheDocument();
    // Verificar se usa imagem padrão
    expect(defaultImage).toHaveAttribute("src", expect.stringContaining("default"));
  });

  it("should display correct statistics", () => {
    render(<PlayerCard player={mockPlayer} racha={mockRacha} />);

    // Verificar se as estatísticas estão sendo exibidas corretamente
    expect(screen.getByText("Gols")).toBeInTheDocument();
    expect(screen.getByText("Assistências")).toBeInTheDocument();
    expect(screen.getByText("Partidas")).toBeInTheDocument();
    expect(screen.getByText("Presenças")).toBeInTheDocument();
  });

  it("should handle different player statuses", () => {
    const substitutePlayer = {
      ...mockPlayer,
      status: "substituto" as const,
    };

    render(<PlayerCard player={substitutePlayer} racha={mockRacha} />);

    const statusBadge = screen.getByText("substituto");
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-yellow-500");
  });

  it("should handle absent player status", () => {
    const absentPlayer = {
      ...mockPlayer,
      status: "ausente" as const,
    };

    render(<PlayerCard player={absentPlayer} racha={mockRacha} />);

    const statusBadge = screen.getByText("ausente");
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-red-500");
  });

  it("should display player position correctly", () => {
    const defenderPlayer = {
      ...mockPlayer,
      posicao: "Zagueiro",
    };

    render(<PlayerCard player={defenderPlayer} racha={mockRacha} />);

    expect(screen.getByText("Zagueiro")).toBeInTheDocument();
  });

  it("should handle zero statistics gracefully", () => {
    const playerWithZeroStats = {
      ...mockPlayer,
      gols: 0,
      assistencias: 0,
      partidas: 0,
      presencas: 0,
    };

    render(<PlayerCard player={playerWithZeroStats} racha={mockRacha} />);

    expect(screen.getByText("0")).toBeInTheDocument(); // Gols
    expect(screen.getByText("0")).toBeInTheDocument(); // Assistências
    expect(screen.getByText("0")).toBeInTheDocument(); // Partidas
    expect(screen.getByText("0")).toBeInTheDocument(); // Presenças
  });

  it("should be accessible with proper ARIA labels", () => {
    render(<PlayerCard player={mockPlayer} racha={mockRacha} />);

    const playerCard = screen.getByRole("article");
    expect(playerCard).toBeInTheDocument();

    const playerImage = screen.getByAltText("João Silva");
    expect(playerImage).toBeInTheDocument();
  });

  it("should handle long player names correctly", () => {
    const playerWithLongName = {
      ...mockPlayer,
      name: "João da Silva Santos Oliveira Pereira",
    };

    render(<PlayerCard player={playerWithLongName} racha={mockRacha} />);

    expect(screen.getByText("João da Silva Santos Oliveira Pereira")).toBeInTheDocument();
  });

  it("should display correct attendance percentage", () => {
    const playerWithAttendance = {
      ...mockPlayer,
      partidas: 20,
      presencas: 18,
    };

    render(<PlayerCard player={playerWithAttendance} racha={mockRacha} />);

    // Verificar se a porcentagem de presença está sendo calculada corretamente
    // 18 presenças em 20 partidas = 90%
    expect(screen.getByText("90%")).toBeInTheDocument();
  });
});
