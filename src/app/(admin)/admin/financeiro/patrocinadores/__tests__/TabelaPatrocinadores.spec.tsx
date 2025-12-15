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
    status: "ativo",
    logo: "/logo1.png",
    visivel: true,
    descricao: "Desc 1",
    link: "https://p1.com",
    comprovantes: [],
  },
  {
    id: "p2",
    nome: "Patrocinador 2",
    valor: 500,
    periodoInicio: "2025-03-01",
    periodoFim: "2025-05-01",
    status: "encerrado",
    logo: "/logo2.png",
    visivel: false,
    comprovantes: [],
  },
];

const baseProps = {
  onEditar: jest.fn(),
  onExcluir: jest.fn(),
  onToggleVisivel: jest.fn(),
  onNovo: jest.fn(),
};

describe("TabelaPatrocinadores", () => {
  it("renderiza cards com ações e botão de adicionar até 10 slots", () => {
    render(<TabelaPatrocinadores patrocinadores={patrocinadores} {...baseProps} />);

    expect(screen.getByText("Patrocinador 1")).toBeInTheDocument();
    expect(screen.getByText("Patrocinador 2")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Adicionar novo patrocinador/i)).toHaveLength(8);
  });

  it("dispara callbacks ao interagir com ícones e botões", () => {
    render(<TabelaPatrocinadores patrocinadores={patrocinadores} {...baseProps} />);

    fireEvent.click(screen.getByTitle(/Ocultar do site/i));
    expect(baseProps.onToggleVisivel).toHaveBeenCalledWith("p1");

    fireEvent.click(screen.getAllByTitle(/Editar/i)[0]);
    expect(baseProps.onEditar).toHaveBeenCalledWith(expect.objectContaining({ id: "p1" }));

    fireEvent.click(screen.getAllByTitle(/Excluir/i)[0]);
    expect(baseProps.onExcluir).toHaveBeenCalledWith("p1");

    fireEvent.click(screen.getAllByLabelText(/Adicionar novo patrocinador/i)[0]);
    expect(baseProps.onNovo).toHaveBeenCalledTimes(1);
  });
});
