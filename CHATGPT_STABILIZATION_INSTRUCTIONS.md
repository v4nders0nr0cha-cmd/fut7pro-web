# 🤖 INSTRUÇÕES PARA O CHATGPT - PR DE ESTABILIZAÇÃO

## 🎯 OBJETIVO

Criar um Pull Request para estabilizar o frontend Fut7Pro, corrigindo problemas de lint, TypeScript e build.

## 📋 TAREFAS PRIORITÁRIAS

### 1. 🔧 CORREÇÃO DE ESLINT

- Executar `npm run lint` e corrigir TODOS os erros
- Resolver warnings de ESLint
- Verificar configuração do `.eslintrc.js` ou `eslint.config.js`
- Corrigir problemas de formatação

### 2. 🎯 CORREÇÃO DE TYPESCRIPT

- Executar `npm run type-check` ou `npx tsc --noEmit`
- Resolver TODOS os erros de tipo
- Corrigir imports não utilizados
- Verificar definições de tipos em `src/types/`

### 3. 🏗️ LIMPEZA DE BUILD

- Executar `npm run build` e verificar warnings
- Corrigir problemas de build do Next.js
- Otimizar imports e remover dependências não utilizadas
- Verificar configuração do `next.config.js`

### 4. 📦 ATUALIZAÇÃO DE DEPENDÊNCIAS

- Verificar `npm audit` para vulnerabilidades
- Atualizar dependências de desenvolvimento
- Verificar compatibilidade de versões
- Atualizar `package-lock.json`

### 5. 🧪 CORREÇÃO DE TESTES

- Executar `npm test` e corrigir falhas
- Verificar configuração do Jest
- Corrigir mocks e configurações de teste
- Garantir cobertura adequada

## 🚀 PROCESSO DE EXECUÇÃO

### Passo 1: Análise Inicial

```bash
# Verificar status atual
npm run lint
npm run type-check
npm run build
npm test
npm audit
```

### Passo 2: Correções Sistemáticas

1. **ESLint**: Corrigir erro por erro
2. **TypeScript**: Resolver tipos um por um
3. **Build**: Corrigir warnings sequencialmente
4. **Testes**: Corrigir falhas individualmente

### Passo 3: Validação

```bash
# Verificar se tudo está funcionando
npm run lint:fix
npm run type-check
npm run build
npm test
npm run format
```

## 📁 ARQUIVOS PRIORITÁRIOS PARA CORREÇÃO

### 🔴 ALTA PRIORIDADE

- `src/app/layout.tsx` - Layout principal
- `src/app/page.tsx` - Página inicial
- `src/components/layout/` - Componentes de layout
- `src/types/` - Definições de tipos
- `next.config.js` - Configuração do Next.js
- `tsconfig.json` - Configuração do TypeScript

### 🟡 MÉDIA PRIORIDADE

- `src/components/admin/` - Componentes administrativos
- `src/components/cards/` - Cards reutilizáveis
- `src/hooks/` - Hooks customizados
- `src/lib/` - Utilitários e configurações

### 🟢 BAIXA PRIORIDADE

- `src/components/__tests__/` - Testes
- `src/mocks/` - Dados mock
- `public/` - Assets estáticos

## 🎨 PADRÕES DE CÓDIGO

### 📝 IMPORTS

```typescript
// ✅ CORRETO
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/user";

// ❌ INCORRETO
import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { User } from "../types/user";
```

### 🏷️ TYPES

```typescript
// ✅ CORRETO
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// ❌ INCORRETO
interface UserProps {
  id: any;
  name: string;
  email: string;
}
```

### 🧪 TESTES

```typescript
// ✅ CORRETO
describe('UserComponent', () => {
  it('should render user name', () => {
    render(<UserComponent user={mockUser} />)
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })
})

// ❌ INCORRETO
test('renders user', () => {
  // teste sem descrição clara
})
```

## 🔍 PROBLEMAS COMUNS A RESOLVER

### 1. IMPORTS NÃO UTILIZADOS

```typescript
// ❌ REMOVER
import { useState } from "react"; // se não estiver sendo usado
import { Button } from "@/components/ui/Button"; // se não estiver sendo usado
```

### 2. TIPOS ANY

```typescript
// ❌ INCORRETO
const handleClick = (event: any) => { ... }

// ✅ CORRETO
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { ... }
```

### 3. CONSOLE.LOG

```typescript
// ❌ REMOVER EM PRODUÇÃO
console.log("debug info");

// ✅ USAR EM DESENVOLVIMENTO
if (process.env.NODE_ENV === "development") {
  console.log("debug info");
}
```

### 4. IMPORTS RELATIVOS LONGOS

```typescript
// ❌ INCORRETO
import { Button } from "../../../../components/ui/Button";

// ✅ CORRETO
import { Button } from "@/components/ui/Button";
```

## 📊 MÉTRICAS DE SUCESSO

### ✅ OBJETIVOS

- **ESLint**: 0 erros, 0 warnings
- **TypeScript**: Build limpo sem erros
- **Next.js**: Build sem warnings
- **Testes**: 100% passando
- **Performance**: Bundle otimizado

### 📈 MELHORIAS ESPERADAS

- Redução do tamanho do bundle
- Melhoria no tempo de build
- Código mais limpo e legível
- Melhor cobertura de tipos
- Testes mais robustos

## 🚨 REGRAS IMPORTANTES

### ✅ PERMITIDO

- Corrigir erros de lint
- Resolver problemas de tipos
- Otimizar imports
- Corrigir testes
- Atualizar dependências seguras

### ❌ NÃO PERMITIDO

- Alterar funcionalidade existente
- Modificar lógica de negócio
- Alterar configurações de segurança
- Deletar arquivos importantes
- Modificar estrutura de pastas

## 🔄 FLUXO DE TRABALHO

1. **Fork** do repositório (se necessário)
2. **Clone** do branch `fix/frontend-stabilization`
3. **Análise** dos problemas atuais
4. **Correção** sistemática dos problemas
5. **Teste** de todas as correções
6. **Commit** das mudanças
7. **Push** para o branch
8. **Criação** do Pull Request

## 📞 SUPORTE

Se encontrar problemas complexos:

1. Documentar o problema encontrado
2. Criar issue no GitHub
3. Marcar com label `stabilization`
4. Descrever contexto e passos para reproduzir

---

**🎯 META**: Frontend 100% estável e pronto para produção!  
**⏰ PRAZO**: O mais rápido possível  
**🏆 RESULTADO**: Código limpo, testado e otimizado
