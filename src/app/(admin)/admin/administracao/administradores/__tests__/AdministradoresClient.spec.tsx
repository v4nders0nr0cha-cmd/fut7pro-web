import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import AdministradoresClient from "../AdministradoresClient";

const cancelInvite = jest.fn();

jest.mock("@/hooks/useAdminRoles", () => ({
  useAdminRoles: () => ({
    slots: [
      {
        role: "PRESIDENTE",
        status: "ACTIVE",
        name: "Felipe",
      },
      {
        role: "VICE_PRESIDENTE",
        status: "ACTIVE",
        name: "Lucas",
        pendingInvite: true,
        pendingInviteId: "invite-1",
        pendingInviteExpiresAt: "2026-10-21T12:00:00.000Z",
        pendingInviteAthlete: { id: "athlete-2", name: "Vanderson", nickname: "Vando" },
      },
      { role: "DIRETOR_FUTEBOL", status: "EMPTY" },
      { role: "DIRETOR_FINANCEIRO", status: "EMPTY" },
    ],
    isLoading: false,
    isError: false,
    error: null,
    assignRole: jest.fn(),
    removeRole: jest.fn(),
    cancelInvite,
    mutate: jest.fn(),
    isSaving: false,
  }),
}));

jest.mock("@/hooks/useAdminRoleAthletes", () => ({
  useAdminRoleAthletes: () => ({ athletes: [], isLoading: false, isError: false }),
}));

describe("AdministradoresClient pending invites", () => {
  beforeEach(() => {
    cancelInvite.mockReset().mockResolvedValue({ status: "CANCELLED" });
  });

  it("mantém o ocupante atual e mostra o substituto aguardando aceite", () => {
    render(<AdministradoresClient />);

    expect(screen.getByText("Lucas")).toBeInTheDocument();
    expect(screen.getByText("Vanderson (Vando)")).toBeInTheDocument();
    expect(
      screen.getByText("O responsável atual permanece no cargo até que o convite seja aceito.")
    ).toBeInTheDocument();
  });

  it("cancela o convite específico sem remover o ocupante", async () => {
    render(<AdministradoresClient />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar convite" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar convite" }));

    await waitFor(() => expect(cancelInvite).toHaveBeenCalledWith("invite-1"));
    expect(
      await screen.findByText("O convite para Vice-Presidente foi cancelado.")
    ).toBeInTheDocument();
  });
});
