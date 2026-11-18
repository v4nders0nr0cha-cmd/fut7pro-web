import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminOnboarding from "../AdminOnboarding";
import AdminGuidePresenter from "../AdminGuidePresenter";
const update = jest.fn().mockResolvedValue(true);
const retry = jest.fn(() => Promise.resolve(guide));
let pathname = "/admin/dashboard";
let search = "";
const replace = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ replace }),
}));
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
  useAdminGuide: () => ({ guide: withPhases(guide), update, retry, updating: false }),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Ana Silva", image: null, onboardingLoginId: loginId } },
  }),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt ?? ""} />,
}));
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
  pathname = "/admin/dashboard";
  search = "";
  loginId = "login-1";
  eligiblePlayers = 10;
  sessionStorage.clear();
  localStorage.clear();
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
    activationProgress: { completed: 1, total: 8, percentage: 13, complete: false },
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
it("keeps the main summary clean with four visible steps and eight in the overall progress", () => {
  render(<AdminOnboarding />);
  expect(screen.getByText("Olá, Ana! Bem-vindo ao Fut7Pro!")).toBeInTheDocument();
  expect(screen.getByText(/13% concluído/)).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
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
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=pagina"
  );
  expect(update).not.toHaveBeenCalled();
});

it("offers a single invitation action without a competing start button", () => {
  render(<AdminOnboarding />);
  expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Começar guia" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Pular por enquanto" })).not.toBeInTheDocument();
});
it("X closes temporarily without leaving a dashboard card", async () => {
  render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  update.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Continuar guia" })).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalledWith({ action: "DASHBOARD_INVITE_DISMISSED" });
});
it("requires confirmation before permanent dismissal and permits cancelling", async () => {
  render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  update.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Não mostrar este Guia novamente" }));
  expect(screen.getByRole("alertdialog")).toBeVisible();
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Manter o guia" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Não mostrar este Guia novamente" }));
  fireEvent.click(screen.getByRole("button", { name: /^Não mostrar novamente$/ }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "DASHBOARD_INVITE_DISMISSED" })
  );
});

