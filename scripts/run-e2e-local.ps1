param(
  [string]$Slug = "demo-rachao",
  [string]$BaseUrl = "http://localhost:3000",
  [string]$RachaPath = "/rachas/demo-rachao",
  [switch]$KeepDb # se passado, não derruba o Postgres no final
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Wait-Http($url, $timeoutSec = 120) {
  $stopAt = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $stopAt) {
    try {
      $res = Invoke-WebRequest -UseBasicParsing -Method GET -Uri $url -TimeoutSec 5
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) { return $true }
    } catch { Start-Sleep -Milliseconds 500 }
  }
  return $false
}

Write-Host "`n== 0) Ambiente ==" -ForegroundColor Cyan
Write-Host "Slug........: $Slug"
Write-Host "BaseUrl.....: $BaseUrl"
Write-Host "RachaPath...: $RachaPath"
Write-Host "KeepDb......: $KeepDb`n"

# 1) DB up
Write-Host "== 1) Subindo Postgres (npm run db:up) ==" -ForegroundColor Cyan
npm run db:up | Out-Null

# 2) migrate + seed campeões
Write-Host "`n== 2) Migration + Seed (npm run dev:migrate-seed -Slug $Slug) ==" -ForegroundColor Cyan
npm run dev:migrate-seed -Slug $Slug

# 3) subir Next (npm run dev) em background
Write-Host "`n== 3) Subindo Next (npm run dev) ==" -ForegroundColor Cyan
$next = Start-Process -FilePath "npm" -ArgumentList "run","dev" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 2

Write-Host "Aguardando aplicação responder..."
# tenta múltiplos endpoints saudáveis para maior resiliência
$healthUrls = @(
  "$BaseUrl/api/health/backend",
  "$BaseUrl/api/health/ping",
  "$BaseUrl/"
)
$alive = $false
foreach ($u in $healthUrls) {
  if (Wait-Http -url $u -timeoutSec 120) { $alive = $true; break }
}
if (-not $alive) {
  Write-Warning "App não respondeu a tempo. Tentando logs e encerrando..."
  try { Get-Content -Path ".next/server/pages/index.js" -TotalCount 5 | Out-Null } catch {}
  throw "Next não ficou pronto em 120s."
}

# 4) smoke campeões (confirma API antes do E2E)
Write-Host "`n== 4) Smoke campeões (scripts/smoke-campeoes.ts) ==" -ForegroundColor Cyan
$env:BASE_URL = $BaseUrl
$env:SLUG = $Slug
npx tsx scripts/smoke-campeoes.ts

# 5) E2E: Times do Dia, Estatísticas, Os Campeões
Write-Host "`n== 5) Playwright E2E (Times, Estatísticas, Os Campeões) ==" -ForegroundColor Cyan
$env:PLAYWRIGHT_BASE_URL = $BaseUrl
$env:RACHA_PATH = $RachaPath
# usa a config que você já tem (tests/playwright.times.config.ts)
npx playwright install
npx playwright test -c tests/playwright.times.config.ts tests/e2e/times-do-dia.spec.ts
npx playwright test -c tests/playwright.times.config.ts tests/e2e/estatisticas.spec.ts
npx playwright test -c tests/playwright.times.config.ts tests/e2e/os-campeoes.spec.ts

Write-Host "`n== ✅ E2E finalizados com sucesso ==" -ForegroundColor Green

# 6) cleanup
Write-Host "`n== 6) Encerrando Next e limpando banco ==" -ForegroundColor Cyan
try { Stop-Process -Id $next.Id -Force -ErrorAction SilentlyContinue } catch {}
if (-not $KeepDb) {
  npm run db:down | Out-Null
  Write-Host "Postgres finalizado (db:down)."
} else {
  Write-Host "Mantendo Postgres ativo (KeepDb)."
}
