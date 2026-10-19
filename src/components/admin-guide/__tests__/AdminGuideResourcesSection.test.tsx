import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuideResourcesSection from "../AdminGuideResourcesSection";
import type { AdminGuideData } from "@/types/admin-guide";

function makeGuide({
  slug = "seu-racha",
  role = "PRESIDENTE",
  sponsors = true,
  sports = true,
  communication = true,
  complete = false,
  viewedResources = [],
}: {
  slug?: string;
  role?: string;
  sponsors?: boolean;
  sports?: boolean;
  communication?: boolean;
  complete?: boolean;
  viewedResources?: string[];
} = {}): AdminGuideData {
  return {
    guideVersion: 1,
    tenant: { id: slug, slug, name: slug },
    administrator: { membershipId: `${slug}-${role}`, role, status: "APROVADO" },
    capabilities: {
      manageSponsors: sponsors,
      manageMatchesAndResults: sports,
      manageCommunication: communication,
    },
    pedagogicalState: {
      revision: 0,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources,
    },
    pedagogicalStateUpdatedAt: null,
    operationalState: {},
    tasks: [],
    activationProgress: {
      completed: complete ? 5 : 1,
      total: 5,
      percentage: complete ? 100 : 20,
      complete,
    },
    nextAction: null,
    laterRecommendations: [
      { id: "SPONSORS", applicable: sponsors, route: "/admin/financeiro/patrocinadores" },
      { id: "RANKINGS", applicable: sports, route: "/admin/rankings" },
      { id: "COMMUNICATION", applicable: communication, route: "/admin/comunicacao" },
    ],
    notices: { identityAuthorization: "", sorteioPublication: "" },
  };
}

const update = jest.fn().mockResolvedValue(true);

beforeEach(() => jest.clearAllMocks());

it("apresenta recursos opcionais com destinos reais sem alterar os cinco marcos", () => {
  const guide = makeGuide({ complete: true });
  const view = render(
    <AdminGuideResourcesSection guide={guide} updating={false} update={update} />
  );
  expect(
    screen.getByRole("heading", { name: "Explore mais recursos do Fut7Pro" })
  ).toBeInTheDocument();
  expect(screen.getByText(/recursos são opcionais e não alteram o progresso/)).toBeInTheDocument();
  expect(screen.getByText(/já concluiu os primeiros passos/)).toBeInTheDocument();
  expect(guide.activationProgress).toEqual({
    completed: 5,
    total: 5,
    percentage: 100,
    complete: true,
  });
  expect(screen.getByRole("link", { name: "Gerenciar patrocinadores" })).toHaveAttribute(
    "href",
    "/admin/financeiro/patrocinadores"
  );
  expect(screen.getByRole("link", { name: "Ver Ranking de Assiduidade" })).toHaveAttribute(
    "href",
    "/admin/jogadores/ranking-assiduidade"
  );
  expect(screen.getByRole("link", { name: "Ver Ranking Campeões do Dia" })).toHaveAttribute(
    "href",
    "/admin/jogadores/ranking-campeoes-do-dia"
  );
  expect(screen.getByRole("link", { name: "Gerenciar comunicados" })).toHaveAttribute(
    "href",
    "/admin/comunicacao/comunicados"
  );
  expect(screen.getByRole("link", { name: "Conhecer enquetes" })).toHaveAttribute(
    "href",
    "/admin/comunicacao/enquetes"
  );
  expect(screen.getByRole("link", { name: "Conhecer Conquistas" })).toHaveAttribute(
    "href",
    "/admin/conquistas"
  );
  expect(screen.queryByRole("link", { name: /editar conquistas/i })).not.toBeInTheDocument();
  expect(view.container.querySelector('a[href="/admin/rankings"]')).not.toBeInTheDocument();
  expect(view.container.querySelector('a[href="/admin/comunicacao"]')).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
});

