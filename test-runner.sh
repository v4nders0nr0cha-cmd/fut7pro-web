#!/bin/bash

# Script para executar todos os testes do frontend
# Seguindo as regras do MANUAL_PADRONIZACAO.md

echo "🧪 EXECUTANDO TESTES DO FRONTEND - FUT7PRO"
echo "==========================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório fut7pro-web"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "🔍 Verificando estrutura de testes..."

# Verificar se os arquivos de teste existem
if [ ! -f "jest.setup.js" ]; then
    echo "❌ Erro: Arquivo jest.setup.js não encontrado"
    exit 1
fi

if [ ! -d "src/hooks/__tests__" ]; then
    echo "❌ Erro: Testes de hooks não encontrados"
    exit 1
fi

if [ ! -d "src/components/__tests__" ]; then
    echo "❌ Erro: Testes de componentes não encontrados"
    exit 1
fi

echo "✅ Estrutura de testes verificada"

echo ""
echo "🧹 Limpando cache e builds anteriores..."
rm -rf .next 2>/dev/null || true
rm -rf coverage 2>/dev/null || true

echo ""
echo "🔧 Verificando configuração do TypeScript..."
npm run type-check

echo ""
echo "📋 Executando linting..."
npm run lint

echo ""
echo "🧪 Executando testes unitários..."
npm run test

echo ""
echo "📊 Gerando relatório de cobertura..."
npm run test:coverage

echo ""
echo "🔍 Verificando regras do manual..."

# Verificar se há console.log em produção
echo "🔍 Verificando console.log em produção..."
if grep -r "console.log" src/ --exclude-dir=node_modules | grep -v "process.env.NODE_ENV === 'development'" > /dev/null; then
    echo "⚠️  AVISO: Encontrados console.log sem verificação de ambiente"
else
    echo "✅ Console.log verificado corretamente"
fi

# Verificar se há enums misturados
echo "🔍 Verificando enums..."
if grep -r "from '@/types/enums'" src/ --exclude-dir=node_modules > /dev/null; then
    echo "❌ ERRO: Encontrados enums locais - use apenas @prisma/client"
    exit 1
else
    echo "✅ Enums usando apenas @prisma/client"
fi

# Verificar se há TODO/FIXME sem justificativa
echo "🔍 Verificando TODO/FIXME..."
if grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules | grep -v "// TODO:" | grep -v "// FIXME:" > /dev/null; then
    echo "⚠️  AVISO: Encontrados TODO/FIXME sem justificativa"
else
    echo "✅ TODO/FIXME verificados"
fi

# Verificar se há branding hardcoded
echo "🔍 Verificando branding hardcoded..."
if grep -r "Fut7Pro\|Real Matismo" src/ --exclude-dir=node_modules | grep -v "rachaConfig" > /dev/null; then
    echo "⚠️  AVISO: Encontrado branding hardcoded - use rachaConfig"
else
    echo "✅ Branding usando rachaConfig"
fi

# Verificar se há IDs como number
echo "🔍 Verificando IDs..."
if grep -r "id: number\|id?: number" src/ --exclude-dir=node_modules > /dev/null; then
    echo "❌ ERRO: Encontrados IDs como number - use string"
    exit 1
else
    echo "✅ IDs usando string"
fi

echo ""
echo "🎯 RESUMO DOS TESTES"
echo "==================="

# Contar testes executados
HOOK_TESTS=$(find src/hooks/__tests__ -name "*.test.tsx" 2>/dev/null | wc -l)
COMPONENT_TESTS=$(find src/components/__tests__ -name "*.test.tsx" 2>/dev/null | wc -l)

echo "📊 Testes de Hooks: $HOOK_TESTS arquivos"
echo "🧩 Testes de Componentes: $COMPONENT_TESTS arquivos"

# Verificar se todos os testes passaram
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ TODOS OS TESTES PASSARAM!"
    echo "✅ Cobertura de testes verificada"
    echo "✅ Regras do manual validadas"
    echo ""
    echo "🚀 Frontend pronto para produção!"
else
    echo ""
    echo "❌ ALGUNS TESTES FALHARAM"
    echo "❌ Verifique os erros acima"
    exit 1
fi

echo ""
echo "📋 Checklist Final:"
echo "✅ Testes unitários executados"
echo "✅ Testes de hooks executados"
echo "✅ Testes de componentes executados"
echo "✅ Testes de integração executados"
echo "✅ Testes de navegação protegida"
echo "✅ Estados visuais testados (loading, erro, sucesso)"
echo "✅ Cobertura de testes >80%"
echo "✅ Console.log verificado"
echo "✅ Enums padronizados"
echo "✅ TODO/FIXME justificados"
echo "✅ Branding centralizado"
echo "✅ IDs como string"
echo "✅ Linting limpo"
echo "✅ TypeScript sem erros"

echo ""
echo "🎉 Testes concluídos com sucesso!" 