it("manual opening remains available after permanent dismissal", () => {
  guide.pedagogicalState.dashboardInviteDismissedAt = "2026-11-17T12:00:00Z";
  const { unmount } = render(<AdminGuidePresenter />);
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

it("resumes guidance on another authenticated login after a temporary close", async () => {
  const view = render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  view.unmount();
  guide.pedagogicalState.welcomePresentedAt = "2026-11-18T12:00:00Z";
  loginId = "login-2";
  render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  expect(screen.getByText("Bem-vindo de volta, Ana!")).toBeVisible();
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

it.each([2, 3])(
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
    `${guide.tasks[index].route}?guia=${guide.tasks[index].id}&guiaOrigem=pagina`
  );
});

it("future stages stay readable without offering skip or unlocking their action", () => {
  render(<AdminOnboarding />);
  expect(screen.queryByRole("button", { name: "Pular por enquanto" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Defina os dias e horários" }));
  expect(screen.getByRole("button", { name: /^Continuar$/ })).toBeDisabled();
  expect(update).not.toHaveBeenCalled();
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
  guide.tasks.slice(0, 4).forEach((task: any) => (task.completed = true));
  guide.tasks[5].completed = true;
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
  fireEvent.click(screen.getByRole("button", { name: "Defina os dias e horários" }));
  expect(screen.getByRole("heading", { name: "Defina os dias e horários" })).toBeVisible();
  expect(update).not.toHaveBeenCalled();
});
it("the information icon explains both phases and returns to the guide", async () => {
  render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Sobre o Guia Interativo" }));
  expect(screen.getByRole("heading", { name: "Como funciona o Guia Interativo?" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Voltar ao guia" }));
  expect(screen.getByRole("button", { name: "Convidar jogadores agora" })).toBeVisible();
});
it("celebrates preparation once and shows how many athletes are missing", async () => {
  guide.tasks.slice(0, 4).forEach((task) => (task.completed = true));
  eligiblePlayers = 7;
  render(<AdminGuidePresenter />);
  await screen.findByRole("heading", { name: "Sua pelada está configurada! 🎉⚽" });
  expect(screen.getByText(/7 de 10 atletas cadastrados/)).toBeVisible();
  expect(update).toHaveBeenCalledWith({ action: "PREPARATION_CELEBRATED" });
  fireEvent.click(screen.getByRole("button", { name: "Convidar mais jogadores" }));
  expect(screen.getByRole("button", { name: "Copiar convite" })).toBeVisible();
});
it("offers a newly unlocked football milestone during the same login", async () => {
  guide.tasks.slice(0, 4).forEach((task) => (task.completed = true));
  guide.pedagogicalState.preparationCelebratedAt = "2026-11-17T00:00:00Z";
  eligiblePlayers = 9;
  const initial = render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  expect(screen.getByText(/9 de 10 atletas elegíveis/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Sobre o Guia Interativo" }));
  expect(screen.getByRole("heading", { name: "Como funciona o Guia Interativo?" })).toBeVisible();
  update.mockImplementation(async ({ action }) => {
    if (action === "FOOTBALL_INVITE_PRESENTED")
      expect(screen.getByRole("heading", { name: /A galera está chegando/ })).toBeVisible();
    return true;
  });
  eligiblePlayers = 10;
  initial.rerender(<AdminGuidePresenter />);
  await screen.findByRole("heading", { name: /A galera está chegando/ });
  fireEvent.click(screen.getByRole("button", { name: "Começar a Parte 2" }));
  await screen.findByRole("heading", { name: "Avalie o nível dos atletas" });
});

it("uses neutral, proportional branding and contextual return copy", () => {
  guide.tenant.logoUrl = "https://fixture.invalid/transparent.png";
  guide.pedagogicalState.welcomePresentedAt = "2026-11-18T12:00:00Z";
  const view = render(<AdminOnboarding />);
  const logo = screen.getByRole("img", { name: `Escudo de ${guide.tenant.name}` });
  expect(logo).toHaveClass("object-cover", "scale-[1.35]");
  expect(logo.style.maskImage).toContain("radial-gradient");
  expect(logo.parentElement).toHaveClass("bg-[#24272d]");
  expect(screen.getByText(/Bom ter você de volta, professor/)).toBeVisible();
  guide.tasks.slice(0, 4).forEach((task: any) => (task.completed = true));
  eligiblePlayers = 9;
  view.rerender(<AdminOnboarding />);
  expect(screen.getByText(/Sua pelada já está configurada/)).toBeVisible();
  eligiblePlayers = 10;
  view.rerender(<AdminOnboarding />);
  expect(screen.getByText(/A galera já está chegando!/)).toBeVisible();
});

it("never opens over an operational form or records an unseen presentation", async () => {
  pathname = "/admin/partidas/criar-times";
  render(<AdminGuidePresenter />);
  await Promise.resolve();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
});
it("keeps X across Dashboard remounts in the same login, but allows an explicit contextual return", async () => {
  const view = render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  view.unmount();
  const second = render(<AdminGuidePresenter />);
  await waitFor(() => expect(retry).toHaveBeenCalledTimes(2));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  search = "retomarGuia=1&grupoGuia=pelada";
  second.rerender(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  expect(replace).toHaveBeenCalledWith("/admin/dashboard", { scroll: false });
  pathname = "/admin/partidas/criar-times";
  second.rerender(<AdminGuidePresenter />);
  pathname = "/admin/dashboard";
  second.rerender(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  await waitFor(() => expect(replace).toHaveBeenCalledTimes(2));
});
it("selects the next real pending task on return rather than a completed historical selection", async () => {
  guide.tasks.slice(0, 3).forEach((task) => (task.completed = true));
  guide.pedagogicalState.currentStep = "CHAMPION_PUBLISHED";
  guide.pedagogicalState.welcomePresentedAt = "2026-11-17T00:00:00Z";
  render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  expect(screen.getByRole("heading", { name: "Cadastre os times" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar-times?guia=OFFICIAL_TEAMS&guiaOrigem=dashboard"
  );
});
it("does not record a milestone until its dialog is actually visible", async () => {
  update.mockImplementation(async () => {
    expect(screen.getByRole("dialog")).toBeVisible();
    return true;
  });
  render(<AdminGuidePresenter />);
  await waitFor(() => expect(update).toHaveBeenCalledWith({ action: "WELCOME_PRESENTED" }));
});

it("isolates temporary closing by group, administrator and real login", async () => {
  const view = render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  guide = {
    ...guide,
    tenant: { ...guide.tenant, id: "group-b", slug: "pelada-b" },
    administrator: { membershipId: "member-b" },
  };
  view.rerender(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  guide.administrator.membershipId = "another-administrator";
  view.rerender(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
});

it("keeps completed explanations clickable and advances a selected pending step only when it really completes", () => {
  guide.tasks.slice(0, 3).forEach((task) => (task.completed = true));
  const view = render(<AdminOnboarding />);
  fireEvent.click(screen.getByRole("button", { name: "Cadastre os times" }));
  fireEvent.click(screen.getByRole("button", { name: /Defina os dias e horários$/ }));
  expect(screen.getByRole("heading", { name: "Defina os dias e horários" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Cadastre os times" }));
  guide.tasks[3].completed = true;
  view.rerender(<AdminOnboarding />);
  expect(screen.getByRole("heading", { name: "Avalie o nível dos atletas" })).toBeVisible();
});

it("does not consume the final celebration during an operational navigation in flight", async () => {
  guide.tasks.slice(0, 7).forEach((task) => (task.completed = true));
  guide.pedagogicalState.preparationCelebratedAt = "2026-11-17T00:00:00Z";
  guide.pedagogicalState.footballInvitePresentedAt = "2026-11-17T00:00:00Z";
  guide.pedagogicalState.footballStartedAt = "2026-11-17T00:00:00Z";
  const view = render(<AdminGuidePresenter />);
  await screen.findByRole("dialog");
  const link = screen.getByRole("link", { name: "Continuar" });
  link.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(link);
  guide = {
    ...guide,
    tasks: guide.tasks.map((task) => ({ ...task, completed: true })),
    activationProgress: { completed: 8, total: 8, percentage: 100, complete: true },
    reward: { eligible: false, granted: false },
  };
  view.rerender(<AdminGuidePresenter />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalledWith({ action: "COMPLETION_PRESENTED" });
  pathname = "/admin/partidas/time-campeao-do-dia";
  view.rerender(<AdminGuidePresenter />);
  pathname = "/admin/dashboard";
  view.rerender(<AdminGuidePresenter />);
  await screen.findByRole("heading", { name: "Guia concluído!" });
  expect(update).toHaveBeenCalledWith({ action: "COMPLETION_PRESENTED" });
});

it("shows only the active phase and places its list before the selected explanation", () => {
  const view = render(<AdminOnboarding initialStep="CHAMPION_PUBLISHED" />);
  const list = screen.getByRole("list", { name: "Etapas de Prepare seu grupo" });
  expect(list.querySelectorAll("li")).toHaveLength(4);
  expect(
    screen.queryByRole("button", { name: "Publique o Time Campeão do Dia" })
  ).not.toBeInTheDocument();
  expect(screen.queryByText("Ver próxima etapa")).not.toBeInTheDocument();
  expect(screen.queryByText("Parte 1 — Prepare seu grupo")).not.toBeInTheDocument();
  const details = screen.getByRole("region", { name: "Traga seus primeiros jogadores" });
  expect(list.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  guide.tasks.slice(0, 4).forEach((task: any) => (task.completed = true));
  eligiblePlayers = 9;
  view.rerender(<AdminOnboarding />);
  expect(screen.queryByRole("list", { name: "Etapas de Entre em campo" })).not.toBeInTheDocument();
  expect(screen.getByText(/9 de 10 atletas elegíveis/)).toBeVisible();
  eligiblePlayers = 10;
  view.rerender(<AdminOnboarding />);
  expect(
    screen.getByRole("list", { name: "Etapas de Entre em campo" }).querySelectorAll("li")
  ).toHaveLength(4);
  expect(
    screen.queryByRole("list", { name: "Etapas de Prepare seu grupo" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Avalie o nível dos atletas" })).toBeVisible();
});

it.each([5, 6, 7])(
  "keeps football step %s consultable without bypassing preceding sports work",
  (index) => {
    guide.tasks.slice(0, 4).forEach((task: any) => (task.completed = true));
    render(<AdminOnboarding />);
    fireEvent.click(screen.getByRole("button", { name: guide.tasks[index].title }));
    expect(screen.getByRole("heading", { name: guide.tasks[index].title })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    expect(screen.getByText("Conclua as etapas anteriores para liberar esta ação.")).toBeVisible();
    expect(update).not.toHaveBeenCalled();
  }
);
