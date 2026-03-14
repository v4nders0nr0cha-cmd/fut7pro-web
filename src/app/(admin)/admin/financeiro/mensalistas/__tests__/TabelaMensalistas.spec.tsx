import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import TabelaMensalistas, {
  type MensalistaResumo,
} from "@/app/(admin)/admin/financeiro/mensalistas/components/TabelaMensalistas";

const mensalistas: MensalistaResumo[] = [
  {
    id: "m1",
    nome: "Alice",
    valor: 120,
    statusPagamento: "pendente",
    pagamentoData: null,
    diasResumo: "Segunda 19:00",
    jogosNoMes: 4,
    classificacaoDia: "segunda",
  },
  {
    id: "m2",
    nome: "Bruno",
    valor: 150,
    statusPagamento: "pago",
    pagamentoData: "2026-03-05",
    diasResumo: "Segunda 19:00 • Sábado 07:00",
    jogosNoMes: 8,
    classificacaoDia: "segunda-sabado",
    ultimoLancamentoId: "fin-2",
  },
];

const agendaItems = [
  { id: "a1", weekday: 1, time: "19:00" },
  { id: "a2", weekday: 6, time: "07:00" },
];

function TestWrapper({
  onSaveDias,
  onRegistrarPagamento,
  onVerLancamento,
  onCancelarPagamento,
}: {
  onSaveDias: jest.Mock;
  onRegistrarPagamento: jest.Mock;
  onVerLancamento: jest.Mock;
  onCancelarPagamento: jest.Mock;
}) {
  const [diasSelecionados, setDiasSelecionados] = useState<Record<string, string[]>>({
    m1: ["a1"],
    m2: ["a1", "a2"],
  });

  return (
    <TabelaMensalistas
      mensalistas={mensalistas}
      agendaItems={agendaItems}
      getDiasSelecionados={(id) => diasSelecionados[id] ?? []}
      onSaveDias={(id, dias) => {
        setDiasSelecionados((prev) => ({ ...prev, [id]: dias }));
        onSaveDias(id, dias);
      }}
      onRegistrarPagamento={onRegistrarPagamento}
      onVerLancamento={onVerLancamento}
      onCancelarPagamento={onCancelarPagamento}
    />
  );
}

describe("TabelaMensalistas", () => {
  it("renderiza status e ações financeiras por atleta", () => {
    const onSaveDias = jest.fn();
    const onRegistrarPagamento = jest.fn();
    const onVerLancamento = jest.fn();
    const onCancelarPagamento = jest.fn();

    render(
      <TestWrapper
        onSaveDias={onSaveDias}
        onRegistrarPagamento={onRegistrarPagamento}
        onVerLancamento={onVerLancamento}
        onCancelarPagamento={onCancelarPagamento}
      />
    );

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);

    const aliceRow = rows[1];
    expect(within(aliceRow).getByText("Alice")).toBeInTheDocument();
    expect(within(aliceRow).getByText("Pendente")).toBeInTheDocument();
    expect(
      within(aliceRow).getByRole("button", { name: /Registrar pagamento/i })
    ).toBeInTheDocument();

    fireEvent.click(within(aliceRow).getByRole("button", { name: /Registrar pagamento/i }));
    expect(onRegistrarPagamento).toHaveBeenCalledWith("m1");

    const brunoRow = rows[2];
    expect(within(brunoRow).getByText("Pago")).toBeInTheDocument();
    fireEvent.click(within(brunoRow).getByRole("button", { name: /Ver lançamento/i }));
    expect(onVerLancamento).toHaveBeenCalledWith("fin-2", "m2");

    fireEvent.click(within(brunoRow).getByRole("button", { name: /Cancelar pagamento/i }));
    expect(onCancelarPagamento).toHaveBeenCalledWith("m2");
  });

  it("abre modal de dias vinculados e salva seleção", () => {
    const onSaveDias = jest.fn();
    render(
      <TestWrapper
        onSaveDias={onSaveDias}
        onRegistrarPagamento={jest.fn()}
        onVerLancamento={jest.fn()}
        onCancelarPagamento={jest.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Definir dias/i })[0]);
    expect(screen.getByText("Editar dias do mensalista")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Marcar todos/i }));
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(onSaveDias).toHaveBeenCalledWith("m1", ["a1", "a2"]);
  });
});
