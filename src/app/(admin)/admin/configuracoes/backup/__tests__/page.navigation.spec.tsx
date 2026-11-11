import { render, screen } from "@testing-library/react";
import BackupPage from "../page";

jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({
    data: [],
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  }),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "racha-a" }),
}));

describe("Backup e Recuperação - navegação", () => {
  it("mostra recuperação antes dos diagnósticos e preserva o acesso", () => {
    render(<BackupPage />);

    expect(screen.getByRole("link", { name: "Abrir Central de Recuperação" })).toHaveAttribute(
      "href",
      "/admin/administracao/central-recuperacao"
    );
    expect(screen.getByText("Backup e Recuperação")).toBeInTheDocument();
    expect(screen.getByText(/não cria um backup/)).toBeInTheDocument();
    const headings = screen.getAllByText(/Precisa restaurar|Histórico de diagnósticos/);
    expect(headings[0]).toHaveTextContent("Precisa restaurar");
  });
});
