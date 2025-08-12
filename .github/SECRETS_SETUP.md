# 🔐 Configuração de Secrets para GitHub Actions

## 📋 Secrets Necessários

Para que o workflow de CI/CD funcione completamente, você precisa configurar os seguintes secrets no repositório:

### 🔑 Secrets Obrigatórios

#### 1. **SNYK_TOKEN**

- **Descrição**: Token de API do Snyk para análise de segurança
- **Como obter**: [Snyk Account Settings](https://app.snyk.io/account)
- **Uso**: Job de Security Scan

#### 2. **VERCEL_TOKEN**

- **Descrição**: Token de deploy do Vercel
- **Como obter**: [Vercel Account Settings](https://vercel.com/account/tokens)
- **Uso**: Job de Deploy Preview

#### 3. **VERCEL_ORG_ID**

- **Descrição**: ID da organização no Vercel
- **Como obter**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Uso**: Job de Deploy Preview

#### 4. **VERCEL_PROJECT_ID**

- **Descrição**: ID do projeto no Vercel
- **Como obter**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Uso**: Job de Deploy Preview

#### 5. **SLACK_WEBHOOK_URL**

- **Descrição**: Webhook URL do Slack para notificações
- **Como obter**: [Slack App Directory](https://slack.com/apps)
- **Uso**: Job de Notificação

## 🛠️ Como Configurar

### 1. **Acesse as configurações do repositório**

```bash
GitHub → Seu Repositório → Settings → Secrets and variables → Actions
```

### 2. **Adicione cada secret**

- Clique em "New repository secret"
- Digite o nome do secret (ex: `SNYK_TOKEN`)
- Cole o valor do secret
- Clique em "Add secret"

### 3. **Verifique a configuração**

- Todos os secrets devem aparecer na lista
- Os nomes devem corresponder exatamente aos usados no workflow

## ⚠️ Warnings e Soluções

### **Context access might be invalid**

Este warning aparece quando o GitHub Actions não consegue validar se o secret existe. É **normal e esperado** para:

- Secrets que ainda não foram configurados
- Secrets de terceiros (Snyk, Vercel, Slack)

### **Soluções**

1. **Configure todos os secrets** listados acima
2. **Ignore os warnings** - eles não impedem o funcionamento
3. **Use secrets opcionais** apenas quando necessário

## 🚀 Workflow sem Secrets

O workflow funcionará **parcialmente** mesmo sem todos os secrets:

- ✅ **Code Quality**: ESLint, TypeScript, Prettier
- ✅ **Tests**: Jest e cobertura
- ✅ **Build**: Next.js build
- ✅ **Bundle Analysis**: Análise de tamanho

- ⚠️ **Security**: Snyk scan (falhará sem token)
- ⚠️ **Deploy**: Vercel preview (falhará sem tokens)
- ⚠️ **Notifications**: Slack (falhará sem webhook)

## 🔒 Segurança

### **Nunca commite secrets**

- Use sempre o sistema de secrets do GitHub
- Não coloque tokens em arquivos de código
- Revogue tokens comprometidos imediatamente

### **Permissões mínimas**

- **Snyk**: Apenas leitura de vulnerabilidades
- **Vercel**: Apenas deploy de preview
- **Slack**: Apenas envio de mensagens

## 📊 Monitoramento

### **Verificar execução**

- Acesse a aba "Actions" do repositório
- Monitore os jobs que falharam
- Verifique se os secrets estão configurados

### **Logs de erro**

- Jobs sem secrets mostrarão erro de "secret not found"
- Configure o secret correspondente
- Re-execute o workflow

## 🎯 Próximos Passos

1. **Configure os secrets** conforme listado acima
2. **Teste o workflow** fazendo um push ou PR
3. **Monitore a execução** na aba Actions
4. **Ajuste configurações** conforme necessário

---

**💡 Dica**: Configure os secrets um por vez para identificar qual está causando problemas específicos.
