# Fut7Pro Web — Notas de Arquitetura de Dados

- O frontend não deve acessar banco de dados diretamente em produção.
- O módulo `src/lib/prisma.ts` é um stub para evitar uso de `PrismaClient` no runtime do Next.js.
- Todas as operações de dados devem passar pela API do backend `NEXT_PUBLIC_API_URL`.
- As rotas sob `src/pages/api/*` existem apenas para ambientes locais de desenvolvimento; em produção, essas rotas devem ser desativadas ou delegar ao backend.

# 🏆 Fut7Pro - Sistema para Racha, Fut7 e Futebol Amador

Fut7Pro é o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Uma plataforma SaaS completa para gerenciar rachas, estatísticas, partidas e muito mais.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilização**: Tailwind CSS
- **Autenticação**: NextAuth.js
- **Cache**: SWR
- **Validação**: Zod
- **Banco de Dados**: Prisma + PostgreSQL
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL
- Git

## 🛠️ Instalação Rápida

### 1. **Clone e Setup**

```bash
git clone https://github.com/v4nders0nr0cha-cmd/fut7pro-web.git
cd fut7pro-web
npm install
```

### 2. **Configure as variáveis de ambiente**

```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Configurações do Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Configurações de Autenticação
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o projeto.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Inicia servidor de produção

# Qualidade de Código
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas do ESLint
npm run format           # Formata código com Prettier
npm run type-check       # Verifica tipos TypeScript

# Testes
npm run test             # Executa testes
npm run test:watch       # Executa testes em modo watch
npm run test:coverage    # Executa testes com cobertura

# Banco de Dados
npm run db:generate      # Gera cliente Prisma
npm run db:push          # Sincroniza schema com banco
npm run db:migrate       # Executa migrações
npm run db:studio        # Abre Prisma Studio
npm run db:seed          # Popula banco com dados iniciais
```

## 🤖 GitHub Connector & ChatGPT

### 🔗 Configuração Ativa

Este repositório está configurado para uso com o **GitHub Connector do ChatGPT** com permissões de **Read & Write**.

### 📋 Como Usar

1. **No ChatGPT**: Ativar o GitHub Connector
2. **Selecionar**: `v4nders0nr0cha-cmd/fut7pro-web`
3. **Permissões**: Read & Write ativadas
4. **Branch**: Trabalhar em `fix/frontend-stabilization`

### 🎯 PR de Estabilização Ativo

**Branch**: `fix/frontend-stabilization`  
**Status**: 🟡 Aguardando correções  
**Objetivo**: Frontend 100% estável

#### 📋 Tarefas para o ChatGPT:

1. **🔧 ESLint**: Corrigir todos os erros e warnings
2. **🎯 TypeScript**: Resolver problemas de tipos
3. **🏗️ Build**: Limpar warnings do Next.js
4. **🧪 Testes**: Corrigir falhas e melhorar cobertura
5. **📦 Dependências**: Atualizar e auditar segurança

#### 📖 Instruções Detalhadas

