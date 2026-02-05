import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterClient from "../RegisterClient";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
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

jest.mock("@/components/ImageCropperModal", () => ({
  __esModule: true,
  default: () => null,
}));

const mockedUseSession = require("next-auth/react").useSession as jest.Mock;
const mockedUseTema = require("@/hooks/useTema").useTema as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseMe = require("@/hooks/useMe").useMe as jest.Mock;

describe("RegisterClient", () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    mockedUseTema.mockReturnValue({ nome: "Racha Teste" });
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "ruimdebola",
      publicHref: (path: string) => `/ruimdebola${path}`,
    });
    mockedUseMe.mockReturnValue({ me: null, isLoading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("mostra CTA para login quando a conta ja existe", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        code: "ACCOUNT_EXISTS",
        message:
          "Esse e-mail ja tem conta Fut7Pro. Entre para confirmar que e voce e solicitar entrada neste racha.",
      }),
    });
    global.fetch = fetchMock as any;

    render(<RegisterClient />);

    fireEvent.change(screen.getByPlaceholderText("Seu primeiro nome"), {
      target: { value: "Joao" },
    });
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "super@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Crie uma senha"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Posicao principal"), {
      target: { value: "Atacante" },
    });
    fireEvent.change(screen.getByLabelText("Dia"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar atleta/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Esse e-mail ja tem conta Fut7Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Seus dados ficam separados por racha/i)).toBeInTheDocument();

    const loginCta = screen.getByRole("link", { name: /Entrar e solicitar/i });
    expect(loginCta.getAttribute("href")).toBe(
      "/ruimdebola/entrar?callbackUrl=%2Fruimdebola%2Fregister"
    );
  });
});
