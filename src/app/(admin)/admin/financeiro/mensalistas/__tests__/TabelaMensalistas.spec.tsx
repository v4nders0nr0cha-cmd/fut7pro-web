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

function TestWrapper({ onSaveDias }: { onSaveDias: jest.Mock }) {
  const [pagamentos, setPagamentos] = useState<Record<string, boolean>>({
    m1: false,
    m2: false,
    m3: false,
  });
  const [diasSelecionados, setDiasSelecionados] = useState<Record<string, string[]>>({});

  const getDiasSelecionados = (id: string) => diasSelecionados[id] ?? [];

  const handleSaveDias = (id: string, dias: string[]) => {
    setDiasSelecionados((prev) => ({ ...prev, [id]: dias }));
    onSaveDias(id, dias);
  };

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
      onSaveDias={handleSaveDias}
      pagamentos={pagamentos}
      onTogglePagamento={togglePagamento}
      onTogglePagamentoAll={togglePagamentoAll}
    />
  );
}

describe("TabelaMensalistas", () => {
  it("renderiza lista e controla pagamento", () => {
    const onSaveDias = jest.fn();
    render(<TestWrapper onSaveDias={onSaveDias} />);

    expect(screen.getAllByRole("row")).toHaveLength(mensalistas.length + 1);

    const primeiraLinha = screen.getAllByRole("row")[1];
    expect(within(primeiraLinha).getByText("Alice")).toBeInTheDocument();
    expect(within(primeiraLinha).getByText("Em dia")).toHaveClass("text-green-400");
    expect(within(primeiraLinha).getByText("R$ 120.00")).toBeInTheDocument();

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

    const definirDiasButtons = screen.getAllByRole("button", { name: /Definir dias/i });
    expect(definirDiasButtons).toHaveLength(mensalistas.length);

    fireEvent.click(definirDiasButtons[0]);
    expect(screen.getByText("Dias de mensalista")).toBeInTheDocument();

    const segundaCheckbox = screen.getByLabelText("Segunda-feira 19:00") as HTMLInputElement;
    const sabadoCheckbox = screen.getByLabelText("Sabado 06:00") as HTMLInputElement;
    expect(segundaCheckbox).not.toBeChecked();
    expect(sabadoCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Marcar todos/i }));
    expect(segundaCheckbox).toBeChecked();
    expect(sabadoCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));
    expect(onSaveDias).toHaveBeenCalledWith("m1", ["a1", "a2"]);
  });
});
