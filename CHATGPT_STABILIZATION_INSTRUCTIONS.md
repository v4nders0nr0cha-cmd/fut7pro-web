# Fut7Pro — Instruções para PR de Estabilização (Frontend)

## Objetivo

Deixar o repositório `fut7pro-web` **pronto para produção**:

- Build Next.js limpo (sem warnings).
- ESLint/TypeScript sem erros/warnings.
- Testes executando e verdes.
- CI (GitHub Actions) passando.

## Passos que você (GPT-5 Agent) deve executar

1. Rodar localmente via CI:

   - `npm ci`
   - `npm run type-check`
   - `npm run lint`
   - `npm test`
   - `npm run build`

2. Corrigir sistematicamente:

   - Imports quebrados/paths errados.
   - Tipagens faltantes ou `any` implícitos.
   - Acessibilidade/SEO básicos (alt em imagens, `<Head>` adequados).
   - Warnings do Next (imagens externas sem domain, etc.).
   - Scripts do `package.json` ausentes — adicione se necessário:
     ```json
     {
       "scripts": {
         "dev": "next dev",
         "build": "next build",
         "start": "next start",
         "lint": "next lint",
         "type-check": "tsc --noEmit",
         "test": "jest"
       }
     }
     ```

3. Abrir PR:
   - **Título:** `feat: estabilização completa do frontend`
   - **Descrição:** listando arquivos tocados, erros resolvidos e próximos passos.
   - Anexar logs/resumo do CI.
   - Não alterar comportamento funcional sem necessidade.

## Regras

- Manter **TypeScript estrito**.
- Não adicionar dependências pesadas sem justificativa.
- Seguir estrutura `src/` já padronizada.
