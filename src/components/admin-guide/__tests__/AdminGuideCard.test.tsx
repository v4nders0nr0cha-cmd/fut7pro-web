import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminOnboarding from "../AdminOnboarding";
import AdminGuideCard from "../AdminGuideCard";
const update = jest.fn().mockResolvedValue(true);
const copy = jest.fn().mockResolvedValue(undefined);
let guide: any;
let loginId = "login-1";
let eligiblePlayers = 10;
function withPhases(value: any) {
  if (!value) return value;
  const preparationIds = ["ACCOUNT_READY", "ACTIVE_PLAYERS", "SCHEDULE", "OFFICIAL_TEAMS"];
  const footballIds = [
    "ATHLETE_LEVELS",
    "FIRST_MATCHDAY",
    "RESULTS_RECORDED",
    "CHAMPION_PUBLISHED",
  ];
  const progress = (ids: string[], title: string) => {
    const completed = ids.filter((id) =>
      value.tasks.some((task: any) => task.id === id && task.completed)
    ).length;
    return {
      id: title,
      title,
      taskIds: ids,
      completed,
      total: 4,
      percentage: completed * 25,
      complete: completed === 4,
      unlocked: true,
    };
  };
  const preparation = progress(preparationIds, "Parte 1 — Prepare seu grupo");
  const football = progress(footballIds, "Parte 2 — Entre em campo");
  football.unlocked = preparation.complete && eligiblePlayers >= 10;
  value.phases = { preparation, football };
  value.guideVersion = 3;
  value.eligibility = {
    eligiblePlayers,
    minimumPlayers: 10,
    missingPlayers: Math.max(0, 10 - eligiblePlayers),
    preparationComplete: preparation.complete,
    footballUnlocked: football.unlocked,
  };
  const ids = [...preparationIds, ...footballIds];
  value.actionAvailability = Object.fromEntries(
    ids.map((id, index) => {
      const task = value.tasks.find((item: any) => item.id === id);
      const allowed = Boolean(
        (id === "ACTIVE_PLAYERS" || task?.canAct) &&
          ids
            .slice(0, index)
            .every((previous) =>
              value.tasks.some((item: any) => item.id === previous && item.completed)
            ) &&
          (!footballIds.includes(id) || football.unlocked)
      );
      return [
        id,
        {
          allowed,
          reason: allowed
            ? null
            : task?.canAct === false
              ? "PERMISSION"
              : footballIds.includes(id) && !football.unlocked
                ? "PHASE_LOCKED"
                : "PREVIOUS_STEPS",
        },
      ];
    })
  );
  value.transition = {
    preparationCelebrationPending:
      preparation.complete && !value.pedagogicalState.preparationCelebratedAt,
    footballInvitationPending:
      football.unlocked &&
      !value.pedagogicalState.footballStartedAt &&
      !value.pedagogicalState.footballInvitePresentedAt &&
      !value.pedagogicalState.dashboardInviteDismissedAt,
  };
  return value;
}
jest.mock("@/hooks/useAdminGuide", () => ({
  useAdminGuide: () => ({ guide: withPhases(guide), update, updating: false }),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Ana Silva", image: null, onboardingLoginId: loginId } },
  }),
}));
jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));
jest.mock("@/components/ui/feedback/Fut7DialogBase", () => ({
  __esModule: true,
  default: ({ open, children, onClose, icon }: any) =>
    open ? (
      <div role="dialog">
        {icon}
        <button onClick={onClose}>Fechar modal</button>
        {children}
      </div>
    ) : null,
}));
beforeEach(() => {
  jest.clearAllMocks();
  loginId = "login-1";
  eligiblePlayers = 10;
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
    capabilities: { manageMatchesAndResults: true, publishChampion: true },
    tasks: [
      ["ACCOUNT_READY", "Conta criada e site no ar", "/", true],
      [
        "ACTIVE_PLAYERS",
        "Traga seus primeiros jogadores",
        "/admin/jogadores/listar-cadastrar",
        false,
      ],
      ["SCHEDULE", "Defina os dias e horários", "/admin/rachas", false],
      ["OFFICIAL_TEAMS", "Cadastre os times", "/admin/partidas/criar-times", false],
      ["ATHLETE_LEVELS", "Avalie o nível dos atletas", "/admin/jogadores/nivel-dos-atletas", false],
      ["FIRST_MATCHDAY", "Prepare a primeira rodada", "/admin/partidas/criar", false],
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
it("keeps the main welcome summary clean with six steps and a personal greeting", () => {
  render(<AdminOnboarding />);
  expect(screen.getByText("Olá, Ana! Bem-vindo ao Fut7Pro!")).toBeInTheDocument();
  expect(screen.getByText(/17% concluído/)).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(8);
  expect(screen.queryByText(guide.tenant.publicUrl)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "WhatsApp" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Copiar convite" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toBeEnabled();
});

it("only records successful clipboard writes", async () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Convidar jogadores agora" }));
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "INVITATION_COPIED", channel: "WHATSAPP" })
  );
  expect(copy).toHaveBeenCalledWith(expect.stringContaining(guide.tenant.publicUrl));
});

