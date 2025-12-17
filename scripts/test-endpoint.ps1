# Script de teste para validar endpoints e configurações sem mock
# Execute no PowerShell: .\scripts\test-endpoint.ps1

Write-Host "🔎 Testando endpoints e configurações" -ForegroundColor Yellow
Write-Host ""

$slug = "fut7pro" # ajuste para o racha que deseja validar

# Teste healthcheck do backend
Write-Host "0. Testando healthcheck do backend..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "https://app.fut7pro.com.br/api/health/backend" -UseBasicParsing
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "✅ Healthcheck Status: $($healthData.status)" -ForegroundColor Green
    Write-Host "   Backend: $($healthData.backend)" -ForegroundColor Gray
    if ($healthData.endpoint) {
        Write-Host "   Endpoint funcionando: $($healthData.endpoint)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Healthcheck Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste HEAD request (rota oficial de partidas públicas)
Write-Host "1. Testando HEAD request..." -ForegroundColor Cyan
try {
    $headResponse = Invoke-WebRequest -Uri "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today" -Method HEAD -UseBasicParsing
    Write-Host "✅ HEAD Status: $($headResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Cache-Control: $($headResponse.Headers['Cache-Control'])" -ForegroundColor Gray
    Write-Host "   x-fallback-source: $($headResponse.Headers['x-fallback-source'])" -ForegroundColor Gray
} catch {
    Write-Host "❌ HEAD Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste GET request (dados reais)
Write-Host "2. Testando GET request..." -ForegroundColor Cyan
try {
    $getResponse = Invoke-WebRequest -Uri "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today" -UseBasicParsing
    Write-Host "✅ GET Status: $($getResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Cache-Control: $($getResponse.Headers['Cache-Control'])" -ForegroundColor Gray
    Write-Host "   Content-Type: $($getResponse.Headers['Content-Type'])" -ForegroundColor Gray
    Write-Host "   x-fallback-source: $($getResponse.Headers['x-fallback-source'])" -ForegroundColor Gray
    
    # Tentar parsear JSON
    try {
        $jsonData = $getResponse.Content | ConvertFrom-Json
        Write-Host "✅ JSON válido - $($jsonData.Count) itens" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Resposta não é JSON válido" -ForegroundColor Yellow
        Write-Host "   Conteúdo: $($getResponse.Content.Substring(0, [Math]::Min(100, $getResponse.Content.Length)))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ GET Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Teste de cache bust
Write-Host "3. Testando cache bust..." -ForegroundColor Cyan
$cacheBust = Get-Random
try {
    $bustResponse = Invoke-WebRequest -Uri "https://app.fut7pro.com.br/?cb=$cacheBust" -Method HEAD -UseBasicParsing
    Write-Host "✅ Cache bust Status: $($bustResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   X-Robots-Tag: $($bustResponse.Headers['X-Robots-Tag'])" -ForegroundColor Gray
    if ($bustResponse.Headers['X-Robots-Tag']) {
        Write-Host "⚠️  Home tem X-Robots-Tag (não deveria)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Home sem X-Robots-Tag (correto)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Cache bust Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Yellow
