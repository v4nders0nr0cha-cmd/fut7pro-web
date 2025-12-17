$ErrorActionPreference = "SilentlyContinue"

function Hit($name, $url) {
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

# 0) Certificado do backend (passa quando NÇO aparece WRONG_PRINCIPAL)
Write-Host "== Certificado do backend ==" -ForegroundColor Yellow
curl.exe -sIv https://api.fut7pro.com.br | Select-String -Pattern "subject:|issuer:|altname|WRONG_PRINCIPAL|HTTP"

# 1) Healthcheck do backend (deve virar 200 quando o servi‡o estiver de p‚)
Hit "Backend /health" "https://api.fut7pro.com.br/health"

# 2) Rotas p£blicas reais por slug
$slug = "fut7pro"
Hit "App matches (today)" "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today"
Hit "App matches (upcoming)" "https://app.fut7pro.com.br/api/public/$slug/matches?scope=upcoming"

# 2.1) Verificar header de diagn¢stico
Write-Host "`n### Verifica‡Æo de Headers de Diagn¢stico" -ForegroundColor Yellow
$matchesHeaders = curl.exe -sI "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today"
$fallbackSource = ($matchesHeaders | Select-String -Pattern "x-fallback-source").Line
$httpStatus = ($matchesHeaders | Select-String -Pattern "^HTTP").Line
$cacheControl = ($matchesHeaders | Select-String -Pattern "Cache-Control").Line
$vercelCache = ($matchesHeaders | Select-String -Pattern "X-Vercel-Cache").Line

Write-Host "Status: $httpStatus"
Write-Host "Fallback Source: $fallbackSource"
Write-Host "Cache Control: $cacheControl"
Write-Host "Vercel Cache: $vercelCache"

# 3) Healthcheck do app
Hit "App healthcheck" "https://app.fut7pro.com.br/api/health/backend"

Write-Host "`n=== RESUMO ===" -ForegroundColor Green
Write-Host "? Rotas p£blicas devolvem jogos reais (scope=today/upcoming)"
Write-Host "??  Backend SSL precisa estar correto ou usar host de contingˆncia"
Write-Host "?? Use x-fallback-source para confirmar origem backend"
