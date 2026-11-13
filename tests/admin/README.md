# Admin Smoke Navigation

Este smoke compila e inicia o frontend Next.js e uma API de fixtures na própria execução do GitHub Actions. A execução usa o servidor de produção do Next.js para evitar atrasos de compilação de rotas e sobreposições das ferramentas de desenvolvimento. As contas, tokens e grupos usam apenas valores sintéticos. O navegador e o processo Node bloqueiam chamadas para `api.fut7pro.com.br`; as variáveis de API são verificadas antes da execução.

Os cenários cobrem a navegação por controles reais, os oito atalhos do Dashboard, os fragmentos das duas opções de Solicitações, contagens, estado acessível do menu, permissões exibidas por papel, bloqueio de assinatura e ausência de grupo. Cada destino clicado exige URL, conteúdo próprio da página e ausência de estado 404. O grupo bloqueado abre Planos & Limites pelo link de regularização; Dashboard e Notificações continuam bloqueados. Um link ausente ou um clique que não chega ao destino reprova o check. Não há fallback por `page.goto` após clique nem cenários ignorados.

O navegador inicia com consentimento de cookies já registrado no armazenamento local de teste. Isso mantém o aviso global fora do caminho da navegação inferior; a lógica do aviso não integra este smoke.

A API de fixtures só implementa o contrato necessário a esses cenários. Esse smoke não valida login, Turnstile, autorização nem dados do backend de produção. Essas garantias exigem testes de integração separados no backend e verificações autenticadas de produção, com credenciais e controles próprios. Uma resposta `404 Fixture sem contrato` indica dependência nova que deve ser modelada explicitamente, sem recorrer à API real.
