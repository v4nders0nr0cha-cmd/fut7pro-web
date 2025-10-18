import { render, screen } from "@testing-library/react";
import PlayerCard from "@/components/cards/PlayerCard";

describe("PlayerCard", () => {
  const baseProps = {
    name: "João Silva",
    image: "",
  };

  it("exibe fallback seguro quando o título não é informado", () => {
    render(<PlayerCard {...baseProps} />);

    expect(screen.getByText(/Jogador destaque/i)).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("renderiza tooltip coerente quando o título é fornecido", () => {
    render(<PlayerCard {...baseProps} title="Goleiro do Dia" />);

    const titleElement = screen.getByText(/Goleiro do Dia/i);
    const containerWithTooltip = titleElement.closest("div[title]");

    expect(containerWithTooltip).not.toBeNull();
    expect(containerWithTooltip).toHaveAttribute("title", "Goleiro do time campeão");
  });
});
