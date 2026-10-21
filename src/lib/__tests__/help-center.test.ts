import { readFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_HELP_CENTER_CONFIG, DEFAULT_HELP_CENTER_TOPICS } from "../help-center-defaults";
import { normalizeHelpCenterConfig, topicMatchesSearch } from "../help-center";

const expectedIds = [
  "primeiros-passos-acesso",
  "dashboard-visao-geral",
  "partidas-dias-horarios",
  "partidas-criar-resultado",
  "partidas-sorteio-inteligente",
  "partidas-times-do-dia",
  "jogadores-cadastro",
  "jogadores-solicitacoes",
  "jogadores-mensalistas",
  "conquistas-os-campeoes",
  "conquistas-grandes-torneios",
  "financeiro-prestacao-de-contas",
  "financeiro-patrocinadores",
  "personalizacao-identidade",
  "personalizacao-paginas",
  "personalizacao-footer-redes",
  "administracao-administradores",
  "administracao-logs",
  "administracao-transferencia",
  "comunicacao-comunicados",
  "comunicacao-enquetes",
  "comunicacao-sugestoes",
  "comunicacao-notificacoes",
  "comunicacao-mensagens",
  "comunicacao-suporte",
  "configuracoes-assinatura",
  "configuracoes-seguranca",
  "boas-praticas-operacao-diaria",
  "boas-praticas-erros-comuns",
  "boas-praticas-suporte-eficiente",
  "faq-recuperacao-acesso",
  "faq-dados-nao-atualizam",
  "faq-quem-ve-o-que",
];

