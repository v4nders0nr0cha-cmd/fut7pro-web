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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
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

  it("mostra explicacao antes de continuar para login", async () => {
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

    expect(await screen.findByText(/Encontramos sua Conta Fut7Pro/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/login?callbackUrl=%2Fcasa-do-gamer%2F"
      );
    });

    expect(sessionStorage.getItem("fut7pro_auth_email")).toBe("atleta@teste.com");
    expect(sessionStorage.getItem("fut7pro_auth_slug")).toBe("casa-do-gamer");
  });

  it("mostra explicacao antes de continuar para cadastro quando lookup sinaliza REGISTER", async () => {
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

    expect(await screen.findByText(/Você ainda não possui uma Conta Fut7Pro/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Criar cadastro" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/register?callbackUrl=%2Fcasa-do-gamer%2F"
      );
    });
  });

  it("mostra explicacao antes de continuar para login com intent request-join", async () => {
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

    expect(await screen.findByText(/Encontramos sua Conta Fut7Pro/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Entrar e solicitar entrada" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/casa-do-gamer/login?callbackUrl=%2Fcasa-do-gamer%2F&intent=request-join"
      );
    });
  });

  it("mostra solicitacao pendente antes de seguir para aguardando aprovacao", async () => {
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

    expect(await screen.findByText(/já foi enviada/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));

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
