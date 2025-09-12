#!/bin/bash

# Script para configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."

# Criar arquivo .env.local
cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br

# Mercado Pago (opcional - para desenvolvimento local)
NEXT_PUBLIC_MP_PUBLIC_KEY=your_mp_public_key_here

# Tenant ID (em produção, viria do contexto de autenticação)
NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant

# Environment
NODE_ENV=development
EOF

echo "✅ Arquivo .env.local criado com sucesso!"
echo ""
echo "📋 Variáveis configuradas:"
echo "  - NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br"
echo "  - NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant"
echo "  - NODE_ENV=development"
echo ""
echo "🚀 Para testar, execute:"
echo "  npm run dev"
echo ""
echo "📖 Para mais informações, consulte ENV_SETUP.md"