it("isola estatísticas públicas na pelada ativa e omite o link quando o slug é inválido", () => {
  const view = render(
    <AdminGuideResourcesSection guide={makeGuide()} updating={false} update={update} />
  );
  expect(screen.getByRole("link", { name: /Ver estatísticas do grupo/ })).toHaveAttribute(
    "href",
    "/seu-racha/estatisticas"
  );
  view.rerender(
    <AdminGuideResourcesSection
      guide={makeGuide({ slug: "outra-pelada" })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: /Ver estatísticas do grupo/ })).toHaveAttribute(
    "href",
    "/outra-pelada/estatisticas"
  );
  view.rerender(
    <AdminGuideResourcesSection
      guide={makeGuide({ slug: "admin" })}
      updating={false}
      update={update}
    />
  );
  expect(screen.queryByRole("link", { name: /Ver estatísticas do grupo/ })).not.toBeInTheDocument();
});

it("mantém a explicação sem ações proibidas para Diretor Financeiro", () => {
  render(
    <AdminGuideResourcesSection
      guide={makeGuide({ role: "DIRETOR_FINANCEIRO", sports: false, communication: false })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: "Gerenciar patrocinadores" })).toBeInTheDocument();
  expect(screen.getByText("Acompanhe os rankings do grupo")).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Ver Ranking de Assiduidade" })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Conhecer Conquistas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar comunicados" })).not.toBeInTheDocument();
});

it("não oferece ação financeira ao Diretor de Futebol nem confia em recomendações não aplicáveis", () => {
  const guide = makeGuide({ role: "DIRETOR_FUTEBOL", sponsors: false, communication: false });
  guide.laterRecommendations[0].applicable = true;
  guide.laterRecommendations[2].route = "https://externo.test";
  render(<AdminGuideResourcesSection guide={guide} updating={false} update={update} />);
  expect(screen.queryByRole("link", { name: "Gerenciar patrocinadores" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ver Ranking de Assiduidade" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar comunicados" })).not.toBeInTheDocument();
});

it("não navega por rotas genéricas, externas ou recomendações não aplicáveis", () => {
  const guide = makeGuide();
  guide.laterRecommendations = [
    { id: "SPONSORS", applicable: false, route: "/admin/financeiro/patrocinadores" },
    { id: "RANKINGS", applicable: true, route: "https://externo.test" },
    { id: "COMMUNICATION", applicable: true, route: "/admin/comunicacao/rota-inexistente" },
  ];
  render(<AdminGuideResourcesSection guide={guide} updating={false} update={update} />);
  expect(screen.queryByRole("link", { name: "Gerenciar patrocinadores" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Ver Ranking de Assiduidade" })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar comunicados" })).not.toBeInTheDocument();
  expect(screen.getByText("Acompanhe os rankings do grupo")).toBeInTheDocument();
});

it("registra vídeos somente após clique, sem impedir a abertura por falha no PATCH", () => {
  update.mockResolvedValueOnce(false);
  const view = render(
    <AdminGuideResourcesSection guide={makeGuide()} updating={false} update={update} />
  );
  const videos = screen.getAllByRole("link", { name: "Assistir tutorial (YouTube, nova aba)" });
  expect(videos).toHaveLength(2);
  expect(videos[0]).toHaveAttribute("href", "https://youtu.be/3uQGCjk19Uk");
  expect(videos[1]).toHaveAttribute("href", "https://youtu.be/q5gSuNLZso4");
  for (const link of videos) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(view.container.querySelector("iframe, video, audio")).not.toBeInTheDocument();
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(videos[0]);
  expect(update).toHaveBeenCalledWith({
    action: "RESOURCE_VIEWED",
    resourceId: "VIDEO_SORTEIO_INTELIGENTE",
  });
  expect(videos[0]).toHaveAttribute("href", "https://youtu.be/3uQGCjk19Uk");
  expect(screen.queryByText("Material já acessado")).not.toBeInTheDocument();
});

it("mostra apenas acessos confirmados e evita PATCH duplicado", () => {
  render(
    <AdminGuideResourcesSection
      guide={makeGuide({ viewedResources: ["VIDEO_PATROCINADORES"] })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getAllByText("Material já acessado")).toHaveLength(1);
  fireEvent.click(
    screen.getAllByRole("link", { name: "Assistir tutorial (YouTube, nova aba)" })[1]
  );
  expect(update).not.toHaveBeenCalled();
});
