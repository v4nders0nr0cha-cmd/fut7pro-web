import { render, screen, fireEvent } from "@testing-library/react";
import BotaoPublicarTimes from "@/components/sorteio/BotaoPublicarTimes";

describe("BotaoPublicarTimes", () => {
  it("dispara onClick quando nao publicado nem em loading", () => {
    const onClick = jest.fn();
    render(<BotaoPublicarTimes publicado={false} loading={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("nao dispara quando ja publicado", () => {
    const onClick = jest.fn();
    render(<BotaoPublicarTimes publicado loading={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByText("Times Publicados!")).toBeInTheDocument();
  });

  it("mostra estado de loading e bloqueia clique", () => {
    const onClick = jest.fn();
    render(<BotaoPublicarTimes publicado={false} loading onClick={onClick} />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    expect(btn).toHaveTextContent("Publicando...");
  });
});
