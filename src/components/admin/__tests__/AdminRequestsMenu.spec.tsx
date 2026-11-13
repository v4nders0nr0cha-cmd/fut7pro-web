import { fireEvent, render, screen, within } from "@testing-library/react";
import AdminRequestsMenu from "../AdminRequestsMenu";

let mockTenantSlug = "grupo-a";
let mockRole = "PRESIDENTE";
let mockPathname = "/admin/dashboard";

jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: mockTenantSlug }),
}));
jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({ me: { membership: { role: mockRole } } }),
}));

const props = {
  total: 3,
  entryPending: 2,
  entryLoading: false,
  monthlyPending: 1,
  monthlyLoading: false,
};

describe("menu de Solicitações", () => {
  beforeEach(() => {
    mockTenantSlug = "grupo-a";
    mockRole = "PRESIDENTE";
    mockPathname = "/admin/dashboard";
  });

  it("mostra as duas contagens e os destinos diretos no dropdown desktop", () => {
    render(<AdminRequestsMenu variant="header" {...props} />);
    const trigger = screen.getByRole("button", { name: "Solicitações" });
    expect(trigger).toHaveTextContent("3");
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Selecionar tipo de solicitação" });
    expect(within(dialog).getByRole("link", { name: /Entrada de jogadores/ })).toHaveAttribute(
      "href",
      "/admin/jogadores/listar-cadastrar#solicitacoes"
    );
    expect(
      within(dialog).getByRole("link", { name: /Solicitações de mensalista/ })
    ).toHaveAttribute("href", "/admin/jogadores/mensalistas#solicitacoes-mensalista");
    expect(within(dialog).getByText("2", { selector: "span" })).toBeInTheDocument();
    expect(within(dialog).getByText("1", { selector: "span" })).toBeInTheDocument();
  });

  it("fecha com Escape e clique externo e devolve o foco ao botão", () => {
    render(<AdminRequestsMenu variant="header" {...props} />);
    const trigger = screen.getByRole("button", { name: "Solicitações" });
    fireEvent.click(trigger);
    expect(screen.getByRole("link", { name: /Entrada de jogadores/ })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre painel mobile rolável, trava o fundo e fecha pela sobreposição", () => {
    render(<AdminRequestsMenu variant="bottom" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitações" }));
    const dialog = screen.getByRole("dialog", { name: "Selecionar tipo de solicitação" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveClass("overflow-y-auto");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Fechar solicitações" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it.each([
    ["DIRETOR_FUTEBOL", false, false],
    ["DIRETOR_FINANCEIRO", false, true],
    ["VICE_PRESIDENTE", true, true],
    ["PRESIDENTE", true, true],
  ])("respeita as ações do cargo %s", (role, entry, monthly) => {
    mockRole = role;
    render(<AdminRequestsMenu variant="header" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitações" }));
    expect(Boolean(screen.queryByRole("link", { name: /Entrada de jogadores/ }))).toBe(entry);
    expect(Boolean(screen.queryByRole("link", { name: /Solicitações de mensalista/ }))).toBe(
      monthly
    );
    expect(screen.getByText("2", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "span" })).toBeInTheDocument();
  });

  it("não inventa zero quando uma contagem falha", () => {
    render(<AdminRequestsMenu variant="header" {...props} total={null} entryPending={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitações" }));
    expect(screen.getByText("Contagem indisponível")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("não oferece ações sem grupo ativo", () => {
    mockTenantSlug = "";
    render(<AdminRequestsMenu variant="header" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Solicitações" }));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Selecione um grupo para analisar pedidos.")).toBeInTheDocument();
  });
});
