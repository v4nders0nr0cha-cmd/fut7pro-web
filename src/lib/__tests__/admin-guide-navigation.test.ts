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
