import { render, screen } from "@testing-library/react";
import PlayerCard from "../cards/PlayerCard";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe("PlayerCard", () => {
  const baseProps = {
    title: "Atacante do Dia",
    name: "João Silva",
    value: "3 gols",
    image: "/images/jogadores/joao.jpg",
    href: "/atletas/joao-silva",
    showTrophy: true,
  };

  it("renderiza título, nome e valor", () => {
    render(<PlayerCard {...baseProps} />);

    expect(screen.getByText("Atacante do Dia")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("3 gols")).toBeInTheDocument();
  });

  it("usa imagem padrão quando nenhuma imagem é fornecida", () => {
    render(<PlayerCard {...baseProps} image="" />);

    const image = screen.getByAltText(/Atacante do dia - João Silva/i) as HTMLImageElement;
    expect(image.src).toContain("default.png");
  });

  it("define tooltip contextual baseado no título", () => {
    render(<PlayerCard {...baseProps} />);
    expect(screen.getByTitle("Melhor atacante do time campeão")).toBeInTheDocument();
  });

  it("envolve o card com link quando href é fornecido", () => {
    render(<PlayerCard {...baseProps} />);
    const link = screen.getByRole("link", { name: /Atacante do Dia/i });
    expect(link).toHaveAttribute("href", "/atletas/joao-silva");
  });

  it("renderiza apenas título e nome quando value não é informado", () => {
    render(<PlayerCard {...baseProps} value={undefined} />);

    expect(screen.queryByText("3 gols")).not.toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });
});
