import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminLoginClient from "../AdminLoginClient";

const replace = jest.fn();
const signIn = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("next-auth/react", () => ({ signIn: (...args: unknown[]) => signIn(...args) }));
jest.mock(
  "next/image",
  () =>
    function MockImage(props: { alt: string }) {
      return <span aria-label={props.alt} />;
    }
);
jest.mock("@/components/security/TurnstileWidget", () => ({
  __esModule: true,
  default: () => null,
  AUTH_APP_TURNSTILE_ENABLED: false,
  AUTH_APP_TURNSTILE_SITE_KEY: "",
  TURNSTILE_REQUIRED_MESSAGE: "",
  TURNSTILE_UNAVAILABLE_MESSAGE: "",
  isTurnstileErrorCode: () => false,
  resolveTurnstileErrorMessage: () => "",
}));

beforeEach(() => {
  replace.mockReset();
  signIn.mockReset();
  global.fetch = jest.fn();
});

it("mantém os campos legíveis e não abre o teclado automaticamente", () => {
  render(<AdminLoginClient />);
  const email = screen.getByTestId("admin-login-email");
  expect(email).toHaveClass("text-base");
  expect(email).not.toHaveAttribute("autofocus");
  fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
  expect(screen.getByTestId("admin-login-password")).toHaveClass("text-base");
});

it("fecha o teclado e segue para Meus Grupos depois do login por senha", async () => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ accessToken: "a", refreshToken: "r" }),
  });
  signIn.mockResolvedValue({ ok: true });
  render(<AdminLoginClient />);
  fireEvent.change(screen.getByTestId("admin-login-email"), {
    target: { value: "admin@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
  const password = screen.getByTestId("admin-login-password");
  fireEvent.change(password, { target: { value: "secret" } });
  password.focus();
  fireEvent.click(screen.getByTestId("admin-login-submit"));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/selecionar-racha"));
  expect(document.activeElement).not.toBe(password);
});

it("mostra erro de autenticação sem redirecionar", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) });
  render(<AdminLoginClient />);
  fireEvent.change(screen.getByTestId("admin-login-email"), {
    target: { value: "admin@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
  fireEvent.change(screen.getByTestId("admin-login-password"), { target: { value: "wrong" } });
  fireEvent.click(screen.getByTestId("admin-login-submit"));
  expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos");
  expect(replace).not.toHaveBeenCalled();
});

it("envia e confirma o código antes de abrir Meus Grupos", async () => {
  (fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ message: "Código enviado" }) })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: "a", refreshToken: "r" }),
    });
  signIn.mockResolvedValue({ ok: true });
  render(<AdminLoginClient />);
  fireEvent.change(screen.getByTestId("admin-login-email"), {
    target: { value: "admin@example.com" },
  });
  fireEvent.click(screen.getByTestId("admin-login-submit"));
  const code = await screen.findByPlaceholderText("Digite os 6 dígitos");
  expect(code).toHaveClass("text-base");
  fireEvent.change(code, { target: { value: "123456" } });
  fireEvent.click(screen.getByTestId("admin-login-submit"));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/selecionar-racha"));
  expect((fetch as jest.Mock).mock.calls[1][0]).toBe("/api/auth/passwordless/verify");
});
