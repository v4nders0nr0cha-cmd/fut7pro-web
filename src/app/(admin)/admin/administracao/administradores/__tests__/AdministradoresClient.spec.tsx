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
  useAdminRoleAthletes: () => ({
    athletes: [
      { id: "athlete-3", nome: "Maria", email: "maria@fixture.invalid", hasUserAccount: true },
    ],
    isLoading: false,
    isError: false,
  }),
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

  it("explica o convite e a mensalidade em linguagem simples", () => {
    render(<AdministradoresClient />);
    fireEvent.click(screen.getByRole("button", { name: "Alterar indicação" }));
    fireEvent.click(screen.getByRole("button", { name: /Maria/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Convidar para Vice-Presidente?" })
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Ela só terá acesso|Ele só terá acesso/)).toBeInTheDocument();
    expect(within(dialog).getByText("Como ficará a mensalidade dele?")).toBeInTheDocument();
    expect(within(dialog).getByText("Administrador sem pagar mensalidade")).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Ele não pagará mensalidade enquanto essa opção estiver ativa. O presidente poderá mudar essa escolha depois."
      )
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Administrador pagando normalmente")).toBeInTheDocument();
    expect(within(dialog).getByText("O que acontece depois")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Enviar convite" })).toBeDisabled();
    fireEvent.click(
      within(dialog).getByRole("radio", { name: /Administrador sem pagar mensalidade/ })
    );
    expect(within(dialog).getByRole("button", { name: "Enviar convite" })).toBeEnabled();
  });

  it("devolve o foco a Continuar ao voltar e ao botão de origem ao cancelar", async () => {
    render(<AdministradoresClient />);
    const opener = screen.getByRole("button", { name: "Alterar indicação" });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: /Maria/ }));
    const continueButton = screen.getByRole("button", { name: "Continuar" });
    continueButton.focus();
    fireEvent.click(continueButton);

    const confirmation = screen.getByRole("dialog", { name: "Convidar para Vice-Presidente?" });
    fireEvent.click(within(confirmation).getByRole("button", { name: "Voltar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Continuar" })).toHaveFocus());

    const selection = screen.getByRole("dialog", { name: "Selecionar atleta" });
    fireEvent.click(within(selection).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
