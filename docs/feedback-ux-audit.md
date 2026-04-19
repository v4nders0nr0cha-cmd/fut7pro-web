# Auditoria de Feedback UX Fut7Pro

Status: Fase 1 implantada e Fase 2 em execução.
Base: PR #107 ja mergeada em producao.

## Regra oficial

O produto Fut7Pro nao deve usar dialogs nativos do navegador em codigo de produto:

- `alert()`
- `confirm()`
- `prompt()`
- `window.alert()`
- `window.confirm()`
- `window.prompt()`

A checagem `pnpm run lint` executa `scripts/quality/no-native-browser-dialogs.js` e bloqueia qualquer reintroducao. O baseline atual esta vazio.

## Foundation oficial

Componentes padrao:

- `Fut7ConfirmDialog`
- `Fut7DestructiveDialog`
- `Fut7PromptDialog`
- `Fut7SuccessDialog`
- `Fut7ToastProvider`
- `showFut7Toast()`
- `Fut7InlineFeedback`

Uso recomendado:

- Destrutivo: `Fut7DestructiveDialog`, com impacto explicado e confirmacao textual quando necessario.
- Operacional: `Fut7ConfirmDialog`, com descricao objetiva e CTAs claros.
- Entrada de texto: `Fut7PromptDialog` ou `Fut7ConfirmDialog` com campo customizado.
- Informativo leve: `showFut7Toast()`.
- Estado contextual de tela: `Fut7InlineFeedback`.

## Inventario migrado nesta fase

| Area       | Rota/Tela                                 | Arquivo                                                                                 | Tipo legado                       | Criticidade             | Substituicao                         |
| ---------- | ----------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- | ------------------------------------ |
| Admin      | `/admin/partidas/criar-times`             | `src/app/(admin)/admin/partidas/criar-times/page.tsx`                                   | `alert`, `confirm`                | Operacional/destrutivo  | Inline feedback + destructive dialog |
| Admin      | `/admin/partidas/resultados-do-dia`       | `src/components/admin/ResultadosDoDiaAdmin.tsx`                                         | `window.confirm`                  | Operacional/destrutivo  | Confirm/destructive dialogs          |
| Admin      | `/admin/conquistas/grandes-torneios`      | `src/app/(admin)/admin/conquistas/grandes-torneios/page.tsx`                            | `confirm`                         | Destrutivo              | Destructive dialog                   |
| Admin      | Modal de torneio                          | `src/components/admin/ModalCadastroTorneio.tsx`                                         | `confirm`                         | Destrutivo              | Destructive dialog                   |
| Admin      | `/admin/personalizacao/identidade-visual` | `src/app/(admin)/admin/personalizacao/identidade-visual/page.tsx`                       | `window.confirm`                  | Operacional             | Confirm dialog                       |
| Admin      | `/admin/relatorios`                       | `src/app/(admin)/admin/relatorios/page.tsx`                                             | `alert`                           | Informativo             | Toast Fut7Pro                        |
| SuperAdmin | `/superadmin/admins`                      | `src/app/(superadmin)/superadmin/(protected)/(core)/admins/page.tsx`                    | `window.confirm`                  | Permissoes/seguranca    | Confirm/destructive dialogs          |
| SuperAdmin | `/superadmin/contas`                      | `src/app/(superadmin)/superadmin/(protected)/(core)/contas/page.tsx`                    | `window.prompt`                   | Conta global/destrutivo | Prompt/destructive dialogs           |
| SuperAdmin | `/superadmin/contas/[id]`                 | `src/app/(superadmin)/superadmin/(protected)/(core)/contas/[id]/page.tsx`               | `window.prompt`                   | Conta global/destrutivo | Prompt/destructive dialogs           |
| SuperAdmin | `/superadmin/rachas`                      | `src/app/(superadmin)/superadmin/(protected)/(core)/rachas/page.tsx`                    | `alert`, `window.confirm`         | Tenant/destrutivo       | Toast + destructive dialog           |
| SuperAdmin | `/superadmin/tenant-lifecycle`            | `src/app/(superadmin)/superadmin/(protected)/(operacoes)/tenant-lifecycle/page.tsx`     | `alert`, `window.confirm`         | Tenant/destrutivo       | Toast + destructive dialog           |
| SuperAdmin | `/superadmin/compensacoes-acesso`         | `src/app/(superadmin)/superadmin/(protected)/(financeiro)/compensacoes-acesso/page.tsx` | `window.prompt`, `window.confirm` | Financeiro/acesso       | Confirm dialog com motivo e checkbox |
| SuperAdmin | Header SuperAdmin                         | `src/app/(superadmin)/superadmin/Header.tsx`                                            | `window.confirm`                  | Sessao                  | Confirm dialog                       |
| SuperAdmin | Detalhes do racha                         | `src/components/superadmin/ModalDetalhesRacha.tsx`                                      | `alert`                           | Operacional             | Toast Fut7Pro                        |
| SuperAdmin | Blog                                      | `src/app/(superadmin)/superadmin/(protected)/(operacoes)/blog/page.tsx`                 | `window.confirm`                  | Operacional             | Confirm dialog                       |
| SuperAdmin | Editor do Blog                            | `src/app/(superadmin)/superadmin/(protected)/(operacoes)/blog/BlogEditorForm.tsx`       | `window.prompt`                   | Conteudo/SEO            | Prompt dialog                        |
| SuperAdmin | Integracoes legacy                        | `src/app/(superadmin)/superadmin/(protected)/(legacy)/integracoes/page.tsx`             | `alert`                           | Informativo             | Toast Fut7Pro                        |
| Publico    | Nossa Historia                            | `src/app/(public)/sobre-nos/nossa-historia/page.tsx`                                    | `alert`, `window.prompt`          | Informativo             | Feedback inline publico              |
| Publico    | Estatuto                                  | `src/app/(public)/sobre-nos/estatuto/page.tsx`                                          | `alert`                           | Informativo             | Feedback inline publico              |

## Resultado da varredura

Comando:

```bash
rg -n "\\b(window\\.)?(alert|confirm|prompt)\\s*\\(" src --glob '!node_modules'
```

Resultado atual: zero ocorrencias em `src`.

## Proximas regras de implementacao

- Novo fluxo destrutivo deve explicar impacto antes da acao.
- Acoes de exclusao permanente devem exigir confirmacao textual quando houver risco alto.
- Mensagens leves devem usar toast Fut7Pro, nao modal.
- Feedback contextual deve aparecer inline, proximo da acao que o usuario executou.
- PRs futuras que adicionarem `alert/confirm/prompt` devem falhar no lint.
