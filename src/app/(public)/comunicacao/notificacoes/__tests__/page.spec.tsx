import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NotificacoesPage from "../page";

const acceptInvite = jest.fn();
const rejectInvite = jest.fn();
const markAsRead = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({ publicHref: (path: string) => `/seu-racha${path}` }),
}));

jest.mock("@/hooks/usePublicNotifications", () => ({
  usePublicNotifications: () => ({
    notificacoes: [
      {
        id: "notification-1",
        titulo: "Convite para administracao",
        mensagem: "Convite enviado",
        data: "2026-10-14T12:00:00.000Z",
        lida: false,
        type: "SYSTEM",
        rachaSlug: "seu-racha",
        metadata: { kind: "ADMIN_ROLE_INVITE", adminRoleInviteId: "invite-1" },
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    markAsRead,
  }),
}));

let inviteStatus = "PENDING";

jest.mock("@/hooks/useAdminRoleInvites", () => ({
  useAdminRoleInvites: () => ({
    invites: [
      {
        id: "invite-1",
        role: "DIRETOR_FINANCEIRO",
        status: inviteStatus,
        createdAt: "2026-10-14T12:00:00.000Z",
        expiresAt: "2026-10-21T12:00:00.000Z",
        tenantName: "Seu Racha",
        tenantSlug: "seu-racha",
        invitedByName: "Felipe",
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    acceptInvite,
    rejectInvite,
  }),
}));

describe("NotificacoesPage admin role invites", () => {
  beforeEach(() => {
    inviteStatus = "PENDING";
    acceptInvite.mockReset().mockResolvedValue({ status: "ACCEPTED" });
    rejectInvite.mockReset().mockResolvedValue({ status: "REJECTED" });
    markAsRead.mockReset().mockResolvedValue({});
    refresh.mockReset();
  });

  it("aceita o convite real, atualiza os dados e abre o hub sem novo login", async () => {
    render(<NotificacoesPage />);

    expect(screen.getByText("Convite para Diretor Financeiro")).toBeInTheDocument();
    expect(screen.queryByText("Convite enviado")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aceitar convite" }));

    await waitFor(() => expect(acceptInvite).toHaveBeenCalledWith("invite-1"));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(markAsRead).toHaveBeenCalledWith("notification-1");
    expect(await screen.findByText(/Você agora é Diretor Financeiro/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Acessar painel administrativo" })).toHaveAttribute(
      "href",
      "/admin/selecionar-racha"
    );
  });

  it("não oferece ações para convite já encerrado", () => {
    inviteStatus = "CANCELLED";
    render(<NotificacoesPage />);

    expect(screen.getByText("Convite cancelado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aceitar convite" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rejeitar convite" })).not.toBeInTheDocument();
  });
});
