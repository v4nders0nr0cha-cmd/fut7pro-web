import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NotificacoesClient from "../NotificacoesClient";

const mockUseAdminNotifications = jest.fn();
const mockMarkAsRead = jest.fn();

jest.mock("@/hooks/useAdminNotifications", () => ({
  useAdminNotifications: (...args: unknown[]) => mockUseAdminNotifications(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("NotificacoesClient editorial", () => {
  beforeEach(() => {
    mockMarkAsRead.mockReset().mockResolvedValue({});
    mockUseAdminNotifications.mockReset().mockReturnValue({
      notifications: [
        {
          id: "notice-1",
          recipientType: "ADMIN",
          recipientId: "admin-1",
          type: "ACCESS_COMPENSATION_GRANTED",
          title: "Título histórico do racha",
          body: "Corpo histórico do racha.",
          href: null,
          readAt: null,
          isRead: false,
          metadata: { daysGranted: 7 },
          createdAt: "2026-04-11T10:00:00.000Z",
          updatedAt: "2026-04-11T10:00:00.000Z",
        },
      ],
      unreadCount: 1,
      isLoading: false,
      isError: false,
      error: undefined,
      markAsRead: mockMarkAsRead,
      markAllAsRead: jest.fn(),
    });
  });

  it("explica a leitura individual sem reescrever notificações antigas", async () => {
    render(<NotificacoesClient />);

    expect(
      screen.getByText(
        /As notificações ficam salvas, e o status de leitura acompanha a sua conta\./
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/sincronizada para todos os admins/)).not.toBeInTheDocument();
    expect(screen.getByText("Título histórico do racha")).toBeInTheDocument();
    expect(screen.getByText("Corpo histórico do racha.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Marcar como lida" }));
    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith("notice-1"));
    expect(mockMarkAsRead).toHaveBeenCalledTimes(1);
  });
});
