export function resolvePublicPageSeo(
  canonicalPath: string,
  tenantName: string
): { title: string; description: string; noindex?: boolean } {
  const segments = canonicalPath.split("/").filter(Boolean);
  const path = `/${segments.slice(1).join("/")}`;

  const routeSeo: Record<string, { title: string; description: string; noindex?: boolean }> = {
    "/": {
      title: `${tenantName} | Futebol entre amigos no Fut7Pro`,
      description: `Acompanhe partidas, atletas, rankings, campeões e comunicados do grupo ${tenantName} no Fut7Pro.`,
    },
    "/atletas": {
      title: `Atletas do grupo ${tenantName} | Fut7Pro`,
      description: `Veja os atletas do grupo ${tenantName}, seus perfis, estatísticas, histórico e conquistas.`,
    },
    "/partidas": {
      title: `Partidas do grupo ${tenantName} | Fut7Pro`,
      description: `Confira partidas recentes, resultados, Times do Dia e histórico de jogos do grupo ${tenantName}.`,
    },
    "/partidas/historico": {
      title: `Histórico de partidas | ${tenantName} | Fut7Pro`,
      description: `Consulte o histórico de partidas e placares do grupo ${tenantName}.`,
    },
    "/partidas/times-do-dia": {
      title: `Times do Dia | ${tenantName} | Fut7Pro`,
      description: `Veja os Times do Dia da rodada do grupo ${tenantName} no Fut7Pro.`,
    },
    "/estatisticas": {
      title: `Estatísticas | ${tenantName} | Fut7Pro`,
      description: `Acompanhe rankings, artilheiros, assistências e classificação dos times do grupo ${tenantName}.`,
    },
    "/estatisticas/ranking-geral": {
      title: `Ranking geral | ${tenantName} | Fut7Pro`,
      description: `Veja a classificação geral dos atletas do grupo ${tenantName}, com pontuação e desempenho acumulado.`,
    },
    "/estatisticas/artilheiros": {
      title: `Artilheiros | ${tenantName} | Fut7Pro`,
      description: `Confira os maiores goleadores do grupo ${tenantName} no ranking de artilharia.`,
    },
    "/estatisticas/assistencias": {
      title: `Assistências | ${tenantName} | Fut7Pro`,
      description: `Veja os atletas com mais assistências registradas no grupo ${tenantName}.`,
    },
    "/estatisticas/classificacao-dos-times": {
      title: `Classificação dos times | ${tenantName} | Fut7Pro`,
      description: `Acompanhe a classificação dos times, vitórias e desempenho coletivo do grupo ${tenantName}.`,
    },
    "/estatisticas/melhores-por-posicao": {
      title: `Melhores por posição | ${tenantName} | Fut7Pro`,
      description: `Compare goleiros, zagueiros, meias e atacantes do grupo ${tenantName} por desempenho.`,
    },
    "/estatisticas/tira-teima": {
      title: `Tira-teima | ${tenantName} | Fut7Pro`,
      description: `Compare atletas do grupo ${tenantName} lado a lado com estatísticas e histórico.`,
    },
    "/os-campeoes": {
      title: `Campeões | ${tenantName} | Fut7Pro`,
      description: `Veja os campeões, títulos e conquistas do grupo ${tenantName}.`,
    },
    "/grandes-torneios": {
      title: `Grandes torneios | ${tenantName} | Fut7Pro`,
      description: `Acompanhe torneios especiais, campeões e momentos marcantes do grupo ${tenantName}.`,
    },
    "/sobre-nos": {
      title: `Sobre o grupo ${tenantName} | Fut7Pro`,
      description: `Conheça a história, as regras, os contatos e os parceiros do grupo ${tenantName}.`,
    },
    "/sobre-nos/nossa-historia": {
      title: `Nossa história | ${tenantName} | Fut7Pro`,
      description: `Conheça a trajetória, as lembranças e os momentos marcantes do grupo ${tenantName}.`,
    },
    "/sobre-nos/nossos-parceiros": {
      title: `Parceiros | ${tenantName} | Fut7Pro`,
      description: `Conheça os patrocinadores, parceiros e apoiadores do grupo ${tenantName}.`,
    },
    "/sobre-nos/prestacao-de-contas": {
      title: `Prestação de contas | ${tenantName} | Fut7Pro`,
      description: `Veja as informações financeiras compartilhadas pelo grupo ${tenantName}.`,
    },
    "/comunicacao": {
      title: `Comunicação | ${tenantName} | Fut7Pro`,
      description: `Acesse comunicados, enquetes e canais de contato do grupo ${tenantName}.`,
    },
    "/comunicacao/comunicados": {
      title: `Comunicados | ${tenantName} | Fut7Pro`,
      description: `Leia os comunicados publicados pela administração do grupo ${tenantName}.`,
    },
    "/comunicacao/enquetes": {
      title: `Enquetes | ${tenantName} | Fut7Pro`,
      description: `Acompanhe as enquetes do grupo ${tenantName} no Fut7Pro.`,
    },
    "/sorteio-inteligente": {
      title: `Sorteio Inteligente | ${tenantName} | Fut7Pro`,
      description: `Entenda como o grupo ${tenantName} usa o Sorteio Inteligente para formar times.`,
    },
    "/contato": {
      title: `Contato | ${tenantName} | Fut7Pro`,
      description: `Veja os canais de contato do grupo ${tenantName}.`,
    },
    "/entrar": {
      title: `Entrar | ${tenantName} | Fut7Pro`,
      description: `Área de acesso dos atletas e administradores do grupo ${tenantName}.`,
      noindex: true,
    },
    "/login": {
      title: `Login | ${tenantName} | Fut7Pro`,
      description: `Área de login dos atletas e administradores do grupo ${tenantName}.`,
      noindex: true,
    },
    "/register": {
      title: `Cadastro | ${tenantName} | Fut7Pro`,
      description: `Solicite acesso ou crie sua conta para participar do grupo ${tenantName}.`,
      noindex: true,
    },
    "/esqueci-senha": {
      title: `Recuperar senha | ${tenantName} | Fut7Pro`,
      description: `Recupere o acesso à sua conta no grupo ${tenantName}.`,
      noindex: true,
    },
    "/resetar-senha": {
      title: `Redefinir senha | ${tenantName} | Fut7Pro`,
      description: `Redefina a senha da sua conta no grupo ${tenantName}.`,
      noindex: true,
    },
  };

  if (routeSeo[path]) return routeSeo[path];

  const readable = segments
    .slice(1)
    .filter((segment) => !/^[0-9a-f-]{8,}$/i.test(segment))
    .map((segment) => segment.replace(/-/g, " "))
    .join(" - ");

  return {
    title: readable ? `${readable} | ${tenantName} | Fut7Pro` : `${tenantName} | Fut7Pro`,
    description: readable
      ? `Página ${readable} do grupo ${tenantName} no Fut7Pro.`
      : `Acompanhe o grupo ${tenantName} no Fut7Pro.`,
  };
}
