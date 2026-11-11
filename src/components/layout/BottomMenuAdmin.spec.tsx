import { render, screen } from "@testing-library/react";
import BottomMenuAdmin from "./BottomMenuAdmin";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/mais",
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { name: "Admin" } } }) }));
jest.mock("@/hooks/useAdminBadges", () => ({ useAdminBadges: () => ({ badges: {} }) }));

it("mantém quatro atalhos e troca apenas Perfil Global por Mais", () => {
  render(<BottomMenuAdmin />);
  const nav = screen.getByRole("navigation");
  expect(nav).toHaveClass("lg:hidden");
  expect(nav.querySelectorAll("a")).toHaveLength(5);
  expect(screen.getByRole("link", { name: "Mais" })).toHaveAttribute("href", "/admin/mais");
  expect(screen.queryByRole("link", { name: "Perfil Global" })).not.toBeInTheDocument();
  for (const label of ["Dashboard", "Notificações", "Mensagens", "Solicitações"]) {
    expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
  }
});
