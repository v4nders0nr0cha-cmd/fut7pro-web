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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
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
    replaceMock.mockReset();
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
        message: "Se estiver tudo certo, enviamos seu codigo.",
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
});
