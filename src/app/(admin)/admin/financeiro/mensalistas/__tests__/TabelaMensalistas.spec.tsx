import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import TabelaMensalistas, {
  type MensalistaResumo,
} from "@/app/(admin)/admin/financeiro/mensalistas/components/TabelaMensalistas";

const mensalistas: MensalistaResumo[] = [
  { id: "m1", nome: "Alice", status: "Em dia", valor: 120, ultimoPagamento: "2025-02-15" },
  { id: "m2", nome: "Bruno", status: "Inadimplente", valor: 150, ultimoPagamento: null },
  { id: "m3", nome: "Carla", status: "A receber", valor: 200, ultimoPagamento: "2025-03-01" },
];

const agendaItems = [
  { id: "a1", weekday: 1, time: "19:00" },
  { id: "a2", weekday: 6, time: "06:00" },
];

const diasSelecionados: Record<string, string[]> = {
  m1: ["a1", "a2"],
  m2: ["a2"],
  m3: [],
};

function TestWrapper({ onOpenGestaoDias }: { onOpenGestaoDias: jest.Mock }) {
  const [pagamentos, setPagamentos] = useState<Record<string, boolean>>({
    m1: false,
    m2: false,
    m3: false,
  });

  const getDiasSelecionados = (id: string) => diasSelecionados[id] ?? [];

  const togglePagamento = (id: string) => {
    setPagamentos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const togglePagamentoAll = (checked: boolean, athleteIds: string[]) => {
    setPagamentos((prev) => {
      const next = { ...prev };
      athleteIds.forEach((athleteId) => {
        next[athleteId] = checked;
      });
      return next;
    });
  };

  return (
    <TabelaMensalistas
      mensalistas={mensalistas}
      agendaItems={agendaItems}
      getDiasSelecionados={getDiasSelecionados}
      pagamentos={pagamentos}
      onTogglePagamento={togglePagamento}
      onTogglePagamentoAll={togglePagamentoAll}
      onOpenGestaoDias={onOpenGestaoDias}
    />
  );
}

describe("TabelaMensalistas", () => {
  it("renderiza lista, dias vinculados e controla pagamento", () => {
    const onOpenGestaoDias = jest.fn();
    render(<TestWrapper onOpenGestaoDias={onOpenGestaoDias} />);

    expect(screen.getAllByRole("row")).toHaveLength(mensalistas.length + 1);

    const primeiraLinha = screen.getAllByRole("row")[1];
    expect(within(primeiraLinha).getByText("Alice")).toBeInTheDocument();
    expect(within(primeiraLinha).getByText("Em dia")).toHaveClass("text-green-400");
    expect(within(primeiraLinha).getByText("R$ 120.00")).toBeInTheDocument();
    expect(within(primeiraLinha).getByText(/Segunda-feira 19:00/i)).toBeInTheDocument();

    const headerCheckbox = screen.getByLabelText("Marcar todos como pago") as HTMLInputElement;
    const aliceCheckbox = screen.getByLabelText("Marcar Alice como pago") as HTMLInputElement;
    const brunoCheckbox = screen.getByLabelText("Marcar Bruno como pago") as HTMLInputElement;
    const carlaCheckbox = screen.getByLabelText("Marcar Carla como pago") as HTMLInputElement;

    expect(screen.getAllByRole("checkbox")).toHaveLength(mensalistas.length + 1);
    expect(headerCheckbox).not.toBeChecked();
    expect(aliceCheckbox).not.toBeChecked();

    fireEvent.click(aliceCheckbox);
    expect(aliceCheckbox).toBeChecked();
    expect(headerCheckbox.indeterminate).toBe(true);

    fireEvent.click(headerCheckbox);
    expect(headerCheckbox).toBeChecked();
    expect(aliceCheckbox).toBeChecked();
    expect(brunoCheckbox).toBeChecked();
    expect(carlaCheckbox).toBeChecked();

    fireEvent.click(headerCheckbox);
    expect(headerCheckbox).not.toBeChecked();
    expect(aliceCheckbox).not.toBeChecked();

    const botoesEditar = screen.getAllByRole("button", { name: /Editar em Jogadores/i });
    expect(botoesEditar).toHaveLength(mensalistas.length);

    fireEvent.click(botoesEditar[0]);
    expect(onOpenGestaoDias).toHaveBeenCalledWith("m1");
  });
});
