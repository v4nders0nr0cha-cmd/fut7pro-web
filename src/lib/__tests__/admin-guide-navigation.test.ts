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
