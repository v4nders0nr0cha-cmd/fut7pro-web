import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { PerfilProvider, usePerfil } from "../PerfilContext";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { useMe } from "@/hooks/useMe";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(),
}));

function Consumer() {
  const context = usePerfil() as ReturnType<typeof usePerfil> & {
    atualizarPerfil?: unknown;
  };
  const {
    usuario,
    isAuthenticated,
    membershipStatus,
    hasConfirmedNoGroupMembership,
    isMembershipLookupError,
  } = context;
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="name">{usuario?.nome || ""}</span>
      <span data-testid="membership">{membershipStatus || ""}</span>
      <span data-testid="can-edit">{String(typeof context.atualizarPerfil === "function")}</span>
      <span data-testid="no-group">{String(hasConfirmedNoGroupMembership)}</span>
      <span data-testid="lookup-error">{String(isMembershipLookupError)}</span>
    </div>
  );
}

describe("PerfilProvider", () => {
  const mockedUseSession = useSession as jest.Mock;
  const mockedUsePathname = usePathname as jest.Mock;
  const mockedUseMe = useMe as jest.Mock;
  const mockedUseGlobalProfile = useGlobalProfile as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/seu-racha/perfil");
    mockedUseGlobalProfile.mockReturnValue({
      profile: { memberships: [] },
      isLoading: false,
    });
  });

  it("usa sessao Fut7Pro utilizavel para carregar o perfil do grupo sem exigir realm athlete", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
          authRealm: "admin",
          role: "ADMIN",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: {
        user: { id: "user-1", email: "ney@example.com" },
        tenant: { tenantId: "tenant-1", tenantSlug: "seu-racha" },
        membership: { role: "ATLETA", status: "APROVADO" },
        athlete: { id: "athlete-1", slug: "neymar", firstName: "Neymar" },
      },
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(mockedUseMe).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        tenantSlug: "seu-racha",
        context: "athlete",
      })
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("name")).toHaveTextContent("Neymar");
    expect(screen.getByTestId("membership")).toHaveTextContent("APROVADO");
  });

  it("nao expoe mutator de edicao de dados pessoais tenant-specific", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: {
        user: { id: "user-1", email: "ney@example.com" },
        tenant: { tenantId: "tenant-1", tenantSlug: "seu-racha" },
        membership: { role: "ATLETA", status: "APROVADO" },
        athlete: { id: "athlete-1", slug: "neymar", firstName: "Neymar" },
      },
      isLoading: false,
      isError: false,
      errorStatus: null,
      error: null,
      mutate: jest.fn(),
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("can-edit")).toHaveTextContent("false");
  });

  it("confirma SEM_VINCULO somente quando /me retorna 403 e Perfil Global carrega sem Membership", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: null,
      isLoading: false,
      isError: true,
      errorStatus: 403,
      error: "Forbidden",
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        memberships: [{ tenantSlug: "outro-grupo", status: "APROVADO" }],
      },
      isLoading: false,
      isError: false,
      mutate: jest.fn(),
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("no-group")).toHaveTextContent("true");
    expect(screen.getByTestId("lookup-error")).toHaveTextContent("false");
  });

  it("nao confirma SEM_VINCULO quando /me retorna 403 e Perfil Global falha", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: null,
      isLoading: false,
      isError: true,
      errorStatus: 403,
      error: "Forbidden",
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: null,
      isLoading: false,
      isError: true,
      errorStatus: 500,
      error: "Falha ao carregar Perfil Global",
      mutate: jest.fn(),
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("no-group")).toHaveTextContent("false");
    expect(screen.getByTestId("lookup-error")).toHaveTextContent("true");
  });

  it("usa Perfil Global como fallback para status rejeitado quando /me nao retorna atleta", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: null,
      isLoading: false,
      isError: true,
      error: "Forbidden",
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        memberships: [{ tenantSlug: "seu-racha", status: "REJEITADO" }],
      },
      isLoading: false,
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("membership")).toHaveTextContent("REJEITADO");
  });

  it("usa Perfil Global quando /me tem dado stale pendente junto de erro", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: {
        user: { id: "user-1", email: "ney@example.com" },
        tenant: { tenantId: "tenant-1", tenantSlug: "seu-racha" },
        membership: { role: "ATLETA", status: "PENDENTE" },
        athlete: null,
      },
      isLoading: false,
      isError: true,
      error: "Forbidden",
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        memberships: [{ tenantSlug: "seu-racha", status: "REJEITADO" }],
      },
      isLoading: false,
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("membership")).toHaveTextContent("REJEITADO");
  });

  it("prioriza /me saudavel quando Perfil Global esta stale aprovado", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: {
        user: { id: "user-1", email: "ney@example.com" },
        tenant: { tenantId: "tenant-1", tenantSlug: "seu-racha" },
        membership: { role: "ATLETA", status: "SUSPENSO" },
        athlete: { id: "athlete-1", slug: "neymar", firstName: "Neymar" },
      },
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        memberships: [{ tenantSlug: "seu-racha", status: "APROVADO" }],
      },
      isLoading: false,
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("membership")).toHaveTextContent("SUSPENSO");
  });

  it("prioriza /me saudavel quando Perfil Global esta stale pendente", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          email: "ney@example.com",
          accessToken: "token",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: {
        user: { id: "user-1", email: "ney@example.com" },
        tenant: { tenantId: "tenant-1", tenantSlug: "seu-racha" },
        membership: { role: "ATLETA", status: "APROVADO" },
        athlete: { id: "athlete-1", slug: "neymar", firstName: "Neymar" },
      },
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        memberships: [{ tenantSlug: "seu-racha", status: "PENDENTE" }],
      },
      isLoading: false,
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(screen.getByTestId("membership")).toHaveTextContent("APROVADO");
  });

  it("nao consulta /me tenant-specific sem sessao utilizavel", () => {
    mockedUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          id: "user-1",
          name: "Neymar",
          tokenError: "AccessTokenExpired",
        },
      },
    });
    mockedUseMe.mockReturnValue({
      me: null,
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(
      <PerfilProvider>
        <Consumer />
      </PerfilProvider>
    );

    expect(mockedUseMe).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        tenantSlug: "seu-racha",
        context: "athlete",
      })
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });
});
