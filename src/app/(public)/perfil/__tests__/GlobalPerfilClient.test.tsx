import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import GlobalPerfilClient from "../GlobalPerfilClient";

const replaceMock = jest.fn();
const pushMock = jest.fn();
const signOutMock = jest.fn();
let searchParamsMock = new URLSearchParams();

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
  useSearchParams: () => searchParamsMock,
}));

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({ me: null })),
}));

jest.mock("@/components/ImageCropperModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/profile/SecurityRecoveryPanel", () => ({
  __esModule: true,
  default: () => null,
}));

const mockedUseGlobalProfile = require("@/hooks/useGlobalProfile").useGlobalProfile as jest.Mock;
const mockedUseMe = require("@/hooks/useMe").useMe as jest.Mock;

const baseProfile = {
  user: {
    id: "user-1",
    email: "neymar@example.com",
    name: "Neymar",
    nickname: "Ney",
    avatarUrl: null,
    position: "Atacante",
    positionSecondary: "Meia",
    birthDay: 5,
    birthMonth: 2,
    birthYear: 1992,
    birthPublic: true,
    hasPassword: false,
    emailVerified: true,
    authProvider: "google",
  },
  stats: {
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    pontos: 0,
    gols: 0,
    assistencias: 0,
  },
  totalTitulos: 0,
  accountNotifications: [],
  securityRecovery: undefined,
  conquistas: {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  },
  memberships: [],
};

