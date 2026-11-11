import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";
import { useMe } from "@/hooks/useMe";

jest.mock("next/navigation", () => ({ usePathname: () => "/admin/dashboard" }));
jest.mock("next-auth/react", () => ({ signOut: jest.fn() }));
jest.mock("@/hooks/useBranding", () => ({
  useBranding: () => ({ nome: "Seu Racha", logo: "/logo.png" }),
}));
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "seu-racha" }),
}));
jest.mock("@/hooks/useMe", () => ({ useMe: jest.fn() }));

const mockedUseMe = useMe as jest.Mock;

beforeEach(() => {
  mockedUseMe.mockReturnValue({
    me: {
      tenant: { tenantSlug: "seu-racha" },
      membership: { role: "DIRETOR_FINANCEIRO", status: "APROVADO" },
    },
  });
});

it("remove o Guia da navegação lateral principal", () => {
  render(<Sidebar />);
  expect(screen.queryByRole("link", { name: "Guia Fut7Pro" })).not.toBeInTheDocument();
});

it("remove o mesmo item do menu móvel", () => {
  render(<Sidebar mobile isOpen />);
  expect(screen.queryByRole("link", { name: "Guia Fut7Pro" })).not.toBeInTheDocument();
});

it.each([false, true])("usa um chevron vetorial no menu %s ao abrir e fechar", (mobile) => {
  render(<Sidebar mobile={mobile} isOpen={mobile} />);
  const toggle = screen.getByTestId("admin-sidebar-toggle-jogadores");
  const chevron = toggle.querySelector("svg.lucide-chevron-right");

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(chevron).toHaveAttribute("aria-hidden", "true");
  expect(chevron).toHaveClass("text-zinc-300");
  expect(toggle).not.toHaveTextContent("▶");

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(chevron).toHaveClass("rotate-90", "text-yellow-200");
  expect(screen.getByRole("link", { name: "Listar/Cadastrar" })).toBeInTheDocument();

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(chevron).not.toHaveClass("rotate-90");
  expect(screen.queryByRole("link", { name: "Listar/Cadastrar" })).not.toBeInTheDocument();
});
