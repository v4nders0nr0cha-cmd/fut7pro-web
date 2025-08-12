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

## 🛠️ Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/fut7pro-web.git
cd fut7pro-web
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

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

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Configurações do Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/fut7pro"
```

4. **Configure o banco de dados**

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o projeto.

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

# Utilitários
npm run clean            # Remove arquivos de build
npm run analyze          # Analisa bundle size
```

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

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@fut7pro.com
- **Documentação**: [docs.fut7pro.com](https://docs.fut7pro.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fut7pro-web/issues)

## 🎯 Roadmap

- [ ] PWA completo
- [ ] Notificações push
- [ ] Integração com pagamentos
- [ ] App mobile nativo
- [ ] IA para balanceamento de times
- [ ] Streaming de partidas

---

**Fut7Pro** - O jogo começa aqui! ⚽
