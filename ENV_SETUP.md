# Configuração de Variáveis de Ambiente

## Arquivo .env.local

Crie o arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br

# Mercado Pago (opcional - para desenvolvimento local)
NEXT_PUBLIC_MP_PUBLIC_KEY=your_mp_public_key_here

# Tenant ID (em produção, viria do contexto de autenticação)
NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant

# Environment
NODE_ENV=development
```

## Variáveis Explicadas

### `NEXT_PUBLIC_API_URL`

- **Descrição**: URL da API do backend
- **Valor**: `https://api.fut7pro.com.br`
- **Obrigatório**: Sim

### `NEXT_PUBLIC_MP_PUBLIC_KEY`

- **Descrição**: Chave pública do Mercado Pago (opcional)
- **Valor**: Sua chave pública do MP
- **Obrigatório**: Não (para desenvolvimento)

### `NEXT_PUBLIC_DEMO_TENANT_ID`

- **Descrição**: ID do tenant para demonstração
- **Valor**: `demo-tenant`
- **Obrigatório**: Sim (para desenvolvimento)

### `NODE_ENV`

- **Descrição**: Ambiente de execução
- **Valor**: `development` ou `production`
- **Obrigatório**: Sim

## Como Configurar

1. **Copie o arquivo de exemplo:**

   ```bash
   cp .env.example .env.local
   ```

2. **Edite as variáveis conforme necessário:**

   ```bash
   # Edite o arquivo .env.local
   nano .env.local
   ```

3. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Verificação

Para verificar se as variáveis estão carregadas corretamente:

1. **Acesse**: `http://localhost:3000/admin/financeiro/planos-limites`
2. **Verifique**: Se a API está sendo chamada corretamente
3. **Console**: Verifique se não há erros de configuração

## Produção

Em produção, configure as variáveis no seu provedor de hospedagem:

- **Vercel**: Environment Variables no dashboard
- **Netlify**: Site settings > Environment variables
- **Render**: Environment tab

## Troubleshooting

### Erro: "API Error: 404"

- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Confirme se a API está rodando

### Erro: "Tenant ID não encontrado"

- Verifique se `NEXT_PUBLIC_DEMO_TENANT_ID` está definido
- Em produção, integre com sistema de autenticação

### Erro: "CORS"

- Verifique se a API permite requisições do frontend
- Confirme as configurações de CORS no backend
