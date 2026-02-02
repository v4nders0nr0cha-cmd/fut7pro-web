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
  it("preenche campos obrigatorios e envia dados via onSave", () => {
    render(<ModalPatrocinador {...baseProps} initial={{ logo: "/logo.png" }} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Academia X" } });
    fireEvent.change(screen.getByLabelText("Subtítulo/Categoria"), {
      target: { value: "Academia e Bem-estar" },
    });
    fireEvent.change(screen.getByLabelText("Plano do Patrocinador *"), {
      target: { value: "ANUAL" },
    });
    fireEvent.change(screen.getByLabelText(/Quanto este patrocinador paga por ano/i), {
      target: { value: "750" },
    });
    fireEvent.click(screen.getByLabelText("Já recebi"));
    fireEvent.change(screen.getByLabelText("Data do recebimento *"), {
      target: { value: "2026-01-12" },
    });
    fireEvent.change(screen.getByLabelText("Status *"), { target: { value: "encerrado" } });
    fireEvent.change(screen.getByLabelText("Descrição/Observações"), {
      target: { value: "Plano trimestral" },
    });
    fireEvent.change(screen.getByLabelText("Link (opcional)"), {
      target: { value: "https://exemplo.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(baseProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Academia X",
        ramo: "Academia e Bem-estar",
        valor: 750,
        status: "encerrado",
        observacoes: "Plano trimestral",
        link: "https://exemplo.com",
        billingPlan: "ANUAL",
        firstReceivedAt: "2026-01-12",
      })
    );
  });

  it("renderiza dados iniciais ao editar e fecha no botao de fechar", () => {
    const initial: (typeof baseProps)["onSave"] extends (arg: infer T) => void ? T : never = {
      id: "p-1",
      nome: "Loja",
      valor: 500,
      periodoInicio: "2025-01-10",
      periodoFim: "2025-03-10",
      status: "ativo" as const,
      billingPlan: "MENSAL",
      logo: "/logo.png",
      observacoes: "Obs",
      link: "https://loja.com",
    };
    render(<ModalPatrocinador {...baseProps} initial={initial} />);

    expect(screen.getByDisplayValue("Loja")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://loja.com")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("2025-01-10")).not.toBeInTheDocument();
    expect(screen.getByAltText(/Logo patrocinador/i)).toBeInTheDocument();
    expect((screen.getByLabelText("Plano do Patrocinador *") as HTMLSelectElement).value).toBe(
      "MENSAL"
    );

    fireEvent.click(screen.getByRole("button", { name: /Fechar modal/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
