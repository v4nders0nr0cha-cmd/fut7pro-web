import { act, fireEvent, render, screen } from "@testing-library/react";
import PublicAuthSuccessDialog from "@/components/layout/PublicAuthSuccessDialog";
import { queuePublicAuthSuccessFeedback } from "@/utils/public-auth-feedback";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ status: "authenticated" })),
}));

describe("PublicAuthSuccessDialog", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("consome o feedback pendente e exibe o dialogo centralizado", () => {
    queuePublicAuthSuccessFeedback("Seu perfil foi sincronizado.");

    render(<PublicAuthSuccessDialog />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Login realizado com sucesso")).toBeInTheDocument();
    expect(screen.getByText("Seu perfil foi sincronizado.")).toBeInTheDocument();
  });

  it("fecha ao confirmar ou apos o timeout automatico", () => {
    queuePublicAuthSuccessFeedback("Tudo pronto.");

    const { unmount } = render(<PublicAuthSuccessDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    unmount();
    queuePublicAuthSuccessFeedback("Tudo pronto.");
    render(<PublicAuthSuccessDialog />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2600);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
