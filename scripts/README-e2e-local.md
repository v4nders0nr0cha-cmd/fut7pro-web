# Script E2E Local - Orquestrador Completo

Este script PowerShell automatiza todo o processo de testes E2E local, incluindo setup do banco, migração, seed, subida da aplicação e execução dos testes.

## Uso Rápido

```bash
# Comando mais simples - usa configurações padrão
npm run e2e:local

# Ou diretamente via PowerShell
powershell -ExecutionPolicy Bypass -File scripts/run-e2e-local.ps1
```

## Uso Avançado

```bash
# Com slug específico
powershell -ExecutionPolicy Bypass -File scripts/run-e2e-local.ps1 -Slug meu-racha

# Com URL e path específicos
powershell -ExecutionPolicy Bypass -File scripts/run-e2e-local.ps1 -Slug meu-racha -BaseUrl http://localhost:3000 -RachaPath /rachas/meu-racha

# Manter o banco rodando após os testes (útil para debug)
powershell -ExecutionPolicy Bypass -File scripts/run-e2e-local.ps1 -KeepDb
```

## O que o Script Faz

1. **Setup do Ambiente**: Configura variáveis e exibe parâmetros
2. **Banco de Dados**: Sobe Postgres via Docker (`npm run db:up`)
3. **Migração + Seed**: Aplica migrations e popula dados (`npm run dev:migrate-seed`)
4. **Aplicação Next**: Sobe o servidor em background (`npm run dev`)
5. **Health Check**: Aguarda aplicação responder (múltiplos endpoints)
6. **Smoke Test**: Executa verificação rápida da API (`scripts/smoke-campeoes.ts`)
7. **Testes E2E**: Roda os 3 testes Playwright:
   - Times do Dia
   - Estatísticas
   - Os Campeões
8. **Cleanup**: Encerra Next e derruba Postgres (a menos que `-KeepDb` seja usado)

## Parâmetros

- `-Slug`: Slug do racha para usar no seed (padrão: "demo-rachao")
- `-BaseUrl`: URL base da aplicação (padrão: "http://localhost:3000")
- `-RachaPath`: Path do racha para os testes (padrão: "/rachas/demo-rachao")
- `-KeepDb`: Mantém Postgres rodando após os testes (útil para debug)

## Pré-requisitos

- Docker instalado e rodando
- Node.js e npm instalados
- PowerShell (Windows) ou PowerShell Core (Linux/Mac)
- Playwright instalado (`npx playwright install`)

## Troubleshooting

- Se o script falhar no health check, verifique se não há conflitos de porta
- Use `-KeepDb` para manter o banco e investigar problemas
- Logs do Next ficam disponíveis no processo em background
