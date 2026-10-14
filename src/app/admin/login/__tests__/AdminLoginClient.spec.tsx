import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import AdminLoginClient from "../AdminLoginClient";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/components/security/TurnstileWidget", () => ({
  __esModule: true,
  default: () => null,
  AUTH_APP_TURNSTILE_ENABLED: false,
  AUTH_APP_TURNSTILE_SITE_KEY: "",
  TURNSTILE_REQUIRED_MESSAGE: "Confirme a verificação de segurança para continuar.",
  TURNSTILE_UNAVAILABLE_MESSAGE:
    "A verificação de segurança está indisponível. Tente novamente em instantes.",
  isTurnstileErrorCode: (code: unknown) =>
    code === "TURNSTILE_REQUIRED" ||
    code === "TURNSTILE_INVALID" ||
    code === "TURNSTILE_UNAVAILABLE",
  resolveTurnstileErrorMessage: () => "Não foi possível validar a segurança. Tente novamente.",
}));

const mockedSignIn = signIn as jest.Mock;

function mockFetchResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

async function submitPasswordLogin() {
  render(<AdminLoginClient />);

  fireEvent.change(screen.getByTestId("admin-login-email"), {
    target: { value: "admin@fut7pro.com.br" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
  fireEvent.change(screen.getByTestId("admin-login-password"), {
    target: { value: "SenhaCorreta123!" },
  });

  const submitButton = screen.getByTestId("admin-login-submit");
  await waitFor(() => expect(submitButton).not.toBeDisabled());
  fireEvent.click(submitButton);
}

describe("AdminLoginClient password login errors", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    mockedSignIn.mockReset();
  });

  it("mostra indisponibilidade quando o backend retorna 503", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(503, {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message:
          "Não foi possível acessar o serviço de autenticação agora. Tente novamente em alguns instantes.",
      })
    );

    await submitPasswordLogin();

    expect(
      await screen.findByText(
        "Não foi possível acessar o serviço de autenticação agora. Tente novamente em alguns instantes."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("E-mail ou senha inválidos.")).not.toBeInTheDocument();
  });

  it("mantem mensagem de credencial invalida somente para 401", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(401, { code: "INVALID_CREDENTIALS" })
    );

    await submitPasswordLogin();

    expect(await screen.findByText("E-mail ou senha inválidos.")).toBeInTheDocument();
  });

  it("nao mostra credencial invalida quando a rede falha", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("timeout"));

    await submitPasswordLogin();

    expect(
      await screen.findByText(
        "Não foi possível acessar o serviço de autenticação agora. Tente novamente em alguns instantes."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("E-mail ou senha inválidos.")).not.toBeInTheDocument();
  });

  it("nao mostra credencial invalida quando o NextAuth falha apos tokens validos", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockFetchResponse(200, {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      })
    );
    mockedSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin" });

    await submitPasswordLogin();

    expect(
      await screen.findByText("Não foi possível concluir o login. Tente novamente.")
    ).toBeInTheDocument();
    expect(screen.queryByText("E-mail ou senha inválidos.")).not.toBeInTheDocument();
  });
});
