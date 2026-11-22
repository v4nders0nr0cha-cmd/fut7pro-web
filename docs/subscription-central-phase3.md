# Central de Assinatura Fut7Pro — Fase 3

A Central reúne quatro rotas: `/admin/assinatura`, `/admin/assinatura/beneficios`, `/admin/assinatura/pagamentos` e `/admin/assinatura/planos`. O acesso permanece no menu do perfil, separado das finanças internas do grupo. A rota antiga redireciona para a Central, preservando os parâmetros; `?faturas=1` abre Pagamentos.

## Dependências

Frontend baseado no PR #272 (`32351b012815f7af52bc5238579759a21ded978b`). APIs da Fase 2 no backend #203, mais o complemento #204, baseado nesse PR. Os PRs anteriores não foram alterados.

Ordem futura: backend #199 → #200 → #201 → #202 → #203 → #204. Aplicar as migrações já documentadas antes do código dependente: `20261122010000_billing_durable_operations`, `20261122020000_durable_webhook_inbox`, `20261122030000_subscription_history`. Depois integrar frontend #272 e esta Central. Não há migração na Fase 3. Sem merge, publicação manual, alterações financeiras ou migrações em produção.

## Comportamento

- Visão geral separa contrato, acesso oficial e pagamentos. Uma data futura não libera acesso. Pendência financeira pode coexistir com compensação válida, conforme a decisão oficial do backend.
- Benefícios diferencia teste inicial comprovado, condições oferecidas por cupom e concessões registradas. Recompensa do Guia depende de confirmação. Não soma dias antigos como saldo atual.
- Pagamentos consulta o histórico completo com paginação por cursor e filtros. Devoluções ficam separadas do pagamento bruto. Valores e condições antigos desconhecidos permanecem indisponíveis. Não gera recibos nem apresenta links de pagamento como comprovantes.
- Planos utiliza o catálogo oficial e as capacidades do backend. As operações reutilizam PIX, recorrência, cupom, contratação, mudança de plano e cancelamento existentes. Nenhum valor ou prazo comercial é recalculado pela interface.
- Diretor de Futebol recebe apenas resumo e ações permitidas; consultas detalhadas não são feitas. Todos os endpoints continuam verificando autenticação, assinatura e grupo no backend.

## Arquitetura e proteção de carregamento

`CentralProvider` usa uma instância do hook de assinatura da Fase 1. Capacidades e consultas históricas têm chave por grupo, assinatura e geração. A troca A → B → A descarta respostas antigas, fecha os detalhes e impede uso de resultados financeiros de uma seleção anterior. Uma operação pendente por grupo impede duplo envio; o resultado atrasado não abre PIX nem redireciona para checkout.

O proxy BFF aceita somente GET de overview, benefits, invoices, detalhe e events. Valida a assinatura do grupo ativo e encaminha uma lista fechada de filtros. Respostas são privadas e sem cache. O backend permanece autoridade de permissões, idempotência, acesso e confirmação financeira.

Os diálogos reutilizam `Fut7DialogBase`, incluindo foco, Escape e teclado. A navegação utiliza links reais, com `aria-current`. Pagamentos usa tabela em desktop e cartões em telas menores. Carregamento e erros possuem regiões reservadas e nova tentativa.

## Validação

Os resultados finais de testes e build serão registrados no PR. As fixtures utilizam apenas dados fictícios e transporte local, com bloqueio explícito da API de produção. Capturas do Playwright são anexadas aos artefatos do CI. O build local usa dependências previamente instaladas (Next 15.5.28), fontes locais e instrumentação Sentry desativada somente no processo de verificação; o CI utiliza o lockfile (Next 15.5.29) e o build padrão, sem esses adaptadores locais.
