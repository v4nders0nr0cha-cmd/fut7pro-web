import { render, screen } from "@testing-library/react";
import CardProximosJogos from "@/components/admin/CardProximosJogos";

describe("CardProximosJogos", () => {
  it("exibe lista com adversários e datas", () => {
    render(<CardProximosJogos />);

    expect(screen.getByText(/Pr.+ximos Jogos/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Azul/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Verde/i)).toBeInTheDocument();
    expect(screen.getByText(/06\/07/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });
});
