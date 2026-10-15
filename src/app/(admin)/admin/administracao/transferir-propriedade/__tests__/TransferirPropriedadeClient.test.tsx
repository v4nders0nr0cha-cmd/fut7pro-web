import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TransferirPropriedadeClient from "../TransferirPropriedadeClient";

const requestTransfer = jest.fn();
const cancelTransfer = jest.fn();

jest.mock("@/hooks/useAdminRoles", () => ({
  useAdminRoles: () => ({
    slots: [{ role: "PRESIDENTE", status: "ACTIVE", name: "Felipe" }],
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useOwnershipTransfer", () => ({
  useOwnershipTransferCandidates: () => ({
    candidates: [
      {
        id: "athlete-1",
        name: "Lucas",
        nickname: "Lu",
        email: "lucas@example.com",
        avatarUrl: null,
        position: "MEIA",
        currentRole: "VICE_PRESIDENTE",
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useOwnershipTransfers: () => ({
    pendingTransfer: null,
    isLoading: false,
    isError: false,
    error: null,
    requestTransfer,
    cancelTransfer,
  }),
}));

describe("TransferirPropriedadeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requestTransfer.mockResolvedValue({ ok: true });
  });

  it("permite escolher um administrador existente e cria apenas a solicitação", async () => {
    render(<TransferirPropriedadeClient />);

    fireEvent.click(screen.getByRole("button", { name: /Lucas/ }));
    expect(screen.getByDisplayValue("lucas@example.com")).toHaveAttribute("readonly");
    expect(screen.getAllByText(/Vice-Presidente/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Sua senha (confirmação)"), {
      target: { value: "senha-segura" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByPlaceholderText("Digite TRANSFERIR"), {
      target: { value: "TRANSFERIR" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Solicitar transferência" }));

    await waitFor(() =>
      expect(requestTransfer).toHaveBeenCalledWith({
        athleteId: "athlete-1",
        email: "lucas@example.com",
        password: "senha-segura",
      })
    );
    expect(
      await screen.findByText(/A Presidência só será alterada quando o sucessor confirmar/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Transferência concluída com sucesso/)).not.toBeInTheDocument();
  });
});
