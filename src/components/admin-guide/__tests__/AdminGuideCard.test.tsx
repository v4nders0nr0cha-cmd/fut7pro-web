import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminOnboarding from "../AdminOnboarding";
import AdminGuideCard from "../AdminGuideCard";
const update = jest.fn().mockResolvedValue(true);
const copy = jest.fn().mockResolvedValue(undefined);
let guide: any;
jest.mock("@/hooks/useAdminGuide", () => ({
  useAdminGuide: () => ({ guide, update, updating: false }),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Ana Silva", image: null } } }),
}));
jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));
jest.mock("@/components/ui/feedback/Fut7DialogBase", () => ({
  __esModule: true,
  default: ({ open, children, onClose }: any) =>
    open ? (
      <div role="dialog">
        <button onClick={onClose}>Fechar modal</button>
        {children}
      </div>
    ) : null,
}));
beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  Object.defineProperty(navigator, "clipboard", { value: { writeText: copy }, configurable: true });
  copy.mockResolvedValue(undefined);
  update.mockResolvedValue(true);
  guide = {
    tenant: {
      id: "group",
      slug: "pelada",
      name: "Nossa Pelada",
      publicUrl: "https://app.fut7pro.com.br/pelada",
    },
    administrator: { membershipId: "member" },
    pedagogicalState: { revision: 0 },
    activationProgress: { completed: 1, total: 6, percentage: 17, complete: false },
    capabilities: { manageMatchesAndResults: true },
    tasks: [
      ["ACCOUNT_READY", "Conta criada e site no ar", "/", true],
      [
        "ACTIVE_PLAYERS",
        "Traga seus primeiros jogadores",
        "/admin/jogadores/listar-cadastrar",
        false,
      ],
      ["OFFICIAL_TEAMS", "Cadastre os times oficiais", "/admin/partidas/criar-times", false],
      ["FIRST_MATCHDAY", "Prepare o primeiro jogo", "/admin/partidas/criar", false],
      ["RESULTS_RECORDED", "Registre os resultados", "/admin/partidas/resultados-do-dia", false],
      [
        "CHAMPION_PUBLISHED",
        "Publique o Time Campeão do Dia",
        "/admin/partidas/time-campeao-do-dia",
        false,
      ],
    ].map(([id, title, route, completed]) => ({
      id,
      title,
      route,
      completed,
      canAct: true,
      applicable: true,
      requirement: "REQUIRED",
    })),
  };
});
it("shows six steps, personal greeting and actual public URL", () => {
  render(<AdminOnboarding />);
  expect(screen.getByText("Olá, Ana! Bem-vindo ao Fut7Pro!")).toBeInTheDocument();
  expect(screen.getByText(/17% concluído/)).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(6);
  expect(screen.getByText(guide.tenant.publicUrl)).toBeInTheDocument();
});

it("only records successful clipboard writes", async () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "INVITATION_COPIED", channel: "WHATSAPP" })
  );
  expect(copy).toHaveBeenCalledWith(expect.stringContaining(guide.tenant.publicUrl));
});

it("does not complete on clipboard failure", async () => {
  copy.mockRejectedValue(new Error("denied"));
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await screen.findByText(/A cópia falhou/);
  expect(update).not.toHaveBeenCalled();
});
it("keeps Instagram accessible after completion and records its copy separately", async () => {
  guide.tasks[1].completed = true;
  guide.pedagogicalState.currentStep = "ACTIVE_PLAYERS";
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: /Concluída Traga seus primeiros jogadores/ }));
  fireEvent.click(screen.getByRole("button", { name: "Instagram" }));
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "INVITATION_COPIED", channel: "INSTAGRAM" })
  );
});

it("opening external channels and manual form does not complete recruitment", () => {
  render(<AdminOnboarding />);
  expect(screen.getByRole("link", { name: "Compartilhar no WhatsApp" })).toHaveAttribute(
    "href",
    expect.stringContaining("https://wa.me/")
  );
  fireEvent.click(screen.getByRole("button", { name: "Cadastro manual" }));
  expect(screen.getByRole("link", { name: "Cadastrar jogador manualmente" })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS"
  );
  expect(update).not.toHaveBeenCalled();
});

it("starts guidance and skipping persists selection without completion", async () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Começar guia" }));
  await waitFor(() => expect(update).toHaveBeenCalledWith({ action: "WELCOME_SEEN" }));
  fireEvent.click(screen.getByRole("button", { name: "Pular etapa" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "STEP_SKIPPED", tipId: "ACTIVE_PLAYERS" })
  );
});

it("X closes temporarily and permanent dismissal saves only on explicit action", async () => {
  render(<AdminGuideCard />);
  await screen.findByRole("dialog");
  update.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Não mostrar novamente" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "DASHBOARD_INVITE_DISMISSED" })
  );
});

it("manual opening remains available after permanent dismissal", () => {
  guide.pedagogicalState.dashboardInviteDismissedAt = "2026-11-17T12:00:00Z";
  const { unmount } = render(<AdminGuideCard />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  unmount();
  render(<AdminOnboarding />);
  expect(screen.getByRole("button", { name: "Copiar convite" })).toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
});
