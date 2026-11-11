import { fireEvent, render, screen } from "@testing-library/react";
import { signOut } from "next-auth/react";
import Header from "../Header";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useAdminBadges", () => ({
  useAdminBadges: () => ({
    badges: {
      notificacoes: 2,
      mensagens: 1,
      solicitacoes: 3,
    },
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        name: "Felipe",
        email: "suporte@casadogamer.com",
        image: "https://cdn.fut7pro.com/avatar.png",
      },
    },
    status: "authenticated",
  }),
  signOut: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({
    me: {
      user: { avatarUrl: null },
      athlete: { id: "ath-1", slug: "ath-1", firstName: "suporte", avatarUrl: null },
      tenant: { tenantSlug: "chelsea" },
    },
  }),
}));

jest.mock("@/hooks/useBranding", () => ({
  useBranding: () => ({ nome: "Chelsea" }),
}));

jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({
    data: [
      { tenantId: "t-1", tenantSlug: "chelsea", tenantName: "Chelsea", role: "PRESIDENTE" },
      { tenantId: "t-2", tenantSlug: "sertao", tenantName: "Sertão", role: "PRESIDENTE" },
    ],
  }),
}));

jest.mock("@/utils/active-tenant", () => ({
  setStoredTenantSlug: jest.fn(),
}));

jest.mock("@/components/ui/AvatarFut7Pro", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} data-testid="admin-avatar" />,
}));

describe("Admin Header", () => {
  it("mantém atalhos em rotas /admin e usa nome global no topo", () => {
    render(<Header />);

    expect(screen.getByText("Felipe")).toBeInTheDocument();

    expect(screen.getByTestId("admin-header-link-admin-comunicacao-notificacoes")).toHaveAttribute(
      "href",
      "/admin/comunicacao/notificacoes"
    );
    expect(screen.getByTestId("admin-header-link-admin-comunicacao-mensagens")).toHaveAttribute(
      "href",
      "/admin/comunicacao/mensagens"
    );
    expect(
      screen.getByTestId("admin-header-link-admin-jogadores-listar-cadastrar-solicitacoes")
    ).toHaveAttribute("href", "/admin/jogadores/listar-cadastrar#solicitacoes");
  });

  it("envia Trocar de grupo para /admin/selecionar-racha", () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" }));

    expect(screen.getByRole("link", { name: /Trocar de grupo/i })).toHaveAttribute(
      "href",
      "/admin/selecionar-racha"
    );
  });

  it("agrupa conta, assinatura e ajuda no perfil desktop e envia o avatar compacto para Mais", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Abrir Mais" })).toHaveAttribute("href", "/admin/mais");
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" }));
    expect(screen.getByText("suporte@casadogamer.com")).toBeInTheDocument();
    for (const category of ["Minha conta", "Assinatura Fut7Pro", "Ajuda e orientação"]) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Plano e cobrança" })).toHaveAttribute(
      "href",
      "/admin/financeiro/planos-limites"
    );
    expect(screen.getByRole("link", { name: "Central de Ajuda" })).toHaveAttribute(
      "href",
      "/admin/comunicacao/ajuda"
    );
  });

  it.each([1024, 1280])(
    "abre pelo botão e devolve o foco com Escape na largura expandida %i",
    (width) => {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
      render(<Header />);
      const trigger = screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" });

      trigger.focus();
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute("aria-haspopup", "true");
      expect(trigger).toHaveAttribute("aria-controls", "admin-profile-menu");
      expect(screen.getByRole("navigation", { name: "Menu do perfil" })).toHaveAttribute(
        "id",
        "admin-profile-menu"
      );
      const firstLink = screen.getByRole("link", { name: "Perfil Global Fut7Pro" });
      expect(firstLink).toHaveFocus();

      fireEvent.keyDown(firstLink, { key: "Escape" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveFocus();
      expect(screen.queryByRole("navigation", { name: "Menu do perfil" })).not.toBeInTheDocument();

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("navigation", { name: "Menu do perfil" })).toBeInTheDocument();
    }
  );

  it("fecha ao sair do menu com Tab sem prender o foco", () => {
    render(<Header />);
    const trigger = screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" });
    fireEvent.click(trigger);
    const firstLink = screen.getByRole("link", { name: "Perfil Global Fut7Pro" });
    const outsideLink = screen.getByRole("link", { name: /Notificações/i });

    fireEvent.blur(firstLink, { relatedTarget: outsideLink });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("fecha ao clicar fora ou selecionar um item", () => {
    render(<Header />);
    const trigger = screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" });
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("navigation", { name: "Menu do perfil" })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("link", { name: "Plano e cobrança" }));
    expect(screen.queryByRole("navigation", { name: "Menu do perfil" })).not.toBeInTheDocument();
  });

  it("preserva o logout e os destinos externos do perfil", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu do perfil de Felipe" }));
    expect(screen.getByRole("link", { name: "Ver perfil público" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/admin/login" });
  });
});
