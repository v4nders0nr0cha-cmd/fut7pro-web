export function resolvePublicPageSeo(
  canonicalPath: string,
  tenantName: string
): { title: string; description: string; noindex?: boolean } {
  const segments = canonicalPath.split("/").filter(Boolean);
  const path = `/${segments.slice(1).join("/")}`;

  const routeSeo: Record<string, { title: string; description: string; noindex?: boolean }> = {
    "/": {
      title: `${tenantName} | Futebol entre amigos no Fut7Pro`,
      description: `${tenantName}: acompanhe partidas, atletas, rankings, campeões e comunicados no Fut7Pro.`,
    },
    "/atletas": {
      title: `Atletas | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: conheça os atletas, seus perfis, estatísticas, histórico e conquistas.`,
    },
    "/partidas": {
      title: `Partidas | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: confira partidas recentes, resultados, Times do Dia e histórico de jogos.`,
    },
    "/partidas/historico": {
      title: `Histórico de partidas | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: consulte o histórico de partidas e placares.`,
    },
    "/partidas/times-do-dia": {
      title: `Times do Dia | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja os Times do Dia e os confrontos da rodada no Fut7Pro.`,
    },
    "/estatisticas": {
      title: `Estatísticas | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: acompanhe rankings, artilheiros, assistências e classificação dos times.`,
    },
    "/estatisticas/ranking-geral": {
      title: `Ranking geral | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja a classificação geral dos atletas, com pontuação e desempenho acumulado.`,
    },
    "/estatisticas/artilheiros": {
      title: `Artilheiros | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: confira os maiores goleadores no ranking de artilharia.`,
    },
    "/estatisticas/assistencias": {
      title: `Assistências | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja os atletas com mais assistências registradas.`,
    },
    "/estatisticas/classificacao-dos-times": {
      title: `Classificação dos times | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: acompanhe a classificação dos times, vitórias e desempenho coletivo.`,
    },
    "/estatisticas/melhores-por-posicao": {
      title: `Melhores por posição | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: compare goleiros, zagueiros, meias e atacantes por desempenho.`,
    },
    "/estatisticas/tira-teima": {
      title: `Tira-teima | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: compare atletas lado a lado com estatísticas e histórico.`,
    },
    "/os-campeoes": {
      title: `Campeões | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja os campeões, títulos e conquistas.`,
    },
    "/grandes-torneios": {
      title: `Grandes torneios | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: acompanhe torneios especiais, campeões e momentos marcantes.`,
    },
    "/sobre-nos": {
      title: `Sobre nós | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: conheça nossa história, as regras, os contatos e os parceiros.`,
    },
    "/sobre-nos/nossa-historia": {
      title: `Nossa história | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: relembre os momentos que marcaram nossa história dentro e fora de campo.`,
    },
    "/sobre-nos/nossos-parceiros": {
      title: `Parceiros | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: conheça os parceiros e patrocinadores que apoiam nosso futebol.`,
    },
    "/sobre-nos/prestacao-de-contas": {
      title: `Prestação de contas | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja as informações financeiras que compartilhamos com atletas e visitantes.`,
    },
    "/comunicacao": {
      title: `Comunicação | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: acesse comunicados, enquetes e canais de contato.`,
    },
    "/comunicacao/comunicados": {
      title: `Comunicados | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: leia os comunicados publicados pela administração.`,
    },
    "/comunicacao/enquetes": {
      title: `Enquetes | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: acompanhe as enquetes no Fut7Pro.`,
    },
    "/sorteio-inteligente": {
      title: `Sorteio Inteligente | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: entenda como usamos o Sorteio Inteligente para formar times.`,
    },
    "/contato": {
      title: `Contato | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: veja nossos canais de contato.`,
    },
    "/entrar": {
      title: `Entrar | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: área de acesso para atletas e administradores.`,
      noindex: true,
    },
    "/login": {
      title: `Login | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: login de atletas e administradores.`,
      noindex: true,
    },
    "/register": {
      title: `Cadastro | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: solicite acesso ou crie sua conta para participar.`,
      noindex: true,
    },
    "/esqueci-senha": {
      title: `Recuperar senha | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: recupere o acesso à sua conta.`,
      noindex: true,
    },
    "/resetar-senha": {
      title: `Redefinir senha | ${tenantName} | Fut7Pro`,
      description: `${tenantName}: redefina a senha da sua conta.`,
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
      ? `${tenantName}: acesse ${readable} no Fut7Pro.`
      : `${tenantName}: acompanhe partidas, atletas e novidades no Fut7Pro.`,
  };
}
