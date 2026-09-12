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
  default: ({ onTokenChange }: { onTokenChange: (token: string | null) => void }) => (
    <button type="button" onClick={() => onTokenChange("turnstile-token")}>
      Resolver verificação
    </button>
  ),
  AUTH_APP_TURNSTILE_ENABLED: true,
  AUTH_APP_TURNSTILE_SITE_KEY: "site-key",
  TURNSTILE_REQUIRED_MESSAGE: "Confirme a verificação de segurança para continuar.",
  TURNSTILE_UNAVAILABLE_MESSAGE: "A verificação de segurança está indisponível.",
  isTurnstileErrorCode: (code: unknown) => String(code || "").startsWith("TURNSTILE_"),
  resolveTurnstileErrorMessage: () => "Não foi possível validar a segurança.",
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

describe("EntrarClient unified athlete auth", () => {
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
    mockedUseMe.mockReturnValue({ me: null, isLoading: false, isError: false });
    mockedUseGlobalProfile.mockReturnValue({
      profile: {
        user: {
          name: "Atleta",
          position: "atacante",
          birthDay: 1,
          birthMonth: 1,
        },
      },
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

  it("entra direto quando ja existe sessao global com membership aprovada", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { role: "ATLETA", accessToken: "access-token" } },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: {
        membership: { status: "APROVADO" },
        athlete: { birthDay: 1, birthMonth: 1, position: "atacante" },
      },
      isLoading: false,
      isError: false,
    });

    render(<EntrarClient />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/");
    });
    expect(screen.queryByPlaceholderText("email@exemplo.com")).not.toBeInTheDocument();
  });

  it("envia sessao pendente para aguardando aprovacao sem pedir login novamente", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { role: "ATLETA", accessToken: "access-token" } },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: { membership: { status: "PENDENTE" } },
      isLoading: false,
      isError: false,
    });

    render(<EntrarClient />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/aguardando-aprovacao");
    });
  });

  it("oferece solicitar entrada quando a sessao global nao tem membership no slug", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { role: "ATLETA", accessToken: "access-token" } },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({ me: null, isLoading: false, isError: true });
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockJsonResponse({ status: "PENDENTE", membershipStatus: "PENDING" })
    );

    render(<EntrarClient />);

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

  it("retorno do Google sem membership nao finaliza acesso ao grupo", async () => {
    searchParamsMock = new URLSearchParams("oauth=google");
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          role: "ATLETA",
          authProvider: "google",
          accessToken: "global-access-token",
        },
      },
      status: "authenticated",
      update: updateSessionMock,
    });
    mockedUseMe.mockReturnValue({
      me: {
        athlete: { birthDay: 1, birthMonth: 1, position: "atacante" },
      },
      isLoading: false,
      isError: false,
    });

    render(<EntrarClient />);

    expect(await screen.findByText("Solicitar entrada")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalledWith("/casa-do-gamer/");
  });

  it("envia codigo e verifica na mesma rota sem redirecionar para login", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({
          ok: true,
          message: "Se estiver tudo certo, enviamos seu código.",
          turnstileProof: "proof",
          resendCooldownSeconds: 60,
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          accessToken: "access-token",
          refreshToken: "refresh-token",
          membershipStatus: "ACTIVE",
        })
      );
    signInMock.mockResolvedValue({ ok: true });

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Resolver verificação" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));

    expect(
      await screen.findByText(/Enviamos um código para at\*\*\*@teste.com/i)
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Acessar perfil" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        redirect: false,
        accessToken: "access-token",
        refreshToken: "refresh-token",
        authProvider: "passwordless",
      });
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/");
    });
    expect(replaceMock).not.toHaveBeenCalledWith(expect.stringContaining("/login"));
  });

  it("bloqueia callback externo e nao coloca email na URL no fluxo passwordless", async () => {
    searchParamsMock = new URLSearchParams("callbackUrl=https%3A%2F%2Fevil.test%2F");
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({ turnstileProof: "proof", resendCooldownSeconds: 60 })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          accessToken: "access-token",
          refreshToken: "refresh-token",
          membershipStatus: "ACTIVE",
        })
      );
    signInMock.mockResolvedValue({ ok: true });

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Resolver verificação" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));
    await screen.findByPlaceholderText("Digite os 6 dígitos");
    fireEvent.change(screen.getByPlaceholderText("Digite os 6 dígitos"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Acessar perfil" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/casa-do-gamer/");
    });
    expect(replaceMock).not.toHaveBeenCalledWith(expect.stringContaining("email="));
  });

  it("conta inexistente direciona para cadastro sem segundo clique de lookup", async () => {
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

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "novo@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Resolver verificação" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar código de acesso" }));

    expect(await screen.findByText(/Crie sua conta para solicitar entrada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar Conta Fut7Pro/i })).toHaveAttribute(
      "href",
      "/casa-do-gamer/register?callbackUrl=%2Fcasa-do-gamer%2F&email=novo%40teste.com"
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
