import { fireEvent, render, screen } from "@testing-library/react";
import ModalPatrocinador from "@/app/(admin)/admin/financeiro/patrocinadores/components/ModalPatrocinador";

// Mock next/image para o ambiente de teste
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt || ""} {...props} />,
}));

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
};

describe("ModalPatrocinador", () => {
  it("preenche campos obrigatórios e envia dados via onSave", () => {
    const { container } = render(<ModalPatrocinador {...baseProps} />);

    const inputs = container.querySelectorAll("input");
    const [nome, valor, inicio, fim] = inputs;
    fireEvent.change(nome!, { target: { value: "Academia X" } });
    fireEvent.change(valor!, { target: { value: "750" } });
    fireEvent.change(inicio!, { target: { value: "2025-02-01" } });
    fireEvent.change(fim!, { target: { value: "2025-06-30" } });

    fireEvent.change(container.querySelector("select")!, { target: { value: "encerrado" } });

    fireEvent.change(container.querySelector("textarea")!, {
      target: { value: "Plano trimestral" },
    });
    fireEvent.change(inputs[inputs.length - 1]!, { target: { value: "https://exemplo.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(baseProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Academia X",
        valor: 750,
        periodoInicio: "2025-02-01",
        periodoFim: "2025-06-30",
        status: "encerrado",
        observacoes: "Plano trimestral",
        link: "https://exemplo.com",
      })
    );
  });

  it("renderiza dados iniciais ao editar e fecha no botão de fechar", () => {
    const initial: (typeof baseProps)["onSave"] extends (arg: infer T) => void ? T : never = {
      id: "p-1",
      nome: "Loja",
      valor: 500,
      periodoInicio: "2025-01-10",
      periodoFim: "2025-03-10",
      status: "ativo" as const,
      logo: "/logo.png",
      observacoes: "Obs",
      link: "https://loja.com",
    };
    render(<ModalPatrocinador {...baseProps} initial={initial} />);

    expect(screen.getByDisplayValue("Loja")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-01-10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://loja.com")).toBeInTheDocument();
    expect(screen.getByAltText(/Logo patrocinador/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Fechar modal/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
