# Homologação da Central de Assinatura

Esta validação continua os PRs web #273 e backend #204. Não altera produção, preços, acesso ou as fases anteriores.

## Ambiente integrado reproduzível

Usar a branch do backend #204, PostgreSQL local dedicado e um banco novo chamado `billing_phase3_homolog_test`. Definir `NODE_ENV=test`, `ALLOW_E2E_DATABASE_MUTATION=true`, `DATABASE_URL` e `DIRECT_URL` para esse banco local. O verificador de segurança recusa bancos externos ou de produção.

No backend, executar `pnpm exec tsx scripts/prepare-billing-phase1-fixture.ts`. O script prepara o esquema anterior e aplica, nesta ordem:

1. `20261122010000_billing_durable_operations`.
2. `20261122020000_durable_webhook_inbox`.
3. `20261122030000_subscription_history`.

Executar `CENTRAL_HOMOLOGATION=1 node scripts/central-homologation.cjs`. O servidor de teste escuta somente `127.0.0.1:4318`, usa os controladores, serviços, estratégia JWT e guards reais, PostgreSQL e gatilhos reais. Somente o cliente externo de pagamentos é simulado. O script está fora da aplicação de produção.

No frontend, usar as variáveis locais do Admin Smoke: APIs `http://127.0.0.1:4317`, frontend `https://127.0.0.1:3443`, `ADMIN_SMOKE_FIXTURE=1`, `PLAYWRIGHT_WEB_SERVER=1`, `CENTRAL_HOMOLOGATION=1` e um certificado TLS efêmero. Iniciar separadamente o servidor de fixture administrativa, o Next e o proxy TLS existentes. A flag integrada faz a fixture encaminhar **todas** as rotas `/billing/*` ao Nest real. Não há interceptação Playwright das respostas de cobrança nessa suíte.

Executar:

```sh
pnpm exec playwright test --config=playwright.homologation.config.ts --project=chromium --project=webkit
node tests/admin/central-integrated-api.mjs
```

A suíte integrada verifica quatro páginas em 1280, 768, 390 e 320 px, filtros SQL reais de devoluções, detalhes, foco, links antigos e ausência de transbordamento. Anexa as capturas ao relatório Playwright. A verificação HTTP usa cinco cargos, autorização JWT real, isolamento, paginação e PIX simultâneo/reutilizado.

**Limite explícito:** login e elementos administrativos fora da assinatura continuam usando a fixture. Não é uma implantação completa do AppModule nem uma validação do login ou do Mercado Pago em ambiente externo. As suítes `.fixture.spec.ts` continuam separadas e usam respostas simuladas de cobrança.

## Correções da homologação

- A validade do PIX informa data, hora e fuso de Brasília; textarea com foco visível.
- Comparação abre na periodicidade do contrato confirmado e reinicia a seleção ao mudar de grupo/conta.
- Contratação Enterprise preserva o link de autorização devolvido pela API, além do PIX inicial.
- Data de registro fica “Consultando...” enquanto o resumo está sendo consultado; falha informa indisponibilidade.
- Capturas das páginas ficam separadas da evidência de falha de pagamento. Upload específico evita que outra execução Playwright apague as imagens antes de enviá-las.

## Segurança

O workflow original ignora Snyk sem `SNYK_TOKEN`. Não houve configuração de credenciais nem contratação de serviço nesta homologação. O audit de produção bloqueia somente severidade **critical**; o audit de moderate é informativo e pode falhar com o job verde. O workflow agora preserva o JSON e explica essa cobertura no resumo. Não reduzir o limiar nem confundir job aprovado com ausência de vulnerabilidades.

A execução anterior do Security Scan (`140175647477`) registrou 56 ocorrências: 32 altas, 17 moderadas e 7 baixas, sem críticas. Há dependências transitivas de ferramentas de CSS, Sentry e Prisma entre os resultados. Essa dívida exige triagem e atualização compatível; não constitui evidência de exploração da Central. Não afirmar que os alertas foram resolvidos sem novo audit do lockfile.

## Integração

Backend #199 → #200 → #201 → #202 → #203 → #204. Frontend #272 → #273, depois da API compatível. Não há migração nova na Fase 3. Revalidar cada branch ao mudar sua base. Esta documentação não autoriza merge nem implantação.
