import { render, screen, within } from "@testing-library/react";
import TabelaMensalistas, {
  type MensalistaResumo,
} from "@/app/(admin)/admin/financeiro/mensalistas/components/TabelaMensalistas";

const mensalistas: MensalistaResumo[] = [
  { id: "m1", nome: "Alice", status: "Em dia", valor: 120, ultimoPagamento: "2025-02-15" },
  { id: "m2", nome: "Bruno", status: "Inadimplente", valor: 150, ultimoPagamento: null },
  { id: "m3", nome: "Carla", status: "A receber", valor: 200, ultimoPagamento: "2025-03-01" },
];

describe("TabelaMensalistas", () => {
  it("renderiza lista com valores e datas formatadas", () => {
    render(<TabelaMensalistas mensalistas={mensalistas} />);

    expect(screen.getAllByRole("row")).toHaveLength(mensalistas.length + 1); // header + itens

    const primeiraLinha = screen.getAllByRole("row")[1];
    expect(within(primeiraLinha).getByText("Alice")).toBeInTheDocument();
    expect(within(primeiraLinha).getByText("Em dia")).toHaveClass("text-green-400");
    expect(within(primeiraLinha).getByText("R$ 120.00")).toBeInTheDocument();
    expect(within(primeiraLinha).getByText("15/02/2025")).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /Editar/i })).toHaveLength(mensalistas.length);
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getByText("Carla")).toBeInTheDocument();
  });
});
