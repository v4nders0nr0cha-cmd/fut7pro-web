#!/bin/bash

# Script para configurar variaveis de ambiente
echo "[setup] Configurando variaveis de ambiente..."

cat > .env.local <<'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
BACKEND_URL=https://api.fut7pro.com.br

# Mercado Pago (opcional - para desenvolvimento local)
NEXT_PUBLIC_MP_PUBLIC_KEY=your_mp_public_key_here

# Tenant ID (em producao, viria do contexto de autenticacao)
NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant

# Environment
NODE_ENV=development
EOF

echo "[setup] Arquivo .env.local criado com sucesso!"
echo ""
echo "[setup] Variaveis configuradas:"
echo "  - NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br"
echo "  - BACKEND_URL=https://api.fut7pro.com.br"
echo "  - NEXT_PUBLIC_DEMO_TENANT_ID=demo-tenant"
echo "  - NODE_ENV=development"
echo ""
echo "[setup] Para iniciar o projeto execute: pnpm dev"
echo "[setup] Consulte ENV_SETUP.md para mais detalhes."
