import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OwnershipTransferConfirmationClient from "../OwnershipTransferConfirmationClient";

const updateSession = jest.fn();
const useSession = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => useSession(),
  signOut: jest.fn(),
}));

const request = {
  id: "transfer-1",
  tenantId: "tenant-1",
  tenantName: "Seu Racha",
  requestedByUserId: "president-1",
  requestedByName: "Felipe",
  recipientUserId: "successor-1",
  recipientName: "Lucas",
  recipientEmail: "lucas@example.com",
  status: "PENDING",
  expiresAt: "2030-01-01T12:00:00.000Z",
  emailDeliveryStatus: "SENT",
  deliveryAttempts: 1,
  createdAt: "2029-12-31T12:00:00.000Z",
  updatedAt: "2029-12-31T12:00:00.000Z",
};

describe("OwnershipTransferConfirmationClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    window.history.replaceState(
      {},
      "",
      "/transferencia-presidencia/confirmar#token=abcdefghijklmnopqrstuvwxyz123456"
    );
    updateSession.mockResolvedValue(undefined);
  });

  it("preserva o token fora do redirecionamento quando o usuário precisa entrar", async () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated", update: updateSession });

    render(<OwnershipTransferConfirmationClient />);

    const loginLink = await screen.findByRole("link", { name: "Entrar para continuar" });
    expect(loginLink).toHaveAttribute(
      "href",
      "/login?callbackUrl=%2Ftransferencia-presidencia%2Fconfirmar"
    );
    expect(loginLink.getAttribute("href")).not.toContain("abcdefghijklmnopqrstuvwxyz");
    expect(window.location.hash).toBe("");
    expect(window.sessionStorage.getItem("fut7pro:ownership-transfer-token")).toBe(
      "abcdefghijklmnopqrstuvwxyz123456"
    );
  });

  it("consulta o convite e só aceita após ação explícita", async () => {
    useSession.mockReturnValue({
      data: { user: { accessToken: "valid-token", accessTokenExp: 4102444800 } },
      status: "authenticated",
      update: updateSession,
    });
    const originalFetch = global.fetch;
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => request })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...request, status: "ACCEPTED" }),
      });
    global.fetch = fetchMock as typeof fetch;

    render(<OwnershipTransferConfirmationClient />);

    expect(await screen.findByText("Seu Racha")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/public/transferencia-presidencia/consultar");

    fireEvent.click(screen.getByRole("button", { name: "Aceitar Presidência" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toBe("/api/public/transferencia-presidencia/aceitar");
    expect(updateSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Presidência transferida com sucesso")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("fut7pro:ownership-transfer-token")).toBeNull();

    global.fetch = originalFetch;
  });
});
