import { render, screen } from "@testing-library/react";
import CardCicloPlano from "@/components/admin/CardCicloPlano";

describe("CardCicloPlano", () => {
  it("exibe contagem e mensagem de trial conforme dias", () => {
    render(<CardCicloPlano diasRestantes={10} tipoPlano="trial" />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/jogo/i)).toBeInTheDocument();
  });

  it("mostra alerta de acréscimos quando faltam 2 dias", () => {
    render(<CardCicloPlano diasRestantes={2} tipoPlano="trial" />);
    expect(screen.getByText(/acréscimos/i)).toBeInTheDocument();
  });

  it("omite mensagem para planos pagos", () => {
    render(<CardCicloPlano diasRestantes={5} tipoPlano="mensal" />);
    expect(screen.queryByText(/garanta seu plano/i)).not.toBeInTheDocument();
  });
});