describe("Central de Ajuda administrativa", () => {
  it("preserva os 33 IDs, a ordem, as categorias e os destaques dos tópicos padrão", () => {
    expect(DEFAULT_HELP_CENTER_TOPICS.map((topic) => topic.id)).toEqual(expectedIds);
    expect(new Set(expectedIds).size).toBe(expectedIds.length);
    expect(DEFAULT_HELP_CENTER_TOPICS.map((topic) => topic.ordem)).toEqual([
      1, 2, 10, 11, 12, 13, 20, 21, 22, 30, 31, 40, 41, 50, 51, 52, 60, 61, 62, 70, 71, 72, 73, 74,
      75, 80, 81, 90, 91, 92, 100, 101, 102,
    ]);
    expect(DEFAULT_HELP_CENTER_TOPICS.map((topic) => topic.categoria)).toEqual([
      ...Array(1).fill("Primeiros passos"),
      ...Array(1).fill("Dashboard"),
      ...Array(4).fill("Partidas"),
      ...Array(3).fill("Jogadores"),
      ...Array(2).fill("Conquistas"),
      ...Array(2).fill("Financeiro"),
      ...Array(3).fill("Personalização"),
      ...Array(3).fill("Administração"),
      ...Array(6).fill("Comunicação"),
      ...Array(2).fill("Configurações e plano"),
      ...Array(3).fill("Boas práticas"),
      ...Array(3).fill("Dúvidas frequentes"),
    ]);
    expect(
      DEFAULT_HELP_CENTER_TOPICS.filter((topic) => topic.destaque).map((topic) => topic.id)
    ).toEqual([
      "primeiros-passos-acesso",
      "dashboard-visao-geral",
      "partidas-dias-horarios",
      "partidas-criar-resultado",
      "partidas-sorteio-inteligente",
      "partidas-times-do-dia",
      "jogadores-cadastro",
      "jogadores-solicitacoes",
      "jogadores-mensalistas",
      "conquistas-os-campeoes",
      "financeiro-prestacao-de-contas",
      "financeiro-patrocinadores",
      "personalizacao-identidade",
      "administracao-administradores",
      "administracao-logs",
      "comunicacao-comunicados",
      "comunicacao-enquetes",
      "comunicacao-sugestoes",
      "comunicacao-notificacoes",
      "comunicacao-suporte",
      "configuracoes-assinatura",
      "boas-praticas-operacao-diaria",
      "faq-recuperacao-acesso",
      "faq-dados-nao-atualizam",
    ]);
  });

  it("documenta somente ações financeiras e de suporte disponíveis aos administradores", () => {
    const getTopic = (id: string) => DEFAULT_HELP_CENTER_TOPICS.find((topic) => topic.id === id);
    const accounts = getTopic("financeiro-prestacao-de-contas");
    const sponsors = getTopic("financeiro-patrocinadores");
    const routine = getTopic("boas-praticas-operacao-diaria");
    const support = getTopic("boas-praticas-suporte-eficiente");

    expect(accounts?.conteudo).toContain("Use os filtros para conferir receitas e despesas");
    expect(accounts?.conteudo).not.toMatch(/exporta|PDF|CSV/i);
    expect(routine?.conteudo).toContain("conferir receitas, despesas");
    expect(routine?.conteudo).not.toMatch(/exporta|PDF|CSV/i);
    expect(sponsors?.conteudo).toContain("link para o patrocinador");
    expect(sponsors?.conteudo).toContain("situação e as informações de pagamento");
    expect(sponsors?.conteudo).not.toMatch(/UTM|mídia vinculada|entregas|rastreamento/i);
    expect(support?.conteudo).toContain("encaminhe sugestões de melhoria ao suporte");
    expect(support?.conteudo).not.toMatch(/atualize a Central de Ajuda|edite a Central de Ajuda/i);
    expect(support?.titulo).toBe("Como evitar problemas comuns e agilizar o suporte");
    expect(routine?.titulo).toBe("Checklist para organizar a rotina do grupo");
  });

  it("mantém orientações de navegação alinhadas ao menu e à tela de agenda", () => {
    const sidebar = readFileSync(
      path.join(process.cwd(), "src/app/(admin)/admin/Sidebar.tsx"),
      "utf8"
    );
    const agenda = readFileSync(
      path.join(process.cwd(), "src/app/(admin)/admin/partidas/proximos-rachas/page.tsx"),
      "utf8"
    );
    expect(sidebar).toContain('label: "Dias e Horários", href: "/admin/partidas/proximos-rachas"');
    expect(agenda).toContain('href="/admin/rachas"');
    const schedule = DEFAULT_HELP_CENTER_TOPICS.find(
      (topic) => topic.id === "partidas-dias-horarios"
    );
    expect(schedule?.conteudo).toContain("Partidas > Dias e Horários");
    expect(schedule?.conteudo).not.toContain("Próximos Rachas");
    const matches = DEFAULT_HELP_CENTER_TOPICS.find(
      (topic) => topic.id === "partidas-criar-resultado"
    );
    expect(matches?.conteudo).toContain("pelo menos dois times oficiais ativos");
    expect(matches?.conteudo).toContain("Esse cadastro é obrigatório");
    expect(sidebar).toContain('label: "Gerenciar Times"');
    expect(sidebar).toContain('label: "Criar Partidas"');
    expect(sidebar).toContain('label: "Partidas e Resultados"');
    expect(sidebar).toContain('label: "Gestão de Mensalistas"');
    expect(sidebar).toContain('label: "Cobrança de Mensalistas"');
    expect(sidebar).toContain('label: "Páginas do Sobre Nós"');
    expect(sidebar).toContain('label: "Planos & Limites"');
    const subscription = DEFAULT_HELP_CENTER_TOPICS.find(
      (topic) => topic.id === "configuracoes-assinatura"
    );
    expect(subscription?.conteudo).toContain("Financeiro > Planos & Limites");
  });

  it("usa o fallback apenas quando não há tópicos utilizáveis", () => {
    const empty = normalizeHelpCenterConfig({ topics: [], videos: [] });
    expect(empty.topics).toEqual(DEFAULT_HELP_CENTER_TOPICS);
    expect(empty.videos).toEqual(DEFAULT_HELP_CENTER_CONFIG.videos);
    expect(
      normalizeHelpCenterConfig({ topics: [] }, { applyFallbackWhenEmpty: false }).topics
    ).toEqual([]);
  });

  it("preserva tópicos, vídeos, canal e destaques personalizados sem alterar a origem", () => {
    const topic = {
      id: "customizado",
      categoria: "Minha categoria",
      titulo: "História do meu grupo",
      conteudo: "Texto salvo pelo responsável",
      destaque: true,
      ordem: 7,
      tags: ["meu grupo"],
    };
    const video = {
      id: "video-customizado",
      titulo: "Vídeo do grupo",
      url: "https://www.youtube.com/watch?v=abcDEF12345",
      ordem: 1,
    };
    const source = {
      youtubeChannelUrl: "https://www.youtube.com/@MeuGrupo",
      youtubeChannelLabel: "Canal do meu grupo",
      showVideos: true,
      topics: [topic],
      videos: [video],
    };
    const original = JSON.parse(JSON.stringify(source));
    const normalized = normalizeHelpCenterConfig(source);

    expect(normalized.topics).toEqual([topic]);
    expect(normalized.videos).toEqual([
      { ...video, url: "https://www.youtube.com/embed/abcDEF12345", publishedAt: "" },
    ]);
    expect(normalized.youtubeChannelUrl).toBe(source.youtubeChannelUrl);
    expect(normalized.youtubeChannelLabel).toBe(source.youtubeChannelLabel);
    expect(normalized.showVideos).toBe(true);
    expect(normalized.topics.filter((item) => item.destaque).map((item) => item.id)).toEqual([
      "customizado",
    ]);
    expect(topicMatchesSearch(normalized.topics[0], "meu grupo")).toBe(true);
    expect(topicMatchesSearch(normalized.topics[0], "sem resultado")).toBe(false);
    expect(source).toEqual(original);
  });
});