it("does not complete on clipboard failure", async () => {
  copy.mockRejectedValue(new Error("denied"));
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Convidar jogadores agora" }));
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await screen.findByText(/A cópia falhou/);
  expect(update).not.toHaveBeenCalled();
});
it("keeps Instagram accessible after completion and records its copy separately", async () => {
  guide.tasks[1].completed = true;
  guide.pedagogicalState.currentStep = "ACTIVE_PLAYERS";
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: /Concluída Traga seus primeiros jogadores/ }));
  fireEvent.click(screen.getByRole("button", { name: "Convidar jogadores agora" }));
  fireEvent.click(screen.getByRole("button", { name: "Instagram" }));
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "INVITATION_COPIED", channel: "INSTAGRAM" })
  );
});

it("opening external channels and manual form does not complete recruitment", () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Convidar jogadores agora" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Pular por enquanto" }));
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
  expect(update).toHaveBeenCalledWith({ action: "WELCOME_PRESENTED" });
  expect(update).not.toHaveBeenCalledWith({ action: "DASHBOARD_INVITE_DISMISSED" });
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
  expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
});

it("updates the return greeting when asynchronous guide data arrives", () => {
  const loaded = guide;
  guide = null;
  const { rerender } = render(<AdminOnboarding />);
  guide = {
    ...loaded,
    pedagogicalState: { revision: 1, welcomePresentedAt: "2026-11-17T12:00:00Z" },
  };
  rerender(<AdminOnboarding />);
  expect(screen.getByText("Bem-vindo de volta, Ana!")).toBeInTheDocument();
});

it("offers again after a new authenticated login in the same tab", async () => {
  const view = render(<AdminGuideCard />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  view.unmount();
  const sameLogin = render(<AdminGuideCard />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  sameLogin.unmount();
  loginId = "login-2";
  render(<AdminGuideCard />);
  await screen.findByRole("dialog");
});

it("opens a separate invitation panel and restores the clean summary on return", async () => {
  render(<AdminOnboarding />);
  const trigger = screen.getByRole("button", { name: "Convidar jogadores agora" });
  fireEvent.click(trigger);
  expect(
    screen.queryByRole("region", { name: "Primeiros passos do grupo" })
  ).not.toBeInTheDocument();
  expect(screen.getAllByText(guide.tenant.publicUrl)).toHaveLength(1);
  expect(screen.getByRole("img", { name: /convite fixado/ })).toHaveAttribute(
    "src",
    "/images/onboarding/whatsapp.webp"
  );
  fireEvent.click(screen.getByRole("button", { name: "Instagram" }));
  expect(screen.getByRole("img", { name: /perfil do Instagram/ })).toHaveAttribute(
    "src",
    "/images/onboarding/instagram.webp"
  );
  expect(screen.getByRole("button", { name: "Copiar link" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Voltar aos primeiros passos" }));
  expect(screen.queryByRole("button", { name: "Copiar link" })).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toHaveFocus()
  );
  expect(update).not.toHaveBeenCalled();
});

it.each([2, 3, 4, 5, 6, 7])(
  "keeps step %s readable while preventing action ahead of its prerequisites",
  (index) => {
    render(<AdminOnboarding />);
    fireEvent.click(screen.getByRole("button", { name: guide.tasks[index].title }));
    expect(screen.getByRole("heading", { name: guide.tasks[index].title })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();
    expect(
      screen.getByText(
        index >= 4
          ? "Conclua a Parte 1 para liberar esta fase."
          : "Conclua as etapas anteriores para liberar esta ação."
      )
    ).toBeVisible();
  }
);

it.each([2, 3, 4, 5, 6, 7])("unlocks step %s only after all predecessors complete", (index) => {
  for (let i = 0; i < index; i++) guide.tasks[i].completed = true;
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: guide.tasks[index].title }));
  expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    `${guide.tasks[index].route}?guia=${guide.tasks[index].id}`
  );
});

it("skipping recruitment preserves its pending state and does not unlock teams", async () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Pular por enquanto" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled());
  expect(update).toHaveBeenCalledWith({ action: "STEP_SKIPPED", tipId: "ACTIVE_PLAYERS" });
  expect(guide.tasks[1].completed).toBe(false);
});