describe("GlobalPerfilClient reauthentication", () => {
  beforeEach(() => {
    searchParamsMock = new URLSearchParams(
      "intent=request-join&racha=seu-racha&callbackUrl=%2Fseu-racha"
    );
    mockedUseGlobalProfile.mockReturnValue({
      profile: null,
      isLoading: false,
      isError: true,
      error: "Unauthorized",
      errorStatus: 401,
      updateProfile: jest.fn(),
      mutate: jest.fn(),
    });
    signOutMock.mockResolvedValue(undefined);
    replaceMock.mockReset();
    pushMock.mockReset();
    signOutMock.mockClear();
    window.localStorage.clear();
    window.localStorage.setItem("fut7pro_last_tenant_slug", "vitrine");
    document.cookie = "f7_active_slug=vitrine; path=/";
    mockedUseMe.mockReturnValue({ me: null });
  });

  it("limpa sessao invalida e navega para login tenant-scoped do racha explicito", async () => {
    render(<GlobalPerfilClient />);

    const button = await screen.findByRole("button", { name: "Entrar novamente" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
      expect(replaceMock).toHaveBeenCalledWith(
        "/seu-racha/entrar?intent=request-join&callbackUrl=%2Fseu-racha"
      );
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/entrar");
    expect(replaceMock).not.toHaveBeenCalledWith(
      "/vitrine/entrar?intent=request-join&callbackUrl=%2Fseu-racha"
    );
  });

  it("nao usa vitrine como fallback quando nao ha racha explicito nem tenant real", async () => {
    searchParamsMock = new URLSearchParams();

    render(<GlobalPerfilClient />);

    const button = await screen.findByRole("button", { name: "Entrar novamente" });

    expect(button).toBeDisabled();
    expect(screen.getByText(/Não foi possível identificar o grupo/i)).toBeInTheDocument();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalledWith("/vitrine/entrar?callbackUrl=%2F");
    expect(replaceMock).not.toHaveBeenCalledWith(expect.stringContaining("/vitrine/entrar"));
  });

  it("usa tenant armazenado real como callback quando nao ha racha explicito", async () => {
    searchParamsMock = new URLSearchParams();
    window.localStorage.setItem("fut7pro_last_tenant_slug", "seu-racha");
    document.cookie = "f7_active_slug=seu-racha; path=/";

    render(<GlobalPerfilClient />);

    fireEvent.click(await screen.findByRole("button", { name: "Entrar novamente" }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
      expect(replaceMock).toHaveBeenCalledWith("/seu-racha/entrar?callbackUrl=%2Fseu-racha");
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/seu-racha/entrar?callbackUrl=%2F");
  });
});

describe("GlobalPerfilClient request-join status", () => {
  const updateProfileMock = jest.fn();

  beforeEach(() => {
    searchParamsMock = new URLSearchParams(
      "intent=request-join&racha=seu-racha&callbackUrl=%2Fseu-racha"
    );
    updateProfileMock.mockResolvedValue(baseProfile);
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [
          {
            tenantId: "tenant-1",
            tenantSlug: "seu-racha",
            tenantName: "Seu Racha",
            role: "ATLETA",
            status: "PENDENTE",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: jest.fn(),
    });
    mockedUseMe.mockReturnValue({ me: null });
    replaceMock.mockReset();
    pushMock.mockReset();
    signOutMock.mockClear();
    window.localStorage.clear();
    global.fetch = jest.fn();
  });

  it("salva apenas o perfil quando a solicitacao ja esta pendente", async () => {
    render(<GlobalPerfilClient />);

    expect(screen.getByText("Sua solicitação já está em análise")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Salvar Perfil Fut7Pro" });
    fireEvent.click(button);

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalled());
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/auth/request-join"),
      expect.anything()
    );
    expect(replaceMock).not.toHaveBeenCalledWith("/seu-racha/aguardando-aprovacao");
  });

  it("nao mostra salvar e solicitar entrada quando o membership ja esta aprovado", () => {
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [
          {
            tenantId: "tenant-1",
            tenantSlug: "seu-racha",
            tenantName: "Seu Racha",
            role: "ATLETA",
            status: "APROVADO",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: jest.fn(),
    });

    render(<GlobalPerfilClient />);

    expect(screen.getByText("Você já faz parte deste grupo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar e solicitar entrada" })).toBeNull();
    expect(screen.getByRole("button", { name: "Salvar Perfil Fut7Pro" })).toBeInTheDocument();
  });
});

describe("GlobalPerfilClient account notifications", () => {
  const updateProfileMock = jest.fn();
  const mutateMock = jest.fn();

  beforeEach(() => {
    searchParamsMock = new URLSearchParams();
    updateProfileMock.mockResolvedValue(baseProfile);
    updateProfileMock.mockClear();
    mutateMock.mockResolvedValue(undefined);
    mutateMock.mockClear();
    mockedUseMe.mockReturnValue({ me: null });
    replaceMock.mockReset();
    pushMock.mockReset();
    signOutMock.mockClear();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  it("marca decisao aprovada como lida antes de navegar para o desempenho", async () => {
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [
          {
            tenantId: "tenant-1",
            tenantSlug: "seu-racha",
            tenantName: "Seu Racha",
            role: "ATLETA",
            status: "APROVADO",
          },
        ],
        accountNotifications: [
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: mutateMock,
    });

    render(<GlobalPerfilClient />);

    fireEvent.click(screen.getByRole("button", { name: "Acompanhar meu desempenho" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/perfil/account-notifications/notification-1/read",
        expect.objectContaining({ method: "PATCH" })
      );
      expect(mutateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/seu-racha/perfil");
    });
  });

  it("navega pelo CTA mesmo quando a marcacao de leitura falha", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [
          {
            tenantId: "tenant-1",
            tenantSlug: "seu-racha",
            tenantName: "Seu Racha",
            role: "ATLETA",
            status: "APROVADO",
          },
        ],
        accountNotifications: [
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: mutateMock,
    });

    render(<GlobalPerfilClient />);

    fireEvent.click(screen.getByRole("button", { name: "Acompanhar meu desempenho" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/perfil/account-notifications/notification-1/read",
        expect.objectContaining({ method: "PATCH" })
      );
      expect(pushMock).toHaveBeenCalledWith("/seu-racha/perfil");
    });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("usa tenantName do metadata para rejeicao sem Membership", () => {
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [],
        accountNotifications: [
          {
            id: "notification-1",
            title: "Solicitação não aprovada",
            body: "Rejeitada",
            href: "/seu-racha",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "REJEITADA",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: mutateMock,
    });

    render(<GlobalPerfilClient />);

    expect(
      screen.getByText(
        "Sua solicitação para participar do Seu Racha não foi aprovada. Sua Conta Fut7Pro continua ativa normalmente."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/do este grupo/i)).not.toBeInTheDocument();
  });

  it("some do Perfil Global depois que o backend retorna sem notificacao nao lida", () => {
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      errorStatus: null,
      updateProfile: updateProfileMock,
      mutate: mutateMock,
    });

    render(<GlobalPerfilClient />);

    expect(screen.queryByText("Entrada aprovada!")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Acompanhar meu desempenho" })).toBeNull();
  });
});
