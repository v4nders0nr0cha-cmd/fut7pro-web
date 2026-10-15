import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";

let role = "PRESIDENTE";
let status = "APROVADO";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/administracao/central-recuperacao",
}));

jest.mock("next-auth/react", () => ({ signOut: jest.fn() }));

jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({
    me: {
      membership: { role, status },
      tenant: { tenantSlug: "racha-a" },
    },
  }),
}));

jest.mock("@/hooks/useBranding", () => ({
  useBranding: () => ({ nome: "Seu Racha", logo: "/logo.png" }),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "racha-a" }),
}));

describe("Sidebar - Central de Recuperação", () => {
  beforeEach(() => {
    role = "PRESIDENTE";
    status = "APROVADO";
  });

  it("exibe a Central para o Presidente", () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: /^Administração/ }));

    expect(screen.getByRole("link", { name: "Central de Recuperação" })).toHaveAttribute(
      "href",
      "/admin/administracao/central-recuperacao"
    );
    expect(screen.getByText("Transferir Propriedade").closest("li")?.nextSibling).toContainElement(
      screen.getByRole("link", { name: "Central de Recuperação" })
    );

    fireEvent.click(screen.getByRole("button", { name: /Configurações\/Extras/ }));
    expect(screen.queryByRole("link", { name: "Central de Recuperação" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Backup & Recuperação" })).toBeInTheDocument();
  });

  it("mantém as demais opções de Administração para outro cargo", () => {
    role = "DIRETOR_FUTEBOL";
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: /^Administração/ }));

    expect(screen.queryByRole("link", { name: "Central de Recuperação" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Administradores" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Permissões" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Logs/Admin" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transferir Propriedade" })).toBeInTheDocument();
  });

  it.each(["PENDENTE", "SUSPENSO"])(
    "não exibe a Central para Presidente com Membership %s",
    (membershipStatus) => {
      status = membershipStatus;
      render(<Sidebar />);
      fireEvent.click(screen.getByRole("button", { name: /^Administração/ }));

      expect(
        screen.queryByRole("link", { name: "Central de Recuperação" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Administradores" })).toBeInTheDocument();
    }
  );
});
