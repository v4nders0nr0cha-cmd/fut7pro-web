import { fireEvent, render, screen } from "@testing-library/react";
import AdminLayoutContent from "../AdminLayoutContent";

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
});
