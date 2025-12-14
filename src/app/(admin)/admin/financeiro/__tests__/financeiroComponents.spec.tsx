import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalLancamento from "@/app/(admin)/admin/financeiro/prestacao-de-contas/components/ModalLancamento";
import TabelaLancamentos from "@/app/(admin)/admin/financeiro/prestacao-de-contas/components/TabelaLancamentos";
import ToggleVisibilidadePublica from "@/app/(admin)/admin/financeiro/prestacao-de-contas/components/ToggleVisibilidadePublica";
import type { LancamentoFinanceiro } from "@/types/financeiro";

describe("ModalLancamento", () => {
  it("valida obrigatorios antes de salvar e dispara callbacks ao preencher", async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    const { container } = render(
      <ModalLancamento open onClose={onClose} onSave={onSave} initialData={null} />
    );
    const form = container.querySelector("form");
    if (form) {
      form.noValidate = true;
    }

    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));
    expect(await screen.findByText(/Preencha todos/i)).toBeInTheDocument();

    fireEvent.change(container.querySelector('input[name="data"]')!, {
      target: { value: "2025-01-10" },
    });
    fireEvent.change(container.querySelector('select[name="categoria"]')!, {
      target: { value: "Campo" },
    });
    fireEvent.change(container.querySelector('input[name="descricao"]')!, {
      target: { value: "Mensalidade" },
    });
    fireEvent.change(container.querySelector('input[name="valor"]')!, { target: { value: "150" } });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0] as LancamentoFinanceiro;
    expect(payload.valor).toBe(150);
    expect(payload.categoria).toBe("Campo");
    expect(payload.id).toBeTruthy();
  });

  it("mantem dados iniciais no modo edicao e exibe comprovante", () => {
    const onSave = jest.fn();
    const initial: LancamentoFinanceiro = {
      id: "abc123",
      data: "2025-02-01",
      tipo: "saida",
      categoria: "Material",
      descricao: "Bolas novas",
      valor: -75,
      comprovanteUrl: "/images/comprovantes/comprovante_05.png",
      responsavel: "Admin",
    };

    const { container } = render(
      <ModalLancamento open onClose={jest.fn()} onSave={onSave} initialData={initial} />
    );

    expect(screen.getByAltText(/Comprovante/i)).toBeInTheDocument();

    fireEvent.change(container.querySelector('input[name="descricao"]')!, {
      target: { value: "Bolas oficiais" },
    });
    fireEvent.change(container.querySelector('select[name="tipo"]')!, {
      target: { value: "entrada" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    const payload = onSave.mock.calls[0][0] as LancamentoFinanceiro;
    expect(payload.id).toBe("abc123");
    expect(payload.descricao).toBe("Bolas oficiais");
    expect(payload.tipo).toBe("entrada");
  });
});

describe("TabelaLancamentos", () => {
  const baseLancamento: LancamentoFinanceiro = {
    id: "l-0",
    data: "2025-01-01",
    tipo: "entrada",
    categoria: "Campo",
    descricao: "Mensalidade",
    valor: 100,
    comprovanteUrl: "/images/comprovantes/comp.png",
    responsavel: "Admin",
  };

  it("renderiza estado vazio", () => {
    render(<TabelaLancamentos lancamentos={[]} onEdit={jest.fn()} />);
    expect(screen.getByText(/Nenhum lan/i)).toBeInTheDocument();
  });

  it("permite editar e alternar entre ver mais e ver menos", () => {
    const lancamentos: LancamentoFinanceiro[] = Array.from({ length: 7 }).map((_, idx) => ({
      ...baseLancamento,
      id: `l-${idx}`,
      descricao: `Item ${idx + 1}`,
      valor: 100 + idx,
    }));
    const onEdit = jest.fn();

    render(<TabelaLancamentos lancamentos={lancamentos} onEdit={onEdit} />);

    fireEvent.click(screen.getAllByText(/Editar/i)[0]);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "l-0" }));

    const toggle = screen.getByRole("button", { name: /Ver mais/i });
    expect(toggle).toHaveTextContent("(1)");
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent(/Ver menos/i);
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("(1)");
  });
});

describe("ToggleVisibilidadePublica", () => {
  it("dispara onToggle e reflete aria-pressed", () => {
    const onToggle = jest.fn();
    const { rerender } = render(<ToggleVisibilidadePublica visivel={false} onToggle={onToggle} />);

    const botao = screen.getByRole("button", { name: /Alternar/i });
    fireEvent.click(botao);
    expect(onToggle).toHaveBeenCalledWith(true);

    rerender(<ToggleVisibilidadePublica visivel onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: /Alternar/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
