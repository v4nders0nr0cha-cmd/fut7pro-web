import { fireEvent, render, screen } from "@testing-library/react";
import SidebarMobile from "../SidebarMobile";

jest.mock("next/navigation", () => ({ usePathname: () => "/racha-azul/partidas" }));
jest.mock("@/hooks/useTema", () => ({
  useTema: () => ({ logo: "/logo.png", nome: "Racha Azul" }),
}));
jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({ publicHref: (path: string) => `/racha-azul${path}` }),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

describe("sidebar pública", () => {
  it("mantém páginas do grupo e não mistura os acessos pessoais", () => {
    render(<SidebarMobile open onClose={jest.fn()} />);
    expect(screen.getByRole("link", { name: "Partidas" })).toHaveAttribute(
      "href",
      "/racha-azul/partidas"
    );
    expect(screen.getByRole("link", { name: "Partidas" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Perfis dos Atletas" })).toBeInTheDocument();
    expect(screen.getByLabelText("Navegação do grupo")).toHaveClass("overflow-y-auto");
    expect(screen.getByLabelText("Navegação do grupo").parentElement).toHaveClass("lg:hidden");
    expect(screen.queryByText("Sair da conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Trocar de grupo")).not.toBeInTheDocument();
  });

  it("fecha por Escape e por interação externa", () => {
    const close = jest.fn();
    render(<SidebarMobile open onClose={close} />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Fechar menu ao tocar fora" }));
    expect(close).toHaveBeenCalledTimes(2);
  });
});
