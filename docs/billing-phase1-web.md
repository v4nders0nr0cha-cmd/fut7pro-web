# Fase 1: assinatura e isolamento de contexto

A interface respeita canAccess e blocked retornados pelo backend. Data futura não libera acesso. Sem decisão oficial disponível, o estado é apresentado como não informado.

O hook separa catálogo e assinatura, mantém o contexto por grupo e ignora respostas antigas. A página limpa PIX, seleção de plano, cupom e diálogos ao trocar de grupo. Resultados de ações usam uma geração de contexto, incluindo a sequência grupo A, grupo B, grupo A. O evento BILLING_CHANGED do Guia permanece ativo.

A implementação reaproveita o código válido do PR #253. O #254 também altera o hook; ambos continuam abertos e precisam ser coordenados antes de qualquer merge. Não houve mudança de rotas, permissões, duração de teste ou benefícios, nem implementação visual da Central de Assinatura.

Testes de componente verificam carregamento, retorno vazio, falha, respostas atrasadas, PIX de outro grupo, cliques repetidos e decisão negativa com prazo futuro. A fixture de navegador cobre 1280, 390 e 320 px, compensação com pendência, foco por teclado e largura da página. Ela usa exclusivamente o servidor de testes local e está incluída no Admin Smoke CI.

O backend correspondente está nos PRs #199, #200 e #201 de fut7pro-backend. As migrações e a configuração de autenticação do webhook devem seguir a sequência documentada nesses PRs. A rota atual de regularização continua disponível para grupos bloqueados.
