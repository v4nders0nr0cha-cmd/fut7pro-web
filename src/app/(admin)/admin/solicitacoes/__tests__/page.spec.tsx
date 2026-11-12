import { render, screen, within } from "@testing-library/react";
import SolicitacoesPage from "../page";

let mockTenantSlug = "grupo-a";
let mockRole = "PRESIDENTE";
let mockEntry: number | null = 0;
let mockMonthly: number | null = 0;
let mockEntryLoading = false;
let mockMonthlyLoading = false;

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: mockTenantSlug }),
}));
jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({ me: { membership: { role: mockRole } } }),
}));
jest.mock("@/hooks/useAdminBadges", () => ({
  useAdminBadges: () => ({
    badges: {
      solicitacoes: mockEntry === null || mockMonthly === null ? null : mockEntry + mockMonthly,
    },
    entryPending: mockEntry,
    entryLoading: mockEntryLoading,
    monthlyPending: mockMonthly,
    monthlyLoading: mockMonthlyLoading,
  }),
}));

describe("Central de Solicitações", () => {
  beforeEach(() => {
    mockTenantSlug = "grupo-a";
    mockRole = "PRESIDENTE";
    mockEntry = 0;
    mockMonthly = 0;
    mockEntryLoading = false;
    mockMonthlyLoading = false;
  });

  it("mostra estados vazios separados, sem confundir os totais", () => {
    render(<SolicitacoesPage />);
    expect(screen.getByRole("heading", { name: "Solicitações", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Nenhuma solicitação pendente.")).toHaveLength(2);
    expect(screen.getByText("Total pendente").parentElement).toHaveTextContent("0");
  });

  it.each([
    [3, 0, "3", "0"],
    [0, 2, "0", "2"],
    [3, 2, "3", "2"],
  ])(
    "mostra %i entradas e %i mensalistas separadamente",
    (entries, monthly, entryText, monthlyText) => {
      mockEntry = entries;
      mockMonthly = monthly;
      render(<SolicitacoesPage />);
      expect(
        within(screen.getByRole("region", { name: "Entrada de jogadores" })).getByText(entryText)
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole("region", { name: "Solicitações de mensalista" })).getByText(
          monthlyText
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Total pendente").parentElement).toHaveTextContent(
        String(entries + monthly)
      );
      expect(
        screen.getByRole("link", { name: "Analisar solicitações de entrada" })
      ).toHaveAttribute("href", "/admin/jogadores/listar-cadastrar#solicitacoes");
      expect(
        screen.getByRole("link", { name: "Analisar solicitações de mensalista" })
      ).toHaveAttribute("href", "/admin/jogadores/mensalistas#solicitacoes-mensalista");
    }
  );

  it.each(["PRESIDENTE", "VICE_PRESIDENTE", "DIRETOR_FINANCEIRO", "ADMIN", "SUPERADMIN"])(
    "oferece a análise de mensalista ao cargo %s",
    (role) => {
      mockRole = role;
      render(<SolicitacoesPage />);
      expect(
        screen.getByRole("link", { name: "Analisar solicitações de mensalista" })
      ).toBeInTheDocument();
    }
  );

  it("mostra a contagem ao Diretor de Futebol sem oferecer ação financeira", () => {
    mockRole = "DIRETOR_FUTEBOL";
    mockMonthly = 2;
    render(<SolicitacoesPage />);
    expect(
      within(screen.getByRole("region", { name: "Solicitações de mensalista" })).getByText("2")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Analisar solicitações de mensalista" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Analisar solicitações de entrada" })
    ).toBeInTheDocument();
  });

  it("não apresenta um total falso quando uma consulta falha", () => {
    mockEntry = 2;
    mockMonthly = null;
    render(<SolicitacoesPage />);
    expect(screen.getByText("Total indisponível")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Entrada de jogadores" })).getByText("2")
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Solicitações de mensalista" })).getByText("—")
    ).toBeInTheDocument();
  });

  it("substitui as contagens ao mudar o grupo ativo", () => {
    mockEntry = 2;
    mockMonthly = 1;
    const view = render(<SolicitacoesPage />);
    expect(screen.getByText("Total pendente").parentElement).toHaveTextContent("3");
    mockTenantSlug = "grupo-b";
    mockEntry = null;
    mockMonthly = null;
    mockEntryLoading = true;
    mockMonthlyLoading = true;
    view.rerender(<SolicitacoesPage />);
    expect(screen.getByText("Total pendente").parentElement).not.toHaveTextContent("3");
    expect(screen.getAllByText("Consultando pendências...")).toHaveLength(2);
  });

  it("solicita um grupo ativo antes de exibir pendências", () => {
    mockTenantSlug = "";
    mockEntry = null;
    mockMonthly = null;
    render(<SolicitacoesPage />);
    expect(
      screen.getByText("Selecione um grupo para consultar as solicitações.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Analisar solicitações de entrada" })
    ).not.toBeInTheDocument();
  });
});
