param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [int]$TimeoutSec = 10
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Run-Step($name, [scriptblock]$fn) {
  Write-Host "▶ $name" -ForegroundColor Cyan
  try { & $fn; Write-Host "✔ $name" -ForegroundColor Green }
  catch {
    Write-Host "✖ $name" -ForegroundColor Red
    throw
  }
}

function Has-Script($name) {
  try {
    $pkg = Get-Content -Raw .\package.json | ConvertFrom-Json
    return $pkg.scripts.PSObject.Properties.Name -contains $name
  } catch { return $false }
}

function Http($url, $method='GET', $expectAny=@(200)) {
  $args = @('-sS','-o','NUL','-w','%{http_code}','--connect-timeout','2','--max-time',[string]$TimeoutSec,'-X',$method,$url)
  try { $code = & curl.exe @args } catch { $code = "0" }
  $ok = ($expectAny -contains [int]$code)
  [pscustomobject]@{ Method=$method; Url=$url; Expect=($expectAny -join '|'); Got=[int]$code; Result= if($ok){'PASS'}else{'FAIL'} }
}

# 0) Ambiente mínimo
Run-Step "Check env vars" {
  if (-not $env:NEXT_PUBLIC_API_URL) { throw "NEXT_PUBLIC_API_URL não setado" }
  if (-not $env:DISABLE_WEB_DIRECT_DB) { Write-Host "ℹ DISABLE_WEB_DIRECT_DB não setado (ok em dev)"; }
}

# 1) Typecheck + lint + build (executa só se existir no package.json)
if (Has-Script "typecheck") { Run-Step "Typecheck" { pnpm -s typecheck } } else { Write-Host "⏭ Typecheck (script ausente)" -ForegroundColor Yellow }
if (Has-Script "lint")      { Run-Step "Lint"      { pnpm -s lint      } } else { Write-Host "⏭ Lint (script ausente)"      -ForegroundColor Yellow }
if (Has-Script "build")     { Run-Step "Build"     { pnpm -s build     } } else { Run-Step "Build (fallback)" { pnpm -s build } }

# 2) Checks HTTP (assume servidor já está rodando em outra janela com `pnpm start`)
$tests = @()
$tests += Http "$BaseUrl/api/public/jogos-do-dia-fallback" "GET" @(200)

# Endpoints que podem estar como 501 em prod — aqui só checamos que respondem controladamente
$mayExist501 = @(
  "/api/campeoes","/api/estatisticas/ranking-geral","/api/estatisticas/artilheiros",
  "/api/estatisticas/assistencias","/api/partidas","/api/atletas"
)
foreach ($p in $mayExist501) { $tests += Http "$BaseUrl$p" "GET" @(200,401,403,404,405,500,501) }

# Sorteio: publicar (sem sessão deve dar 401/405 dependendo do backend)
$tests += Http "$BaseUrl/api/admin/sorteio/publicar" "POST" @(200,401,405)

# Estrelas: sem sessão normalmente 401 (ok)
$tests += Http "$BaseUrl/api/estrelas" "GET" @(200,401,404)

$tests | Format-Table -AutoSize
if (($tests | Where-Object Result -eq 'FAIL').Count -gt 0) { throw "Alguns checks falharam." }
Write-Host "`n✅ Smoke Fase 1 OK" -ForegroundColor Green
