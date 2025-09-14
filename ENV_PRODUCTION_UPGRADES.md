# Variáveis de Ambiente - Upgrades de Produção

## ✅ Implementado

### 1. Dados Estruturados (JSON-LD)

- ✅ Componente `JsonLd.tsx` criado
- ✅ Integrado no layout público
- ✅ Schema.org Organization + WebSite
- ✅ Redes sociais configuradas

### 2. CI de SEO (GitHub Actions)

- ✅ Workflow `.github/workflows/seo-ci.yml`
- ✅ Testes automáticos em PRs
- ✅ Validação de headers SEO

### 3. Proxy Server-Side

- ✅ API route `/api/public/jogos-do-dia`
- ✅ Hook `useJogosDoDia` criado
- ✅ Integrado na página principal

## 🔧 Variáveis de Ambiente Necessárias

### Vercel (Project Settings → Environment Variables)

```bash
# Backend URL (para proxy server-side)
BACKEND_URL=https://api.fut7pro.com.br

# URLs públicas (já configuradas)
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
NEXTAUTH_URL=https://app.fut7pro.com.br
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-secret-here

# Google OAuth (já configuradas)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Environment
NODE_ENV=production
```

## 🚀 Benefícios dos Upgrades

### 1. SEO Melhorado

- **Rich Results**: Dados estruturados para melhor exibição no Google
- **Brand Recognition**: Schema.org Organization
- **Search Actions**: Busca integrada (se implementada)

### 2. Segurança Aprimorada

- **CSP Compliance**: Sem `unsafe-inline` para chamadas externas
- **CORS Protection**: Backend não exposto no browser
- **Proxy Control**: Cache e rate limiting server-side

### 3. CI/CD Robusto

- **Anti-Regressão**: Testes automáticos de SEO
- **Quality Gate**: PRs bloqueados se headers quebrarem
- **Monitoramento**: Relatórios automáticos

## 📊 Testes

```bash
# Testar proxy server-side
curl https://app.fut7pro.com.br/api/public/jogos-do-dia

# Testar dados estruturados
curl https://app.fut7pro.com.br | grep -A 20 "application/ld+json"

# Executar testes SEO
npm run test:seo
```

## 🔄 Próximos Passos

1. **Configurar BACKEND_URL** no Vercel
2. **Testar proxy** em produção
3. **Verificar dados estruturados** no Google Rich Results Test
4. **Configurar Google Search Console** com sitemap
5. **Criar imagem OG real** (1200x630px)

## 📈 Monitoramento

### Headers para verificar:

```bash
# Home (sem X-Robots-Tag)
curl -I https://app.fut7pro.com.br

# Admin (com X-Robots-Tag)
curl -I https://app.fut7pro.com.br/admin/login

# Proxy funcionando
curl -I https://app.fut7pro.com.br/api/public/jogos-do-dia
```

### URLs importantes:

- Home: https://app.fut7pro.com.br
- Robots: https://app.fut7pro.com.br/robots.txt
- Sitemap: https://app.fut7pro.com.br/sitemap.xml
- Proxy: https://app.fut7pro.com.br/api/public/jogos-do-dia
