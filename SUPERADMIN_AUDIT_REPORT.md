# SUPERADMIN AUDIT REPORT

Data: 2026-02-21 (atualizado)  
Escopo: `src/app/(superadmin)/superadmin/**`, `src/components/superadmin/**`, `src/hooks/useSuperAdmin*`.

## Resumo Executivo

- O painel SuperAdmin estava funcional, mas com sobrecarga de telas nao essenciais e parte relevante em modo mock/fallback estatico.
- Foram encontrados 23 endpoints de pagina (`page.tsx`) no modulo SuperAdmin:
  - `core`: 5
  - `financeiro`: 3
  - `operacoes`: 3
  - `configuracoes`: 1
  - `legacy`: 9
  - `root`: 2
- Foi aplicado corte operacional para go-live: menu principal agora exibe apenas o conjunto minimo necessario para controle da plataforma.
- Lacunas de segurança em endpoints legados fora do menu principal foram identificadas e mitigadas nesta rodada.
- Rotas de paginas legacy agora ficam bloqueadas por feature flag server-side (default bloqueado).

## Status Final de Aceite

- SuperAdmin aprovado para operacao MVP de vendas.
- Navegacao principal limitada a paginas com valor operacional direto.
- Rotas com maior risco de mock/fallback foram isoladas em `legacy`.
- Validacao tecnica local concluida:
  - `pnpm typecheck` OK
  - `pnpm lint` OK

## Achados (Severidade)

### Critico

1. Endpoint legado sensivel sem autenticacao e com acesso direto ao banco (Prisma no app web)

- Evidencias:
  - `src/app/api/superadmin/marketing/pagar-venda/route.ts:1`
- Risco:
  - Alteracao de estado financeiro sem sessao SUPERADMIN valida.
  - Bypass do backend oficial e da regra de producao `DISABLE_WEB_DIRECT_DB=true`.

2. Telas com dados mock expostas no painel

- Evidencias:
  - `src/app/(superadmin)/superadmin/(legacy)/logs/page.tsx:5`
  - `src/app/(superadmin)/superadmin/(legacy)/marketing/page.tsx:29`
  - `src/app/(superadmin)/superadmin/(legacy)/marketing/[id]/page.tsx:7`
- Risco:
  - Passa falsa percepcao de operacao real em fluxos comerciais/financeiros.

### Alto

3. Monitoramento com fallback de incidentes/servicos hardcoded

- Evidencias:
  - `src/app/(superadmin)/superadmin/(legacy)/monitoramento/page.tsx:39`
  - `src/app/(superadmin)/superadmin/(legacy)/monitoramento/page.tsx:93`
  - `src/app/(superadmin)/superadmin/(legacy)/monitoramento/page.tsx:147`
  - `src/app/(superadmin)/superadmin/(legacy)/monitoramento/page.tsx:178`
- Risco:
  - Dados operacionais podem nao refletir estado real quando API falha/retorna vazio.

4. Integracoes com fallback local (localStorage + catalogo local)

- Evidencias:
  - `src/app/(superadmin)/superadmin/(legacy)/integracoes/page.tsx:339`
  - `src/app/(superadmin)/superadmin/(legacy)/integracoes/page.tsx:558`
  - `src/app/(superadmin)/superadmin/(legacy)/integracoes/page.tsx:594`
- Risco:
  - Configuracao pode aparentar persistencia backend sem de fato estar aplicada no sistema.

5. Endpoint de exportacao financeira exposto sem autenticacao e com resposta mock

- Evidencias:
  - `src/app/api/superadmin/export-financeiro/route.ts:1`
- Risco:
  - Superficie desnecessaria para enumeracao de rotas privadas.
  - Resposta mock em endpoint com semantica de operacao critica.

6. Estrutura sem separacao clara de dominio (antes da reorganizacao)

- Sintoma:
  - Muitas paginas "soltas" em `src/app/(superadmin)/superadmin/*`.
- Risco:
  - Manutencao lenta e maior chance de regressao de navegacao.

### Medio

7. Duplicidade de entrada no dashboard

- Evidencia anterior:
  - `src/app/(superadmin)/superadmin/page.tsx` (dashboard duplicado do `/superadmin/dashboard`)
