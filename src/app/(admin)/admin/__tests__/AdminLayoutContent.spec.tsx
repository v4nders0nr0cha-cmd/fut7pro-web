import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminLayoutContent from "../AdminLayoutContent";

const signOutMock = jest.fn();
const mockUseAdminAccess = jest.fn();
const replaceMock = jest.fn();
const mockUseSession = jest.fn();
const mockUseAdminNotifications = jest.fn();
const modalPropsSpy = jest.fn();

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
  useSession: (...args: unknown[]) => mockUseSession(...args),
}));

jest.mock("@/hooks/useAdminAccess", () => ({
  useAdminAccess: (...args: unknown[]) => mockUseAdminAccess(...args),
}));

jest.mock("@/hooks/useAdminNotifications", () => ({
  useAdminNotifications: (...args: unknown[]) => mockUseAdminNotifications(...args),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({
    replace: replaceMock,
    push: jest.fn(),
  }),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({
    tenantSlug: "racha-1",
    rachaId: "tenant-1",
    setTenantSlug: jest.fn(),
    setRachaId: jest.fn(),
  }),
}));

const mockSidebar = jest.fn(({ mobile, isOpen, onClose }) => (
  <div
    data-testid={mobile ? "sidebar-mobile" : "sidebar-desktop"}
    data-open={String(isOpen)}
    onClick={onClose}
  >
    Sidebar {mobile ? "mobile" : "desktop"}
  </div>
));

jest.mock("../Sidebar", () => ({
  __esModule: true,
  default: (props: any) => mockSidebar(props),
}));

jest.mock("../Header", () => ({
  __esModule: true,
  default: ({ onMenuClick }: { onMenuClick?: () => void }) => (
    <button aria-label="abrir menu" onClick={onMenuClick}>
      Header
    </button>
  ),
}));

jest.mock("@/components/layout/BottomMenuAdmin", () => ({
  __esModule: true,
  default: () => <div data-testid="bottom-menu-admin">Bottom Menu Admin</div>,
}));

jest.mock("@/context/NotificationContext", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notification-provider">{children}</div>
  ),
  useNotification: () => ({
    jogadores: 0,
    partidas: 0,
    config: 0,
    notificacoesNaoLidas: 0,
    toasts: [],
    notificacoes: [],
    notify: jest.fn(),
    removeToast: jest.fn(),
    marcarNotificacaoComoLida: jest.fn(),
    adicionarNotificacao: jest.fn(),
  }),
}));

jest.mock("@/components/admin/AccessCompensationGrantedModal", () => ({
  __esModule: true,
  default: (props: any) => {
    modalPropsSpy(props);
    if (!props.open) return null;
    return (
      <div data-testid="compensation-modal">
        <button type="button" onClick={props.onDismiss}>
          Fechar compensação
        </button>
      </div>
    );
  },
}));

describe("AdminLayoutContent", () => {
  beforeEach(() => {
    mockSidebar.mockClear();
    mockUseAdminAccess.mockReset();
    replaceMock.mockReset();
    mockUseSession.mockReset();
    mockUseSession.mockReturnValue({
      data: { user: {} },
      status: "authenticated",
      update: jest.fn(),
    });
    mockUseAdminNotifications.mockReset();
    mockUseAdminNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      error: undefined,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      mutate: jest.fn(),
    });
    mockUseAdminAccess.mockReturnValue({
      access: {
        tenant: { slug: "racha-1", id: "tenant-1" },
        blocked: false,
        reason: "",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    modalPropsSpy.mockClear();
    jest.useRealTimers();
  });

  it("renderiza layout com children", () => {
    render(
      <AdminLayoutContent>
        <p>Dashboard admin</p>
      </AdminLayoutContent>
    );

    expect(screen.getByText("Dashboard admin")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-menu-admin")).toBeInTheDocument();
    expect(screen.getByTestId("notification-provider")).toBeInTheDocument();
  });

  it("abre o sidebar mobile quando o header dispara onMenuClick", () => {
    render(<AdminLayoutContent>child</AdminLayoutContent>);

    fireEvent.click(screen.getByLabelText(/abrir menu/i));

    const hasOpenMobileSidebar = mockSidebar.mock.calls.some(
      (call) => call[0]?.mobile && call[0]?.isOpen
    );
    expect(hasOpenMobileSidebar).toBe(true);
  });

  it("mostra fallback quando o loading do acesso passa do timeout", () => {
    jest.useFakeTimers();
    const retryAccess = jest.fn();

    mockUseAdminAccess.mockReturnValue({
      access: null,
      isLoading: true,
      error: null,
      mutate: retryAccess,
    });

    render(<AdminLayoutContent>child</AdminLayoutContent>);

    expect(screen.getByText("Carregando painel...")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(screen.getByText("Painel demorou para responder")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retryAccess).toHaveBeenCalledTimes(1);
  });

  it("tenta recuperar sessao silenciosamente e abre modal quando continua sem sessao", async () => {
    jest.useFakeTimers();
    const updateSessionMock = jest.fn().mockResolvedValue(null);
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: updateSessionMock,
    });

    render(<AdminLayoutContent>child</AdminLayoutContent>);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(updateSessionMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Sua sessão expirou por segurança.")).toBeInTheDocument();
    });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("abre modal de compensacao no primeiro acesso e marca notificacao como lida ao fechar", async () => {
    jest.useFakeTimers();
    const markAsRead = jest.fn().mockResolvedValue({});
    mockUseAdminNotifications.mockReturnValue({
      notifications: [
        {
          id: "comp-1",
          recipientType: "ADMIN",
          recipientId: "admin-1",
          type: "ACCESS_COMPENSATION_GRANTED",
          title: "Seu racha recebeu dias extras",
          body: "Compensação concedida: +7 dia(s) de acesso.",
          href: "/admin/comunicacao/notificacoes?highlight=comp-1",
          readAt: null,
          isRead: false,
          metadata: {
            daysGranted: 7,
            newAccessUntil: "2026-05-01T00:00:00.000Z",
          },
          createdAt: "2026-04-11T10:00:00.000Z",
          updatedAt: "2026-04-11T10:00:00.000Z",
        },
      ],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      error: undefined,
      markAsRead,
      markAllAsRead: jest.fn(),
      mutate: jest.fn(),
    });

    render(<AdminLayoutContent>child</AdminLayoutContent>);

    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(screen.getByTestId("compensation-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar compensação" }));

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith("comp-1");
    });
  });
});
