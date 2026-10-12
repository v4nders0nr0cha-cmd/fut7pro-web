import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginClient from "../LoginClient";
import { consumePublicAuthSuccessFeedback } from "@/utils/public-auth-feedback";

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
let searchParamsMock = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => searchParamsMock,
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
    searchParamsMock = new URLSearchParams();
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
      await screen.findByText(/Se houver uma Conta Fut7Pro com at\*\*\*@teste.com/i)
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
    expect(consumePublicAuthSuccessFeedback()).toBeNull();
  });

  it("enfileira o dialogo, revalida o layout e navega sem reload apos login aprovado", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        membershipStatus: "APROVADO",
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

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/");
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(consumePublicAuthSuccessFeedback()).toEqual(
      expect.objectContaining({
        title: "Login realizado com sucesso",
        message: "Login realizado com sucesso. Seu perfil já está disponível.",
      })
    );
  });

  it("navega normalmente quando o navegador bloqueia o sessionStorage", async () => {
    const storageSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        membershipStatus: "APROVADO",
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

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/"));
    expect(screen.queryByText(/Verificando seu acesso/i)).not.toBeInTheDocument();
    storageSpy.mockRestore();
  });

  it("navega normalmente quando a limpeza do contexto local falha", async () => {
    const storageSpy = jest.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        membershipStatus: "APROVADO",
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

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/"));
    expect(screen.queryByText(/Verificando seu acesso/i)).not.toBeInTheDocument();
    storageSpy.mockRestore();
  });

  it("restaura o dialogo central apos login aprovado por codigo", async () => {
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
          membershipStatus: "APROVADO",
        })
      );

    render(<LoginClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));
    await screen.findByPlaceholderText("Digite os 6 dígitos");

    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Acessar perfil" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/");
    });
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      redirect: false,
      accessToken: "access-token",
      refreshToken: "refresh-token",
      authProvider: "passwordless",
    });
    expect(consumePublicAuthSuccessFeedback()).toEqual(
      expect.objectContaining({ title: "Login realizado com sucesso" })
    );
  });

  it("sincroniza o retorno do Google antes de navegar e mostrar o sucesso", async () => {
    const authenticatedSession = {
      user: {
        id: "user-1",
        email: "atleta@teste.com",
        name: "Atleta",
        accessToken: "access-token",
      },
    };
    searchParamsMock = new URLSearchParams("oauth=google&callbackUrl=%2Fcasa-do-gamer%2Fperfil");
    mockedUseSession.mockReturnValue({
      data: authenticatedSession,
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: {
        athlete: {
          firstName: "Atleta",
          position: "atacante",
          positionSecondary: "meia",
          birthDay: 1,
          birthMonth: 1,
        },
        membership: { status: "APROVADO" },
      },
      isLoading: false,
      isError: false,
    });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        user: {
          name: "Atleta",
          position: "atacante",
          positionSecondary: "meia",
          birthDay: 1,
          birthMonth: 1,
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<LoginClient />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/perfil");
    });
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(consumePublicAuthSuccessFeedback()).toEqual(
      expect.objectContaining({ title: "Login realizado com sucesso" })
    );
  });

  it("nao enfileira sucesso quando o login falha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse(
        { code: "INVALID_CREDENTIALS", message: "Credenciais inválidas." },
        false,
        401
      )
    );

    render(<LoginClient />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite sua senha"), {
      target: { value: "incorreta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));

    expect(
      await screen.findByText("E-mail ou senha inválidos. Confira os dados e tente novamente.")
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(consumePublicAuthSuccessFeedback()).toBeNull();
  });

  it("nao enfileira sucesso quando a solicitacao ainda esta pendente", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse(
        { code: "REQUEST_PENDING", message: "Sua solicitação ainda está pendente." },
        false,
        403
      )
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

    expect(await screen.findByText("Solicitação pendente")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(consumePublicAuthSuccessFeedback()).toBeNull();
  });

  it("sessao global autenticada sem papel ATLETA pode solicitar entrada", async () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "neymar@teste.com",
          name: "Neymar",
          role: "ADMIN",
          accessToken: "access-token",
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
          positionSecondary: "meia",
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
          accessToken: "access-token",
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

  it("sessao NextAuth autenticada mas expirada nao executa redirect automatico", async () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "expirada@teste.com",
          name: "Neymar",
          role: "ATLETA",
          accessToken: "expired-token",
          tokenError: "AccessTokenExpired",
        },
      },
      status: "authenticated",
      update: updateSessionMock,
    });

    render(<LoginClient />);

    expect(await screen.findByPlaceholderText("email@exemplo.com")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(mockedUseMe).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(mockedUseGlobalProfile).toHaveBeenCalledWith({ enabled: false });
  });

  it("mantem mensagem neutra quando OTP recebe USER_NOT_FOUND", async () => {
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
      await screen.findByText(/Se houver uma Conta Fut7Pro com este e-mail/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar Conta Fut7Pro/i })).toHaveAttribute(
      "href",
      "/casa-do-gamer/register?callbackUrl=%2Fcasa-do-gamer%2F&email=novo%40teste.com"
    );
    expect(signInMock).not.toHaveBeenCalled();
  });
});