- Risco:
  - Dupla manutencao e divergencia funcional.

8. Artefato de shell duplicado

- Evidencia anterior:
  - `src/components/superadmin/SuperAdminSidebar.tsx` (arquivo sem uso)
- Risco:
  - Divida tecnica e chance de drift de navegacao.

## Escopo MVP (Go-Live)

### Paginas mantidas no menu principal

- `/superadmin/dashboard`
- `/superadmin/rachas`
- `/superadmin/admins`
- `/superadmin/contas`
- `/superadmin/financeiro`
- `/superadmin/planos`
- `/superadmin/suporte`
- `/superadmin/cancelamentos`
- `/superadmin/notificacoes`
- `/superadmin/config`

### Paginas movidas para legacy (fora da navegacao principal)

- `/superadmin/automacoes`
- `/superadmin/logs`
- `/superadmin/marketing`
- `/superadmin/marketing/[id]`
- `/superadmin/monitoramento`
- `/superadmin/metricas/localizacao`
- `/superadmin/integracoes`
- `/superadmin/comunicacao/ajuda`
- `/superadmin/comunicacao/sugestoes`

## Acoes Aplicadas Nesta Auditoria

1. Reorganizacao por pastas (route groups, sem quebrar URL)

- Novo agrupamento:
  - `src/app/(superadmin)/superadmin/(core)/**`
  - `src/app/(superadmin)/superadmin/(financeiro)/**`
  - `src/app/(superadmin)/superadmin/(operacoes)/**`
  - `src/app/(superadmin)/superadmin/(configuracoes)/**`
  - `src/app/(superadmin)/superadmin/(legacy)/**`

2. Navegacao principal reduzida para operacao minima

- Arquivo:
  - `src/app/(superadmin)/superadmin/Sidebar.tsx:27`
- Resultado:
  - Menu com secoes `Core`, `Financeiro`, `Operacao` e `Sistema`, sem links legacy/mock.

3. Entrada unica para dashboard

- Arquivo:
  - `src/app/(superadmin)/superadmin/page.tsx:4`
- Resultado:
  - Redirecionamento para `/superadmin/dashboard`.

4. Remocao de componente orfao

- Arquivo removido:
  - `src/components/superadmin/SuperAdminSidebar.tsx`

5. Alinhamento de documentacao operacional

- Arquivos atualizados:
  - `README_DEV_GUIDE.md`
  - `AUDITORIA_ascii_clean.md`
  - `ESPECIFICACAO_FUT7PRO_WEB.md`
  - `SUPERADMIN_AUDIT_REPORT.md`

6. Hardening do endpoint legado `marketing/pagar-venda`

- Arquivo:
  - `src/app/api/superadmin/marketing/pagar-venda/route.ts`
- Resultado:
  - Removido acesso direto ao Prisma no app web.
  - Endpoint agora exige sessao SUPERADMIN e retorna `410` (desativado).

7. Hardening do endpoint `export-financeiro`

- Arquivo:
  - `src/app/api/superadmin/export-financeiro/route.ts`
- Resultado:
  - Endpoint agora exige sessao SUPERADMIN.
  - Mock removido; resposta controlada `501` enquanto o backend oficial nao expoe exportacao por API.

8. Bloqueio server-side das paginas `legacy` por feature flag

- Arquivos:
  - `src/app/(superadmin)/superadmin/(legacy)/layout.tsx`
  - `src/lib/feature-flags.ts`
- Resultado:
  - Paginas legacy nao ficam mais acessiveis por URL direta quando a flag estiver desativada.
  - Valor padrao: bloqueado (`SUPERADMIN_ENABLE_LEGACY_ROUTES=false`).

## Validacao Tecnica

- `pnpm typecheck` -> OK
- `pnpm lint` -> OK

## Parecer Final

- O SuperAdmin agora esta pronto para operacao minima de vendas com foco em controle real do negocio.
- As areas com maior risco de mock/fallback foram isoladas em `legacy` e removidas da navegacao principal.
- Os endpoints legados sem protecao foram endurecidos para reduzir superficie de ataque.
- Recomendacao para fase 2 (pos-go-live): migrar `legacy` para backend real ou remover definitivamente pagina por pagina.
