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

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const updateSessionMock = jest.fn();
const signInMock = jest.fn();
let mockedSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => mockedSearchParams,
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: (...args: unknown[]) => signInMock(...args),
  signOut: jest.fn(() => Promise.resolve()),
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

jest.mock("@/hooks/useTema", () => ({
  useTema: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(),
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

  it("usa /entrar como fluxo principal e solicita codigo sem lookup nem redirect para /login", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        ok: true,
        message: "Se estiver tudo certo, enviamos seu código.",
      })
    );

    render(<EntrarClient />);

    expect(screen.getByRole("heading", { name: "Entrar no Casa do Gamer" })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/public/casa-do-gamer/auth/passwordless/request",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "atleta@teste.com",
          }),
        })
      );
    });
    expect(global.fetch).not.toHaveBeenCalledWith("/api/auth/lookup-email", expect.anything());
    expect(replaceMock).not.toHaveBeenCalledWith(expect.stringContaining("/login"));
  });

  it("mantem Google retornando para /entrar com callback seguro", async () => {
    render(<EntrarClient />);

    fireEvent.click(screen.getByRole("button", { name: /Continuar com Google/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("google", {
        callbackUrl: "/casa-do-gamer/entrar?callbackUrl=%2Fcasa-do-gamer%2F&oauth=google",
        login_hint: undefined,
      });
    });
  });

  it("sessao global sem Membership abre solicitacao de entrada sem pedir login novamente", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { email: "atleta@teste.com", role: "ATLETA" } },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: { membershipStatus: "NONE", nextAction: "REQUEST_JOIN" },
      isLoading: false,
      isError: false,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({
        status: "PENDENTE",
        membershipStatus: "PENDING",
      })
    );

    render(<EntrarClient />);

    expect(await screen.findByText("Solicitar entrada no racha")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Solicitar entrada neste racha" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/public/casa-do-gamer/auth/request-join", {
        method: "POST",
      });
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });
});
