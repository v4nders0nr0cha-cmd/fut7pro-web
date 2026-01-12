import { fireEvent, render, screen } from "@testing-library/react";
import TabelaPatrocinadores from "@/app/(admin)/admin/financeiro/patrocinadores/components/TabelaPatrocinadores";
import type { Patrocinador } from "@/types/financeiro";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt || ""} {...props} />,
}));

const patrocinadores: Patrocinador[] = [
  {
    id: "p1",
    nome: "Patrocinador 1",
    valor: 1000,
    periodoInicio: "2025-01-10",
    periodoFim: "2025-02-10",
    nextDueAt: "2000-01-01",
    status: "ativo",
    billingPlan: "MENSAL",
    logo: "/logo1.png",
    visivel: true,
    descricao: "Desc 1",
    link: "https://p1.com",
    comprovantes: [],
    displayOrder: 1,
  },
  {
    id: "p2",
    nome: "Patrocinador 2",
    valor: 500,
    periodoInicio: "2025-03-01",
    periodoFim: "2025-05-01",
    nextDueAt: "2099-01-01",
    status: "encerrado",
    billingPlan: "ANUAL",
    logo: "/logo2.png",
    visivel: false,
    comprovantes: [],
    displayOrder: 2,
  },
];

const baseProps = {
  onEditar: jest.fn(),
  onExcluir: jest.fn(),
  onToggleVisivel: jest.fn(),
  onNovo: jest.fn(),
  onConfirmarRecebimento: jest.fn(),
  confirmandoId: null,
};

describe("TabelaPatrocinadores", () => {
  it("renderiza cards com acoes e botao de adicionar ate 10 slots", () => {
    render(<TabelaPatrocinadores patrocinadores={patrocinadores} {...baseProps} />);

    expect(screen.getByText("Patrocinador 1")).toBeInTheDocument();
    expect(screen.getByText("Patrocinador 2")).toBeInTheDocument();
    expect(screen.getByText(/Renovacao pendente desde/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar recebimento/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Adicionar patrocinador/i)).toHaveLength(8);
  });

  it("dispara callbacks ao interagir com icones e botoes", () => {
    render(<TabelaPatrocinadores patrocinadores={patrocinadores} {...baseProps} />);

    fireEvent.click(screen.getByTitle(/Ocultar do site/i));
    expect(baseProps.onToggleVisivel).toHaveBeenCalledWith("p1");

    fireEvent.click(screen.getAllByTitle(/Editar/i)[0]);
    expect(baseProps.onEditar).toHaveBeenCalledWith(expect.objectContaining({ id: "p1" }));

    fireEvent.click(screen.getAllByTitle(/Excluir/i)[0]);
    expect(baseProps.onExcluir).toHaveBeenCalledWith("p1");

    fireEvent.click(screen.getAllByLabelText(/Adicionar patrocinador/i)[0]);
    expect(baseProps.onNovo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Confirmar recebimento/i }));
    expect(baseProps.onConfirmarRecebimento).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p1" })
    );
  });
});
