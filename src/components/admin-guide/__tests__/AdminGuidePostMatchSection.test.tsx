import { render, screen } from "@testing-library/react";
import AdminGuidePostMatchSection from "../AdminGuidePostMatchSection";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const tasks: AdminGuideTask[] = [
  {
    id: "FIRST_MATCHDAY",
    title: "Prepare o primeiro jogo",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/criar",
  },
  {
    id: "RESULTS_RECORDED",
    title: "Registre os resultados",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/resultados-do-dia",
  },
  {
    id: "MATCHES_FINISHED",
    title: "Finalize oficialmente as partidas",
    requirement: "RECOMMENDED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/resultados-do-dia",
  },
  {
    id: "CHAMPION_PUBLISHED",
    title: "Publique o Time Campeão do Dia",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/time-campeao-do-dia",
  },
];

function makeGuide({
  matches = 0,
  results = false,
  finished = false,
  champion = false,
  review = false,
  canManage = true,
  canPublish = true,
  slug = "seu-racha",
}: {
  matches?: number;
  results?: boolean;
  finished?: boolean;
  champion?: boolean;
  review?: boolean;
  canManage?: boolean;
  canPublish?: boolean;
  slug?: string;
} = {}): AdminGuideData {
  return {
    guideVersion: 1,
    tenant: { id: slug, slug, name: slug },
    administrator: {
      membershipId: slug,
      role: canManage ? "PRESIDENTE" : "DIRETOR_FINANCEIRO",
      status: "APROVADO",
    },
    capabilities: { manageMatchesAndResults: canManage, publishChampion: canPublish },
    pedagogicalState: {
      revision: 0,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    },
    pedagogicalStateUpdatedAt: null,
    operationalState: {
      validMatchCount: matches,
      hasMatchdayWithAllResults: results,
      hasOfficiallyFinishedMatchday: finished,
      championPublished: champion,
      championAwaitingReview: review,
    },
    tasks: tasks.map((task) => ({
      ...task,
      completed:
        task.id === "FIRST_MATCHDAY"
          ? matches > 0
          : task.id === "RESULTS_RECORDED"
            ? results
            : task.id === "MATCHES_FINISHED"
              ? finished
              : champion,
      canAct: task.id === "CHAMPION_PUBLISHED" ? canPublish : canManage,
    })),
    activationProgress: {
      completed: champion ? 5 : 3,
      total: 5,
      percentage: champion ? 100 : 60,
      complete: champion,
    },
    nextAction: null,
    laterRecommendations: [],
    notices: { identityAuthorization: "", sorteioPublication: "" },
  };
}

it("orienta primeiro a criar uma partida quando não há jogos persistidos", () => {
  render(<AdminGuidePostMatchSection guide={makeGuide()} />);
  expect(screen.getByRole("heading", { name: "Depois do jogo" })).toBeInTheDocument();
  expect(screen.getByText(/precisa criar uma partida antes de registrar/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Preparar primeiro jogo" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar"
  );
  expect(screen.getByText(/O Histórico ficará mais útil/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Ver Histórico" })).not.toBeInTheDocument();
});

it("orienta resultados pendentes e usa o Histórico administrativo real", () => {
  render(<AdminGuidePostMatchSection guide={makeGuide({ matches: 2 })} />);
  expect(screen.getByText(/Acesse Resultados do Dia para preencher/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Abrir Resultados do Dia" })).toHaveAttribute(
    "href",
    "/admin/partidas/resultados-do-dia"
  );
  expect(screen.getByRole("link", { name: "Ver Histórico" })).toHaveAttribute(
    "href",
    "/admin/partidas/historico"
  );
  expect(screen.getByText(/Consultar o Histórico não é obrigatório/)).toBeInTheDocument();
});

it("reconhece resultados completos, inclusive placar zero a zero, sem exigir finalização", () => {
  render(<AdminGuidePostMatchSection guide={makeGuide({ matches: 2, results: true })} />);
  expect(screen.getByText(/todos os placares de pelo menos uma data/)).toBeInTheDocument();
  expect(screen.getByText(/Um placar de 0 × 0 também é um resultado/)).toBeInTheDocument();
  expect(screen.getByText(/finalização oficial é recomendada, mas não impede/)).toBeInTheDocument();
  expect(screen.getByText(/Os resultados já foram registrados/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Gerenciar Campeão do Dia" })).toHaveAttribute(
    "href",
    "/admin/partidas/time-campeao-do-dia"
  );
});

it("reconhece a finalização oficial como recomendação independente", () => {
  render(
    <AdminGuidePostMatchSection guide={makeGuide({ matches: 2, results: true, finished: true })} />
  );
  expect(screen.getByText(/partidas oficialmente finalizadas/)).toBeInTheDocument();
  expect(screen.getByText(/Recomendado · Você já possui/)).toBeInTheDocument();
});

it("reconhece um ciclo válido antigo mesmo com revisão pendente de outra publicação", () => {
  render(
    <AdminGuidePostMatchSection
      guide={makeGuide({ matches: 4, results: true, champion: true, review: true })}
    />
  );
  expect(screen.getByText(/já possui um Time Campeão do Dia publicado/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Revise o Campeão do Dia" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Revisar Campeão do Dia" })).toHaveAttribute(
    "href",
    "/admin/partidas/time-campeao-do-dia"
  );
});

it("não declara um campeão desatualizado como publicado quando não há ciclo válido", () => {
  render(
    <AdminGuidePostMatchSection guide={makeGuide({ matches: 2, results: true, review: true })} />
  );
  expect(screen.getByRole("heading", { name: "Revise o Campeão do Dia" })).toBeInTheDocument();
  expect(screen.queryByText(/já possui um Time Campeão do Dia publicado/)).not.toBeInTheDocument();
});

it("mantém o progresso compartilhado sem links de edição para cargo sem capacidade", () => {
  render(
    <AdminGuidePostMatchSection
      guide={makeGuide({
        matches: 3,
        results: true,
        champion: true,
        review: true,
        canManage: false,
        canPublish: false,
      })}
    />
  );
  expect(screen.getByText(/todos os placares de pelo menos uma data/)).toBeInTheDocument();
  expect(screen.getByText(/já possui um Time Campeão do Dia publicado/)).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("respeita separadamente a capacidade de publicar campeão", () => {
  render(
    <AdminGuidePostMatchSection
      guide={makeGuide({ matches: 2, results: true, canPublish: false })}
    />
  );
  expect(screen.getByRole("link", { name: "Abrir Resultados do Dia" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar Campeão do Dia" })).not.toBeInTheDocument();
});

it("ignora rotas inseguras e aplica o estado da pelada atual após a troca", () => {
  const first = makeGuide({ matches: 2, results: true, slug: "pelada-a" });
  first.tasks = first.tasks.map((task) =>
    task.id === "RESULTS_RECORDED" ? { ...task, route: "https://externo.test" } : task
  );
  const view = render(<AdminGuidePostMatchSection guide={first} />);
  expect(screen.queryByRole("link", { name: "Abrir Resultados do Dia" })).not.toBeInTheDocument();
  view.rerender(<AdminGuidePostMatchSection guide={makeGuide({ slug: "pelada-b" })} />);
  expect(screen.getByText(/precisa criar uma partida antes de registrar/)).toBeInTheDocument();
  expect(screen.queryByText(/todos os placares de pelo menos uma data/)).not.toBeInTheDocument();
});
