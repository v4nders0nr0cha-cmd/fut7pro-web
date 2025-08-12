# Política de UI — Fut7Pro Web

## Regra principal
Não alterar **layout/estrutura** do frontend. Melhorias visuais são permitidas **sem** remover/alterar elementos existentes.

## O que é proibido sem autorização
- Remover/renomear componentes ou nós JSX existentes.
- Alterar `className` de elementos existentes de forma a quebrar layout.
- Remover atributos de teste (`data-testid`) ou hooks críticos.

## O que é permitido
- Ajustes de **estilo/efeitos** (CSS/Tailwind/Framer Motion).
- Imports/tipos/limpezas que **não** alterem render/estrutura.

## Processo para PRs que mexem em UI
1. Adicionar label **`ui-enhancement`** (efeitos/estilo) **ou** `ui-change` (estrutura).  
2. Anexar **screenshots** no PR.  
3. A revisão de **CODEOWNERS** é obrigatória.  
4. Em casos excepcionais, usar **`override: ui-allow`** (sempre com evidências).

## Enforcement
- **PR Guard (Danger)** falha PRs que não seguirem as regras.  
- **Branch protection + CODEOWNERS** requerem aprovação do responsável.
