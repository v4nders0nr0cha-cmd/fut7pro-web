# PR Tecnico - Ajustes de Variaveis de Ambiente

## Objetivo

Centralizar e documentar o uso das variaveis necessarias para os fluxos habilitados: APIs publicas, estatisticas e publicacao do sorteio.

## Escopo

- Revisar `env.example` e `env.local.example` garantindo a presenca de `NEXT_PUBLIC_API_URL`, `BACKEND_URL`, `NEXTAUTH_URL`, credenciais do proxy e flags de mock.
- Destacar variaveis obrigatorias para rodar os proxies (`/api/public/jogos-do-dia`).
- Documentar no README a configuracao minima pos-fases 1-4.

## Status

- [x] `env.example` e `env.local.example` atualizados com as novas chaves.
- [ ] Incluir anotacao clara sobre `RACHA_DEFAULT_ID` (avaliar necessidade).
- [ ] Atualizar docs de setup (`docs/ENV_SETUP.md` ou README) refletindo as etapas de seeds.

## Proximos Passos

1. Revisar se os scripts em `scripts/*.ps1` mencionam as variaveis adicionadas.
2. Garantir que deploy (Vercel) tenha checklist das chaves sensiveis.
3. Acrescentar um quadro resumido de variaveis no README.
