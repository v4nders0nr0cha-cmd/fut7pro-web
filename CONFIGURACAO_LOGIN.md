# 🔐 Configuração de Login - Fut7Pro Web

## ✅ **CORREÇÕES IMPLEMENTADAS:**

### **1. URLs da API Corrigidas**

- ✅ **Antes:** `${API_BASE_URL}/api/auth/login` ❌
- ✅ **Depois:** `${API_BASE_URL}/auth/login` ✅
- ✅ **Antes:** `${API_BASE_URL}/api/auth/me` ❌
- ✅ **Depois:** `${API_BASE_URL}/auth/me` ✅
- ✅ **Antes:** `${API_BASE_URL}/api/auth/refresh` ❌
- ✅ **Depois:** `${API_BASE_URL}/auth/refresh` ✅

### **2. URL da API Atualizada**

- ✅ **Antes:** `http://localhost:3001` (desenvolvimento)
- ✅ **Depois:** `https://fut7pro-backend.onrender.com` (produção)
- ✅ **Fallback:** Configurável via `NEXT_PUBLIC_API_URL`

### **3. Arquivos Modificados**

- ✅ **`src/lib/auth.ts`** - URLs da API corrigidas
- ✅ **`env.example`** - URL da API atualizada

## 🔧 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS:**

Crie um arquivo `.env.local` na raiz do projeto `fut7pro-web`:

```env
# Configurações do Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://fut7pro-backend.onrender.com

# Configurações de Autenticação
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Configurações de Ambiente
NODE_ENV=development
```

## 🚀 **COMO TESTAR:**

### **1. Instalar dependências:**

```bash
cd fut7pro-web
npm install
```

### **2. Configurar variáveis de ambiente:**

```bash
# Copiar o arquivo de exemplo
cp env.example .env.local

# Editar as variáveis conforme necessário
```

### **3. Executar o projeto:**

```bash
npm run dev
```

### **4. Testar login:**

1. Acesse `http://localhost:3000/login`
2. Use as credenciais:
   - **Email:** `vanderson_r0cha@hotmail.com`
   - **Senha:** `Du3listbr321####`

## 🔍 **FLUXO DE AUTENTICAÇÃO CORRIGIDO:**

### **1. Login:**

1. Usuário preenche email e senha
2. NextAuth chama `authorize()` com as credenciais
3. `authorize()` faz POST para `https://fut7pro-backend.onrender.com/auth/login`
4. Backend retorna `accessToken` e `refreshToken`
5. `authorize()` faz GET para `https://fut7pro-backend.onrender.com/auth/me`
6. NextAuth cria sessão com os dados do usuário

### **2. Refresh Token:**

1. NextAuth verifica se o token está próximo do vencimento
2. Se necessário, chama `https://fut7pro-backend.onrender.com/auth/refresh`
3. Backend retorna novos tokens
4. Sessão é atualizada com os novos tokens

## 🐛 **PROBLEMAS RESOLVIDOS:**

### **❌ "Login inválido" - CAUSA RAIZ:**

1. **URL incorreta:** `/api/auth/login` → `/auth/login`
2. **URL incorreta:** `/api/auth/me` → `/auth/me`
3. **URL incorreta:** `/api/auth/refresh` → `/auth/refresh`
4. **URL da API:** `http://localhost:3001` → `https://fut7pro-backend.onrender.com`

### **✅ SOLUÇÃO IMPLEMENTADA:**

1. **URLs corrigidas** em `src/lib/auth.ts`
2. **URL da API atualizada** para produção
3. **Fallback configurável** via variável de ambiente
4. **Documentação completa** para configuração

## 🛠️ **PRÓXIMOS PASSOS:**

### **1. Configurar variáveis de ambiente em produção:**

- `NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br` (quando estiver pronto)
- `NEXTAUTH_URL=https://app.fut7pro.com.br`
- `NEXTAUTH_SECRET=chave-secreta-forte`

### **2. Testar em produção:**

- Verificar se o login funciona com a URL do Render
- Verificar se o refresh token funciona
- Verificar se a sessão persiste

### **3. Monitorar logs:**

- Verificar console do navegador para erros
- Verificar logs do backend para requisições
- Verificar logs do NextAuth para problemas de sessão

## 🔍 **VERIFICAÇÃO FINAL:**

### **Teste manual:**

```bash
# Testar endpoint de login
curl -X POST "https://fut7pro-backend.onrender.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vanderson_r0cha@hotmail.com","password":"Du3listbr321####"}'

# Deve retornar 200 OK com accessToken e refreshToken
```

### **Teste no frontend:**

1. Acesse a página de login
2. Preencha as credenciais
3. Clique em "Entrar"
4. Deve redirecionar para a área administrativa
5. Verifique se a sessão persiste ao recarregar a página
