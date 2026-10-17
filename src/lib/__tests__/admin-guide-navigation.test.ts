import { guideDestination, nextGuideDestination } from "../admin-guide-navigation";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const task: AdminGuideTask = {
  id: "PUBLIC_SITE",
  title: "Conheça o site da sua pelada",
  requirement: "OPTIONAL",
  completed: false,
  canAct: true,
  applicable: true,
  route: "/",
};

const guide = {
  tenant: { id: "tenant-1", slug: "seu-racha", name: "Seu Racha" },
  tasks: [task],
  nextAction: { taskId: task.id, title: task.title, route: task.route },
} as AdminGuideData;

it("resolve o site público da pelada ativa", () => {
  expect(guideDestination(guide, task)).toBe("/seu-racha");
  expect(nextGuideDestination(guide)).toBe("/seu-racha");
});

it("recusa links arbitrários ou ações sem permissão", () => {
  expect(guideDestination(guide, { ...task, route: "https://outro.site" })).toBeNull();
  expect(guideDestination(guide, { ...task, canAct: false })).toBeNull();
  expect(
    nextGuideDestination({ ...guide, nextAction: { ...guide.nextAction!, route: "//outro.site" } })
  ).toBeNull();
});

it("direciona a configuração da agenda à página editável em todos os acessos", () => {
  const schedule = {
    ...task,
    id: "SCHEDULE",
    route: "/admin/partidas/proximos-rachas",
  };
  const scheduleGuide = {
    ...guide,
    tasks: [schedule],
    nextAction: { taskId: schedule.id, title: schedule.title, route: schedule.route },
  };
  expect(guideDestination(scheduleGuide, schedule)).toBe("/admin/rachas");
  expect(nextGuideDestination(scheduleGuide)).toBe("/admin/rachas");
  expect(guideDestination(scheduleGuide, { ...schedule, canAct: false })).toBeNull();
  expect(guideDestination(scheduleGuide, { ...schedule, applicable: false })).toBeNull();
  expect(guideDestination(scheduleGuide, { ...schedule, route: "https://outro.site" })).toBeNull();
  expect(
    nextGuideDestination({
      ...scheduleGuide,
      nextAction: { ...scheduleGuide.nextAction, route: "https://outro.site" },
    })
  ).toBeNull();
});

it("usa a modalidade escolhida para a primeira partida, sem liberar rotas inseguras", () => {
  const match: AdminGuideTask = {
    ...task,
    id: "FIRST_MATCHDAY",
    route: "/admin/partidas/criar",
  };
  const matchGuide = {
    ...guide,
    capabilities: { manageMatchesAndResults: true },
    pedagogicalState: {
      revision: 0,
      firstMatchMode: "INTELLIGENT_DRAW" as const,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    },
    tasks: [match],
    nextAction: { taskId: match.id, title: match.title, route: match.route },
  } as AdminGuideData;
  expect(nextGuideDestination(matchGuide)).toBe("/admin/partidas/sorteio-inteligente");
  expect(
    nextGuideDestination({
      ...matchGuide,
      pedagogicalState: { ...matchGuide.pedagogicalState, firstMatchMode: "CLASSIC_MATCH" },
    })
  ).toBe("/admin/partidas/criar/classica");
  expect(
    nextGuideDestination({
      ...matchGuide,
      pedagogicalState: { ...matchGuide.pedagogicalState, firstMatchMode: undefined },
    })
  ).toBe("/admin/partidas/criar");
  expect(guideDestination(matchGuide, { ...match, canAct: false })).toBeNull();
  expect(guideDestination(matchGuide, { ...match, applicable: false })).toBeNull();
  expect(guideDestination(matchGuide, { ...match, route: "https://outro.site" })).toBeNull();
  expect(
    guideDestination({ ...matchGuide, capabilities: { manageMatchesAndResults: false } }, match)
  ).toBeNull();
});

it("exige capacidades esportivas para resultados e publicação, inclusive no próximo passo", () => {
  const results: AdminGuideTask = {
    ...task,
    id: "RESULTS_RECORDED",
    route: "/admin/partidas/resultados-do-dia",
  };
  const champion: AdminGuideTask = {
    ...task,
    id: "CHAMPION_PUBLISHED",
    route: "/admin/partidas/time-campeao-do-dia",
  };
  const restricted = {
    ...guide,
    tasks: [results, champion],
    capabilities: { manageMatchesAndResults: false, publishChampion: false },
    nextAction: { taskId: results.id, title: results.title, route: results.route },
  } as AdminGuideData;
  expect(nextGuideDestination(restricted)).toBeNull();
  expect(guideDestination(restricted, champion)).toBeNull();
  expect(
    guideDestination({ ...restricted, capabilities: { manageMatchesAndResults: true } }, results)
  ).toBe("/admin/partidas/resultados-do-dia");
  expect(
    guideDestination({ ...restricted, capabilities: { publishChampion: true } }, champion)
  ).toBe("/admin/partidas/time-campeao-do-dia");
  expect(guideDestination(restricted, { ...results, route: "https://externo.test" })).toBeNull();
  expect(
    guideDestination(
      { ...restricted, capabilities: { manageMatchesAndResults: true } },
      { ...results, route: "/admin/financeiro/patrocinadores" }
    )
  ).toBeNull();
});