Veja o arquivo [`CHATGPT_STABILIZATION_INSTRUCTIONS.md`](./CHATGPT_STABILIZATION_INSTRUCTIONS.md) para instruções completas.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (admin)/           # Rotas do painel admin
│   ├── (public)/          # Rotas públicas
│   ├── (superadmin)/      # Rotas do superadmin
│   └── api/               # API Routes
├── components/             # Componentes React
│   ├── admin/             # Componentes específicos do admin
│   ├── cards/             # Cards reutilizáveis
│   ├── layout/            # Componentes de layout
│   └── ui/                # Componentes de UI básicos
├── context/               # Contextos React
├── hooks/                 # Hooks customizados
├── lib/                   # Utilitários e configurações
├── types/                 # Definições de tipos TypeScript
└── styles/                # Estilos globais
```

## 🚀 CI/CD Pipeline

### 🔄 GitHub Actions

O projeto possui um workflow completo de CI/CD configurado em `.github/workflows/frontend-ci.yml`:

- **Node 20**: Versão LTS mais recente
- **Cache**: Dependências otimizadas
- **Jobs**: Qualidade, testes, build, segurança
- **Preview**: Deploy automático para PRs
- **Notificações**: Slack integrado

### 📊 Status dos Workflows

- ✅ **Code Quality**: ESLint + TypeScript + Prettier
- ✅ **Tests**: Jest + Coverage + E2E
- ✅ **Build**: Next.js + Bundle Analysis
- ✅ **Security**: npm audit + Snyk
- ✅ **Deploy**: Vercel Preview

## 🏗️ Arquitetura

### Frontend

- **Next.js 15**: App Router, Server Components, API Routes
- **TypeScript**: Tipagem forte em todo o projeto
- **Tailwind CSS**: Sistema de design responsivo
- **SWR**: Cache inteligente e sincronização de dados
- **Zod**: Validação de dados em runtime

### Segurança

- **Headers de Segurança**: CSP, HSTS, X-Frame-Options
- **Rate Limiting**: Proteção contra ataques DDoS
- **Validação**: Todos os dados são validados com Zod
- **Error Boundaries**: Captura e tratamento de erros

### Performance

- **Otimização de Imagens**: Next.js Image com formatos modernos
- **Code Splitting**: Carregamento sob demanda
- **Cache Inteligente**: SWR com revalidação automática
- **Bundle Optimization**: Tree shaking e minificação

## 🔐 Autenticação

O sistema usa NextAuth.js com múltiplos providers:

- **Google OAuth**: Login com Google
- **Credentials**: Login com email/senha
- **JWT**: Tokens seguros
- **Middleware**: Proteção de rotas

## 📊 Funcionalidades

### Site Público

- ✅ Página inicial com destaques
- ✅ Estatísticas completas
- ✅ Perfil de atletas
- ✅ Histórico de partidas
- ✅ Sistema de comunicação
- ✅ Sorteio inteligente

### Painel Admin

- ✅ Dashboard completo
- ✅ Gestão de jogadores
- ✅ Criação de partidas
- ✅ Sistema financeiro
- ✅ Comunicação interna
- ✅ Relatórios

### Painel SuperAdmin

- ✅ Visão global do SaaS
- ✅ Métricas de negócio
- ✅ Gestão de rachas
- ✅ Monitoramento
- ✅ Suporte

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

- **Netlify**: Suporte completo
- **Railway**: Deploy fácil
- **DigitalOcean**: App Platform
- **AWS**: Amplify ou EC2

## 📈 Monitoramento

- **Error Tracking**: Sentry (configurável)
- **Analytics**: Google Analytics
- **Performance**: Vercel Analytics
- **Logs**: Estruturados e centralizados

## 🤝 Contribuição

### 🔄 Fluxo de Trabalho

1. **Fork** o projeto
2. **Clone** o repositório
3. **Crie** uma branch para sua feature
4. **Faça** as mudanças necessárias
5. **Teste** suas alterações
6. **Commit** suas mudanças
7. **Push** para a branch
8. **Abra** um Pull Request

### 📝 Padrões de Commit

```bash
# Formato
type(scope): description

# Exemplos
feat(auth): adiciona autenticação com Google OAuth
fix(admin): corrige bug na listagem de jogadores
docs(readme): atualiza instruções de instalação
style(components): formata código com Prettier
refactor(hooks): refatora useAuth para melhor performance
test(admin): adiciona testes para AdminPanel
chore(deps): atualiza dependências de desenvolvimento
```

### 🏷️ Labels para Issues/PRs

- `frontend` - Mudanças no frontend
- `enhancement` - Novas funcionalidades
- `bug` - Correções de bugs
- `documentation` - Atualizações de docs
- `stabilization` - Trabalho de estabilização
- `connector` - Questões do GitHub Connector

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@fut7pro.com
- **Documentação**: [docs.fut7pro.com](https://docs.fut7pro.com)
- **Issues**: [GitHub Issues](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/discussions)

## 🎯 Roadmap

- [ ] PWA completo
- [ ] Notificações push
- [ ] Integração com pagamentos
- [ ] App mobile nativo
- [ ] IA para balanceamento de times
- [ ] Streaming de partidas

## 🔄 Status do Projeto

### ✅ Concluído

- [x] Estrutura base do Next.js
- [x] Componentes principais
- [x] Rotas e páginas
- [x] Sistema de autenticação
- [x] CI/CD Pipeline
- [x] GitHub Connector configurado

### 🟡 Em Andamento

- [ ] Estabilização do frontend
- [ ] Correção de lint e TypeScript
- [ ] Otimização de performance
- [ ] Cobertura de testes

### 📋 Próximos Passos

1. **Estabilização**: ChatGPT corrige problemas de qualidade
2. **Testes**: Cobertura completa e testes E2E
3. **Performance**: Otimização de bundle e métricas
4. **Deploy**: Configuração de staging e produção

---

**Fut7Pro** - O jogo começa aqui! ⚽

---

## 🚨 Notas Importantes

### ⚠️ Desenvolvimento Local

- O frontend não deve acessar banco de dados diretamente em produção
- Use `env.example` como base para `.env.local`
- Configure `NEXT_PUBLIC_API_URL` para apontar para o backend

### 🔒 Segurança

- Nunca commite arquivos `.env` com secrets
- Use variáveis de ambiente para configurações sensíveis
- Configure rate limiting e headers de segurança

### 🧪 Testes

- Execute testes antes de cada commit
- Mantenha cobertura de testes acima de 80%
- Use mocks para dependências externas
