import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const ALLOWED_ADMIN_ROUTES = new Set([
  "/admin/personalizacao/identidade-visual",
  "/admin/partidas/proximos-rachas",
  "/admin/jogadores/listar-cadastrar",
  "/admin/partidas/criar-times",
  "/admin/jogadores/nivel-dos-atletas",
  "/admin/jogadores/mensalistas",
  "/admin/partidas/criar",
  "/admin/partidas/resultados-do-dia",
  "/admin/partidas/time-campeao-do-dia",
  "/admin/financeiro/patrocinadores",
]);

export function guideDestination(guide: AdminGuideData, task: AdminGuideTask): string | null {
  if (!task.applicable || !task.canAct) return null;
  if (task.id === "PUBLIC_SITE" && task.route === "/") {
    const slug = guide.tenant.slug;
    return /^[a-z0-9][a-z0-9-]*$/i.test(slug) ? `/${encodeURIComponent(slug)}` : null;
  }
  if (task.id === "SCHEDULE") {
    return task.route === "/admin/partidas/proximos-rachas" ? "/admin/rachas" : null;
  }
  if (task.id === "FIRST_MATCHDAY") {
    if (task.route !== "/admin/partidas/criar" || !guide.capabilities.manageMatchesAndResults)
      return null;
    if (guide.pedagogicalState.firstMatchMode === "INTELLIGENT_DRAW")
      return "/admin/partidas/sorteio-inteligente";
    if (guide.pedagogicalState.firstMatchMode === "CLASSIC_MATCH")
      return "/admin/partidas/criar/classica";
    return "/admin/partidas/criar";
  }
  if (task.id === "RESULTS_RECORDED" || task.id === "MATCHES_FINISHED")
    return guide.capabilities.manageMatchesAndResults &&
      task.route === "/admin/partidas/resultados-do-dia"
      ? task.route
      : null;
  if (task.id === "CHAMPION_PUBLISHED")
    return guide.capabilities.publishChampion &&
      task.route === "/admin/partidas/time-campeao-do-dia"
      ? task.route
      : null;
  return ALLOWED_ADMIN_ROUTES.has(task.route) ? task.route : null;
}

export function nextGuideDestination(guide: AdminGuideData): string | null {
  const next = guide.nextAction;
  if (!next) return null;
  const task = guide.tasks.find((item) => item.id === next.taskId && item.route === next.route);
  return task ? guideDestination(guide, task) : null;
}
