import { expect, type Page } from "@playwright/test";
export const ids = [
  "ACCOUNT_READY",
  "ACTIVE_PLAYERS",
  "SCHEDULE",
  "OFFICIAL_TEAMS",
  "ATHLETE_LEVELS",
  "FIRST_MATCHDAY",
  "RESULTS_RECORDED",
  "CHAMPION_PUBLISHED",
];
const titles = [
  "Conta criada e site no ar",
  "Traga seus primeiros jogadores",
  "Defina os dias e horários",
  "Cadastre os times",
  "Avalie o nível dos atletas",
  "Prepare a primeira rodada",
  "Registre os resultados",
  "Publique o Time Campeão do Dia",
];
const routes = [
  "/",
  "/admin/jogadores/listar-cadastrar",
  "/admin/rachas",
  "/admin/partidas/criar-times",
  "/admin/jogadores/nivel-dos-atletas",
  "/admin/partidas/criar",
  "/admin/partidas/resultados-do-dia",
  "/admin/partidas/time-campeao-do-dia",
];
// Browser fixture tests navigation, real forms/hooks and persisted-response updates.
// PostgreSQL integration separately verifies the production completion predicates.
export async function installGuide(page: Page) {
  expect(process.env.ADMIN_SMOKE_FIXTURE).toBe("1");
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "accepted"));
  await page.route(/^https:\/\/api\.fut7pro\.com\.br(?:\/|$)/, (route) => route.abort());
  const teams: any[] = [];
  const posts: Array<{ url: string; body: any }> = [];
  const completed = new Set(ids.slice(0, 3));
  const state: any = {
    revision: 0,
    knownTips: [],
    dismissedTips: [],
    snoozedTips: {},
    viewedResources: [],
  };
  let eligible = 9;
  let rewardEligible = false;
  let rewardGranted = false;
  const actions: string[] = [];
  const snapshot = () => {
    if (teams.length >= 2) completed.add("OFFICIAL_TEAMS");
    const tasks = ids.map((id, i) => ({
      id,
      title: titles[i],
      route: routes[i],
      requirement: "REQUIRED",
      completed: completed.has(id),
      canAct: true,
      applicable: true,
    }));
    const phase = (taskIds: string[], title: string) => ({
      taskIds,
      title,
      completed: taskIds.filter((id) => completed.has(id)).length,
      total: 4,
      percentage: taskIds.filter((id) => completed.has(id)).length * 25,
      complete: taskIds.every((id) => completed.has(id)),
      unlocked: true,
    });
    const preparation = phase(ids.slice(0, 4), "Parte 1 — Prepare seu grupo");
    const football = phase(ids.slice(4), "Parte 2 — Entre em campo");
    football.unlocked = preparation.complete && eligible >= 10;
    return {
      guideVersion: 3,
      tenant: {
        id: "fixture-tenant",
        slug: "grupo-fixture",
        name: "Grupo Fixture",
        publicUrl: "https://app.fut7pro.com.br/grupo-fixture",
      },
      administrator: { membershipId: "fixture-membership", role: "PRESIDENTE", status: "APROVADO" },
      pedagogicalState: state,
      capabilities: {
        managePlayers: true,
        manageOfficialTeams: true,
        manageMatchesAndResults: true,
        publishChampion: true,
      },
      operationalState: { activeOfficialTeams: teams.length, eligiblePlayerCount: eligible },
      tasks,
      activationProgress: {
        completed: completed.size,
        total: 8,
        percentage: Math.round((completed.size / 8) * 100),
        complete: completed.size === 8,
      },
      phases: { preparation, football },
      eligibility: {
        eligiblePlayers: eligible,
        minimumPlayers: 10,
        missingPlayers: Math.max(0, 10 - eligible),
        preparationComplete: preparation.complete,
        footballUnlocked: football.unlocked,
      },
      transition: {
        preparationCelebrationPending: preparation.complete && !state.preparationCelebratedAt,
        footballInvitationPending:
          football.unlocked && !state.footballInvitePresentedAt && !state.footballStartedAt,
      },
      actionAvailability: Object.fromEntries(
        ids.map((id, i) => [
          id,
          {
            allowed:
              ids.slice(0, i).every((previous) => completed.has(previous)) &&
              (i < 4 || football.unlocked),
            reason: i >= 4 && !football.unlocked ? "MINIMUM_PLAYERS" : "PREVIOUS_STEPS",
          },
        ])
      ),
      reward: {
        granted: rewardGranted,
        eligible: rewardEligible,
        days: 10,
        trialEnd: "2099-01-20T18:00:00Z",
      },
      nextAction: null,
      laterRecommendations: [],
      notices: {},
    };
  };
  await page.route("**/api/admin/guide", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: snapshot() });
    const value = route.request().postDataJSON();
    const action = value.action;
    actions.push(action);
    const markers: Record<string, string> = {
      WELCOME_PRESENTED: "welcomePresentedAt",
      WELCOME_SEEN: "welcomeSeenAt",
      PREPARATION_CELEBRATED: "preparationCelebratedAt",
      FOOTBALL_INVITE_PRESENTED: "footballInvitePresentedAt",
      FOOTBALL_STARTED: "footballStartedAt",
      COMPLETION_PRESENTED: "completionPresentedAt",
      REWARD_PRESENTED: "rewardPresentedAt",
      DASHBOARD_INVITE_DISMISSED: "dashboardInviteDismissedAt",
    };
    const field = markers[action];
    const claimed = !field || !state[field];
    if (field) state[field] ??= new Date().toISOString();
    if (action === "STEP_SELECTED") state.currentStep = value.tipId;
    if (action === "REWARD_CLAIM") {
      rewardGranted = true;
      rewardEligible = false;
    }
    if (action === "REWARD_PRESENTED") state.completionPresentedAt ??= new Date().toISOString();
    state.revision++;
    await route.fulfill({ json: { pedagogicalState: state, reward: snapshot().reward, claimed } });
  });
  await page.route(/\/api\/times(?:\?|$)/, async (route) => {
    const request = route.request();
    if (request.method() === "GET") return route.fulfill({ json: teams });
    const body = request.postDataJSON();
    posts.push({ url: request.url(), body });
    if (body.name === "Falha simulada")
      return route.fulfill({ status: 400, json: { message: "Falha simulada" } });
    const team = { id: `team-${teams.length + 1}`, ...body, archivedAt: null };
    teams.push(team);
    await route.fulfill({ status: 201, json: team });
  });
  return {
    state,
    teams,
    posts,
    actions,
    completed,
    snapshot,
    setEligible: (value: number) => {
      eligible = value;
    },
    setRewardEligible: (value: boolean) => {
      rewardEligible = value;
    },
  };
}
export async function login(page: Page) {
  if (new URL(page.url()).pathname !== "/admin/login") await page.goto("/admin/login");
  // Choosing the mode proves client hydration before filling controlled fields.
  await page.getByRole("button", { name: "Entrar com senha", exact: true }).click();
  await expect(page.getByTestId("admin-login-password")).toBeVisible();
  await page.getByTestId("admin-login-email").fill("presidente@fixture.invalid");
  await page.getByTestId("admin-login-password").fill("fixture-only-password");
  await expect(page.getByTestId("admin-login-email")).toHaveValue("presidente@fixture.invalid");
  await page.getByTestId("admin-login-submit").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 90_000 });
}
export async function signOut(page: Page) {
  await page.getByRole("button", { name: /Abrir menu do perfil/ }).click();
  await page.getByRole("button", { name: "Sair da conta", exact: true }).click();
  await page.waitForURL(/\/admin\/login(?:\?|$)/, { waitUntil: "load", timeout: 90_000 });
  await expect(page.getByTestId("admin-login-email")).toBeVisible();
}

export async function addTeam(page: Page, name: string) {
  await page.getByRole("button", { name: "Novo Time", exact: true }).first().click();
  const form = page.getByRole("dialog", { name: "Adicionar time", exact: true });
  await form.getByLabel("Nome do time").fill(name);
  await form.getByRole("button", { name: "Adicionar time", exact: true }).click();
  if (name !== "Falha simulada") await expect(form).not.toBeVisible();
}
