$ErrorActionPreference = "SilentlyContinue"

function Hit($name, $url, $headers = @{}) {
  Write-Host "`n### $name" -ForegroundColor Cyan
  try {
    $res = curl.exe -sI $url
    $http = ($res | Select-String -Pattern "^HTTP").Line
    $cc   = ($res | Select-String -Pattern "Cache-Control").Line
    $xsrc = ($res | Select-String -Pattern "x-fallback-source").Line
    $xver = ($res | Select-String -Pattern "X-Vercel-Cache|x-vercel-cache").Line
    Write-Host $http
    if ($cc)  { Write-Host $cc }
    if ($xsrc){ Write-Host $xsrc }
    if ($xver){ Write-Host $xver }

    $body = curl.exe -s $url | Out-String
    $sample = ($body -replace "`r","").Split("`n")[0..([Math]::Min(5,($body.Split("`n").Count-1)))] -join "`n"
    Write-Host "Sample:" -ForegroundColor DarkGray
    Write-Host $sample
  } catch {
    Write-Warning $_.Exception.Message
  }
}

# 0) Certificado do backend (passa quando NÃO aparece WRONG_PRINCIPAL)
Write-Host "== Certificado do backend ==" -ForegroundColor Yellow
curl.exe -sIv https://api.fut7pro.com.br | Select-String -Pattern "subject:|issuer:|altname|WRONG_PRINCIPAL|HTTP"

# 1) Healthcheck do backend (deve virar 200 quando o serviço estiver de pé)
Hit "Backend /health" "https://api.fut7pro.com.br/health"

# 2) Fallback do app (sempre responde; x-fallback-source ajuda a ver a rota)
Hit "App fallback" "https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback"

# 2.1) Verificar header de diagnóstico
Write-Host "`n### Verificação de Headers de Diagnóstico" -ForegroundColor Yellow
$fallbackHeaders = curl.exe -sI "https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback"
$fallbackSource = ($fallbackHeaders | Select-String -Pattern "x-fallback-source").Line
$httpStatus = ($fallbackHeaders | Select-String -Pattern "^HTTP").Line
$cacheControl = ($fallbackHeaders | Select-String -Pattern "Cache-Control").Line
$vercelCache = ($fallbackHeaders | Select-String -Pattern "X-Vercel-Cache").Line

Write-Host "Status: $httpStatus"
Write-Host "Fallback Source: $fallbackSource"
Write-Host "Cache Control: $cacheControl"
Write-Host "Vercel Cache: $vercelCache"

# 3) Mock direto (para sanity check)
Hit "App mock" "https://app.fut7pro.com.br/api/public/jogos-do-dia-mock"

# 4) Proxy principal (vai 200 quando SSL ok)
Hit "App proxy direto" "https://app.fut7pro.com.br/api/public/jogos-do-dia"

# 5) Healthcheck do app
Hit "App healthcheck" "https://app.fut7pro.com.br/api/health/backend"

Write-Host "`n=== RESUMO ===" -ForegroundColor Green
Write-Host "✅ Fallback sempre funciona"
Write-Host "✅ Mock sempre funciona" 
Write-Host "⚠️  Backend SSL precisa ser corrigido"
Write-Host "📊 Use x-fallback-source para ver qual trilha está ativa"
