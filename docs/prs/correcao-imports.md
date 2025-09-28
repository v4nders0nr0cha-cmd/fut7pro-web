# PR Tecnico - Correcao de Imports

## Objetivo

Eliminar imports quebrados ou inconsistentes (ex.: `@/types/notification` vs `@/types/notificacao`) e padronizar os caminhos absolutos do projeto.

## Escopo

- Ajustar referencias para os tipos renomeados (`notification` -> `notificacao`).
- Garantir que as telas atualizadas usem os novos hooks (`useEstatisticas`, `usePartidas`, `useSuperadmin*`).
- Remover imports de mocks legados que foram substituidos por dados reais.

## Status

- [x] `usePartidas` e telas de partidas utilizam apenas os endpoints reais.
- [x] Hooks de estatisticas publicados em `src/hooks/useEstatisticas.ts`.
- [x] Superadmin deixou de consumir mocks (`mockAdmins`, `mockNotificacoes`, `mockSuporte`).
- [ ] Conferir modulos restantes em `estatisticas/` para garantir ausencia de mocks.

## Proximos Passos

1. Executar `npm run type-check` (ja feito neste ciclo) e repetir apos ajustes finais.
2. Rodar `rg "mock" src/app/(public)/estatisticas` e remover referencias residuais.
3. Atualizar CHANGELOG interno com orientacoes de import padrao.
