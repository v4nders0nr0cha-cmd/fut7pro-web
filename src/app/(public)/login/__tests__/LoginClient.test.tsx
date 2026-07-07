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
let searchParamsMock = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => searchParamsMock,
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: (...args: unknown[]) => signInMock(...args),
  signOut: jest.fn(() => Promise.resolve()),
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
    searchParamsMock = new URLSearchParams();
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

  it("login por codigo permite solicitar entrada no grupo sem Turnstile no modal", async () => {
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
      await screen.findByText("Enviamos o código para a Conta Fut7Pro informada.")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Acessar perfil" }));

    expect(await screen.findByRole("heading", { name: "Solicitar entrada" })).toBeInTheDocument();
    expect(screen.queryByText(/verificação de segurança/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });

  it("mostra cadastro necessario quando OTP recebe USER_NOT_FOUND", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse(
        {
          code: "USER_NOT_FOUND",
          message: "Você ainda não possui Conta Fut7Pro. Cadastre-se para continuar.",
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
      "/casa-do-gamer/register?email=novo%40teste.com"
    );
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("permite solicitar entrada depois de login com senha retornar identidade global sem Membership", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({
          accessToken: "global-access-token",
          refreshToken: "global-refresh-token",
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
    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
    fireEvent.change(screen.getByPlaceholderText("Digite sua senha"), {
      target: { value: "Senha123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));

    expect(await screen.findByRole("heading", { name: "Solicitar entrada" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          redirect: false,
          accessToken: "global-access-token",
          refreshToken: "global-refresh-token",
          tenantSlug: undefined,
        })
      );
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });

  it.each(["Seu Racha", "Chelsea"])(
    "usa nome publico sem slug cru no login do atleta: %s",
    (tenantName) => {
      mockedUseTema.mockReturnValue({ nome: tenantName });

      render(<LoginClient entryPath="/entrar" variant="entry" />);

      expect(screen.getByText(tenantName)).toBeInTheDocument();
      expect(screen.getByText(/Login do Atleta -/i)).toBeInTheDocument();
      expect(
        screen.getByText("Use seu e-mail cadastrado ou entre com o Google para acessar seu perfil.")
      ).toBeInTheDocument();
      expect(screen.queryByText(/casa-do-gamer/i)).not.toBeInTheDocument();
    }
  );

  it("usa fallback seu grupo quando nome publico nao existe", () => {
    mockedUseTema.mockReturnValue({ nome: "" });

    render(<LoginClient entryPath="/entrar" variant="entry" />);

    expect(screen.getByText("seu grupo")).toBeInTheDocument();
    expect(screen.getByText(/Login do Atleta -/i)).toBeInTheDocument();
  });
});
