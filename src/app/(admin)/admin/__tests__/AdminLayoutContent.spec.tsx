import { act, fireEvent, render, screen } from "@testing-library/react";
import AdminLayoutContent from "../AdminLayoutContent";

const signOutMock = jest.fn();
const mockUseAdminAccess = jest.fn();

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
  useSession: () => ({
    data: { user: {} },
    status: "authenticated",
  }),
}));

jest.mock("@/hooks/useAdminAccess", () => ({
  useAdminAccess: (...args: unknown[]) => mockUseAdminAccess(...args),
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

describe("AdminLayoutContent", () => {
  beforeEach(() => {
    mockSidebar.mockClear();
    mockUseAdminAccess.mockReset();
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
});
