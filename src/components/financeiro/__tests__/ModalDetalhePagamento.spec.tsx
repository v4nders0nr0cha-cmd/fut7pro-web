import { fireEvent, render, screen } from "@testing-library/react";
import ModalDetalhePagamento from "@/components/financeiro/ModalDetalhePagamento";

const pagamento = {
  id: "p1",
  status: "pago",
  data: "2025-12-18",
  valor: 120,
  metodo: "pix",
  referencia: "ref-1",
  descricao: "Mensalidade",
} as any;

describe("ModalDetalhePagamento", () => {
  it("retorna null quando fechado ou sem pagamento", () => {
    const { container } = render(
      <ModalDetalhePagamento open={false} pagamento={null} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("exibe dados e executa download quando solicitado", () => {
    const onDownloadRecibo = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalDetalhePagamento
        open
        pagamento={pagamento}
        onClose={onClose}
        onDownloadRecibo={onDownloadRecibo}
      />
    );

    expect(screen.getByText(/Detalhes do Pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/pago/i)).toBeInTheDocument();
    expect(screen.getByText(/ref-1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Baixar Recibo/i }));
    expect(onDownloadRecibo).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText(/Fechar/i));
    expect(onClose).toHaveBeenCalled();
  });
});