it("responds to prerequisite completion received from the server", () => {
  const { rerender } = render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Defina os dias e horários" }));
  expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  guide = {
    ...guide,
    tasks: guide.tasks.map((task) =>
      task.id === "ACTIVE_PLAYERS" ? { ...task, completed: true } : task
    ),
  };
  rerender(<AdminOnboarding />);
  expect(screen.getByRole("link", { name: "Continuar" })).toBeVisible();
});

it("keeps later actions locked when an earlier prerequisite is missing despite later records", () => {
  guide.tasks[4].completed = true;
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Publique o Time Campeão do Dia" }));
  expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
});

it("preserves permissions after prerequisites complete", () => {
  guide.tasks.slice(0, 2).forEach((task) => (task.completed = true));
  guide.tasks[2].canAct = false;
  render(<AdminOnboarding />);
  expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();
});

it("navigation to the next explanation does not write to the backend", () => {
  render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Ver próxima etapa" }));
  expect(screen.getByRole("heading", { name: "Defina os dias e horários" })).toBeVisible();
  expect(update).not.toHaveBeenCalled();
});
it("the information icon explains both phases and returns to the guide", async () => {
  render(<AdminGuideCard />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Sobre o Guia Interativo" }));
  expect(screen.getByRole("heading", { name: "Como funciona o Guia Interativo?" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Voltar ao guia" }));
  expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toBeVisible();
});
it("celebrates preparation once and shows how many athletes are missing", async () => {
  guide.tasks.slice(0, 4).forEach((task) => (task.completed = true));
  eligiblePlayers = 7;
  render(<AdminGuideCard />);
  await screen.findByRole("heading", { name: "Sua pelada está configurada! 🎉⚽" });
  expect(screen.getByText(/7 de 10 atletas cadastrados/)).toBeVisible();
  expect(update).toHaveBeenCalledWith({ action: "PREPARATION_CELEBRATED" });
  fireEvent.click(screen.getByRole("button", { name: "Convidar mais jogadores" }));
  expect(screen.getByRole("button", { name: "Copiar convite" })).toBeVisible();
});
it("offers football on a new login after enough players join", async () => {
  guide.tasks.slice(0, 4).forEach((task) => (task.completed = true));
  guide.pedagogicalState.preparationCelebratedAt = "2026-11-17T00:00:00Z";
  eligiblePlayers = 9;
  const initial = render(<AdminGuideCard />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  eligiblePlayers = 10;
  initial.rerender(<AdminGuideCard />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  initial.unmount();
  loginId = "login-2";
  render(<AdminGuideCard />);
  await screen.findByRole("heading", { name: /A galera está chegando/ });
  fireEvent.click(screen.getByRole("button", { name: "Começar a Parte 2" }));
  await waitFor(() => expect(update).toHaveBeenCalledWith({ action: "FOOTBALL_STARTED" }));
  await screen.findByRole("heading", { name: "Avalie o nível dos atletas" });
});
