import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EntrarClient from "../EntrarClient";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

jest.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const updateSessionMock = jest.fn();
let mockedSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => mockedSearchParams,
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock("@/components/security/TurnstileWidget", () => ({
  __esModule: true,
  default: ({ resetSignal }: { resetSignal?: number }) => (
    <div data-testid="turnstile-widget" data-reset-signal={String(resetSignal ?? 0)} />
  ),
  AUTH_APP_TURNSTILE_ENABLED: false,
  AUTH_APP_TURNSTILE_SITE_KEY: "site-key",
  TURNSTILE_REQUIRED_MESSAGE: "Confirme a verificação de segurança para continuar.",
  TURNSTILE_UNAVAILABLE_MESSAGE: "A verificação de segurança está indisponível.",
  isTurnstileErrorCode: () => false,
  resolveTurnstileErrorMessage: () => "Não foi possível validar a segurança.",
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

const mockedUseTema = require("@/hooks/useTema").useTema as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseSession = require("next-auth/react").useSession as jest.Mock;

describe("EntrarClient", () => {
  beforeEach(() => {
    mockedSearchParams = new URLSearchParams();
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
    if (!global.fetch) {
      (global as any).fetch = jest.fn();
    }
    (global.fetch as jest.Mock).mockReset();
    replaceMock.mockReset();
    refreshMock.mockReset();
    updateSessionMock.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redireciona para login com resposta uniforme do lookup", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Se estiver tudo certo, enviamos seu código.",
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/login?callbackUrl=%2Fcasa-do-gamer%2F"
      );
    });

    expect(sessionStorage.getItem("fut7pro_auth_email")).toBe("atleta@teste.com");
    expect(sessionStorage.getItem("fut7pro_auth_slug")).toBe("casa-do-gamer");
  });

  it("não executa request-join automático quando a sessão autenticada não é de atleta", async () => {
    mockedSearchParams = new URLSearchParams("google=1");
    mockedUseSession.mockReturnValue({
      data: { user: { email: "admin@teste.com", role: "ADMIN" } },
      status: "authenticated",
      update: updateSessionMock,
    });

    render(<EntrarClient />);

    await waitFor(() => {
      expect(screen.getByText(/A conta autenticada atual nao e de atleta/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("não dispara nova verificação de segurança só porque o usuário digitou", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        code: "CAPTCHA_REQUIRED",
        message: "Captcha obrigatório",
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "primeiro@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    const firstWidget = await screen.findByTestId("turnstile-widget");
    const resetBefore = firstWidget.getAttribute("data-reset-signal");

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "segundo@teste.com" },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();
    expect(firstWidget.getAttribute("data-reset-signal")).toBe(resetBefore);
  });

  it("redireciona para cadastro quando lookup sinaliza REGISTER", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Se estiver tudo certo, enviamos seu código.",
        nextAction: "REGISTER",
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "novo@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/register?callbackUrl=%2Fcasa-do-gamer%2F"
      );
    });
  });

  it("redireciona para login com intent request-join quando lookup sinaliza REQUEST_JOIN", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Se estiver tudo certo, enviamos seu código.",
        nextAction: "REQUEST_JOIN",
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/login?callbackUrl=%2Fcasa-do-gamer%2F&intent=request-join"
      );
    });
  });

  it("redireciona para aguardando aprovacao quando lookup sinaliza WAIT_APPROVAL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: "Se estiver tudo certo, enviamos seu código.",
        nextAction: "WAIT_APPROVAL",
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "pendente@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });

  it("no vitrine mostra fluxo educativo sem abrir login/cadastro", () => {
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "vitrine",
      publicHref: (path: string) => `/vitrine${path}`,
    });

    render(<EntrarClient />);

    expect(screen.getByRole("heading", { name: /Entrar no Racha Vitrine/i })).toBeInTheDocument();
    expect(screen.getByText(/No site do seu racha, o botão/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Voltar e continuar explorando o Racha Vitrine/i })
    ).toHaveAttribute("href", "/vitrine/");
    expect(
      screen.getByRole("link", { name: /Criar o site do meu racha no Fut7Pro/i })
    ).toHaveAttribute("href", "/cadastrar-racha");
    expect(screen.queryByPlaceholderText("ex: seuemail@dominio.com")).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
