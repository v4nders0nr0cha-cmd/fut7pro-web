import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginClient from "../LoginClient";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const updateSessionMock = jest.fn();
const signInMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: (...args: unknown[]) => signInMock(...args),
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(),
}));

jest.mock("@/components/security/TurnstileWidget", () => ({
  __esModule: true,
  default: () => null,
  AUTH_APP_TURNSTILE_ENABLED: false,
  AUTH_APP_TURNSTILE_SITE_KEY: "",
  TURNSTILE_REQUIRED_MESSAGE: "Confirme que você não é um robô para continuar.",
  TURNSTILE_UNAVAILABLE_MESSAGE: "Não foi possível carregar a verificação de segurança.",
  isTurnstileErrorCode: () => false,
  resolveTurnstileErrorMessage: () => "Não foi possível validar a verificação de segurança.",
}));

jest.mock("@/utils/public-session-sync", () => ({
  syncPublicAuthState: jest.fn().mockResolvedValue(undefined),
}));

const mockedUseTema = require("@/hooks/useTema").useTema as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseSession = require("next-auth/react").useSession as jest.Mock;
const mockedUseMe = require("@/hooks/useMe").useMe as jest.Mock;

function mockJsonResponse(body: unknown, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("LoginClient", () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: updateSessionMock,
    });
    mockedUseTema.mockReturnValue({ nome: "Casa do Gamer" });
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "casa-do-gamer",
      publicHref: (path: string) => `/casa-do-gamer${path}`,
    });
    mockedUseMe.mockReturnValue({
      me: null,
      isLoading: false,
      isError: false,
    });
    signInMock.mockResolvedValue({});
    global.fetch = jest.fn() as any;
    replaceMock.mockReset();
    refreshMock.mockReset();
    updateSessionMock.mockReset();
    signInMock.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("login por codigo permite solicitar entrada no racha", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({
          ok: true,
          message: "Se estiver tudo certo, enviamos seu código.",
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          accessToken: "access-token",
          refreshToken: "refresh-token",
          nextAction: "REQUEST_JOIN",
          membershipStatus: "NONE",
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          status: "PENDENTE",
          membershipStatus: "PENDING",
        })
      );

    render(<LoginClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    expect(await screen.findByText(/Enviamos um código para seu e-mail/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar com código" }));

    expect(await screen.findByText("Solicite entrada no racha")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada neste racha" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      redirect: false,
      accessToken: "access-token",
      refreshToken: "refresh-token",
      authProvider: "passwordless",
    });
  });

  it("login por senha permite solicitar entrada no racha", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({
          accessToken: "access-token",
          refreshToken: "refresh-token",
          nextAction: "REQUEST_JOIN",
          membershipStatus: "NONE",
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          status: "PENDENTE",
          membershipStatus: "PENDING",
        })
      );

    render(<LoginClient />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite sua senha"), {
      target: { value: "Senha123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));

    expect(await screen.findByText("Solicite entrada no racha")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada neste racha" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      redirect: false,
      accessToken: "access-token",
      refreshToken: "refresh-token",
      authProvider: "credentials",
    });
  });
});
