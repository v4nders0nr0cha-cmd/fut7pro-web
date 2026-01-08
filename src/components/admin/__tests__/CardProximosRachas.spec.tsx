import { render, screen } from "@testing-library/react";
import CardProximosRachas from "@/components/admin/CardProximosRachas";

describe("CardProximosRachas", () => {
  it("exibe skeleton quando loading", () => {
    const { container } = render(<CardProximosRachas proximos={[]} isLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(4);
  });

  it("mostra lista de dias e horarios", () => {
    render(
      <CardProximosRachas
        proximos={[
          { id: "r1", dataStr: "10/02/2025", detalhe: "19h - Quadra A" },
          { id: "r2", dataStr: "17/02/2025" },
        ]}
        manageHref="/admin/rachas"
      />
    );
    expect(screen.getByText("10/02/2025")).toBeInTheDocument();
    expect(screen.getByText(/Quadra A/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gerenciar dias/i })).toHaveAttribute(
      "href",
      "/admin/rachas"
    );
  });

  it("mostra estado vazio sem rachas", () => {
    render(<CardProximosRachas proximos={[]} />);
    expect(screen.getByText(/Nenhuma agenda encontrada/i)).toBeInTheDocument();
  });
});
