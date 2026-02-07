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

const pushMock = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
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
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    mockedUseTema.mockReturnValue({ nome: "Casa do Gamer" });
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "casa-do-gamer",
      publicHref: (path: string) => `/casa-do-gamer${path}`,
    });
    pushMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("mostra ação de solicitar entrada quando conta existe sem vínculo no racha", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        exists: true,
        userExists: true,
        providers: ["credentials"],
        hasPassword: true,
        availableAuthMethods: ["password"],
        membershipStatus: "NONE",
        nextAction: "REQUEST_JOIN",
        requiresCaptcha: false,
      }),
    }) as any;

    render(<EntrarClient />);

    fireEvent.change(screen.getByPlaceholderText("ex: seuemail@dominio.com"), {
      target: { value: "atleta@teste.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Sua conta já existe. Solicite entrada neste racha para liberar seu perfil e rankings."
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Entrar para solicitar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Criar conta Fut7Pro" })).not.toBeInTheDocument();
  });
});
