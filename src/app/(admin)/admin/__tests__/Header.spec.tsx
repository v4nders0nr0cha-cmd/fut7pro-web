import { fireEvent, render, screen } from "@testing-library/react";
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

  it("envia Trocar de racha para /admin/selecionar-racha", () => {
    render(<Header />);

    fireEvent.click(screen.getByText("Felipe"));

    expect(screen.getByRole("link", { name: /Trocar de racha/i })).toHaveAttribute(
      "href",
      "/admin/selecionar-racha"
    );
  });
});
