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

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(),
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
const mockedUseGlobalProfile = require("@/hooks/useGlobalProfile").useGlobalProfile as jest.Mock;

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
    mockedUseGlobalProfile.mockReturnValue({
      profile: null,
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

  it("login por codigo permite solicitar entrada no grupo", async () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));

    expect(
      await screen.findByText(/Enviamos um código para at\*\*\*@teste.com/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Acessar perfil" }));

    expect(await screen.findByText("Solicitar entrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada em Casa do Gamer" }));

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

  it("login por senha permite solicitar entrada no grupo", async () => {
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

    expect(await screen.findByText("Solicitar entrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada em Casa do Gamer" }));

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

  it("sessao global autenticada sem papel ATLETA pode solicitar entrada", async () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "neymar@teste.com",
          name: "Neymar",
          role: "ADMIN",
        },
      },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: { membership: { status: "NONE" } },
      isLoading: false,
      isError: false,
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        user: {
          name: "Neymar",
          position: "atacante",
          birthDay: 5,
          birthMonth: 2,
        },
      },
      isLoading: false,
      isError: false,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        status: "PENDENTE",
        membershipStatus: "PENDING",
      })
    );

    render(<LoginClient />);

    expect(await screen.findByText("Solicitar entrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada em Casa do Gamer" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/public/casa-do-gamer/auth/request-join",
        expect.objectContaining({ method: "POST" })
      );
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });

  it("sessao autenticada com Perfil Global incompleto vai para /perfil", async () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "incompleto@teste.com",
          name: "Neymar",
          role: "ATLETA",
        },
      },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: { membership: { status: "NONE" } },
      isLoading: false,
      isError: false,
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        user: {
          name: "Neymar",
          position: null,
          birthDay: null,
          birthMonth: null,
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<LoginClient />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/perfil?intent=request-join&racha=casa-do-gamer&callbackUrl=%2Fcasa-do-gamer%2F"
      );
    });
  });

  it("mostra cadastro necessario quando OTP recebe USER_NOT_FOUND", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse(
        {
          code: "USER_NOT_FOUND",
          message: "Você ainda não possui Conta Global Fut7Pro. Cadastre-se para continuar.",
        },
        false,
        404
      )
    );

    render(<LoginClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "novo@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));

    expect(
      await screen.findByText(/Não encontramos uma Conta Fut7Pro com este e-mail/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar Conta Fut7Pro/i })).toHaveAttribute(
      "href",
      "/casa-do-gamer/register?callbackUrl=%2Fcasa-do-gamer%2F&email=novo%40teste.com"
    );
    expect(signInMock).not.toHaveBeenCalled();
  });
});
