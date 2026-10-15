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

describe("Backup & Recuperação - navegação", () => {
  it("mantém a página e aponta para a Central em Administração", () => {
    render(<BackupPage />);

    expect(screen.getByRole("link", { name: "Abrir Central de Recuperação" })).toHaveAttribute(
      "href",
      "/admin/administracao/central-recuperacao"
    );
    expect(screen.getByText("Backup & Recuperação")).toBeInTheDocument();
  });
});
