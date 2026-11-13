import { fireEvent, render, screen } from "@testing-library/react";
import BottomMenuAdmin from "./BottomMenuAdmin";

let mockPathname = "/admin/mais";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "grupo-a" }),
}));
jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({ me: { membership: { role: "PRESIDENTE" } } }),
}));
jest.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { name: "Admin" } } }) }));
jest.mock("@/hooks/useAdminBadges", () => ({
  useAdminBadges: () => ({
    badges: { solicitacoes: 3 },
    entryPending: 2,
    entryLoading: false,
    monthlyPending: 1,
    monthlyLoading: false,
  }),
}));

it("mantém quatro atalhos e troca apenas Perfil Global por Mais", () => {
  render(<BottomMenuAdmin />);
  const nav = screen.getByRole("navigation");
  expect(nav).toHaveClass("lg:hidden");
  expect(nav.querySelectorAll("a")).toHaveLength(4);
  expect(screen.getByRole("link", { name: "Mais" })).toHaveAttribute("href", "/admin/mais");
  expect(screen.queryByRole("link", { name: "Perfil Global" })).not.toBeInTheDocument();
  for (const label of ["Dashboard", "Notificações", "Mensagens"]) {
    expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
  }
  const trigger = screen.getByTestId("admin-bottom-requests-trigger");
  expect(trigger).toHaveTextContent("3");
  fireEvent.click(trigger);
  expect(
    screen.getByRole("dialog", { name: "Selecionar tipo de solicitação" })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Entrada de jogadores/ })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar#solicitacoes"
  );
  expect(screen.getByRole("link", { name: /Solicitações de mensalista/ })).toHaveAttribute(
    "href",
    "/admin/jogadores/mensalistas#solicitacoes-mensalista"
  );
});

it("destaca Solicitações no destino operacional mobile", () => {
  mockPathname = "/admin/jogadores/listar-cadastrar";
  render(<BottomMenuAdmin />);
  const trigger = screen.getByTestId("admin-bottom-requests-trigger");
  expect(trigger).toHaveAttribute("aria-current", "page");
  mockPathname = "/admin/mais";
});
