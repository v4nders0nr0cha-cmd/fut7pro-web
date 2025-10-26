param(
  [switch]$Ci,
  [string]$BaseUrl = "http://localhost:3000",
  [int]$TimeoutSec = 7
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Test-Http {
  param(
    [string]$Url,
    [ValidateSet("GET","POST","PUT","PATCH","DELETE")][string]$Method = "GET",
    [int]$Expect = 200
  )

  $args = @(
    "-sS","-o","NUL","-w","%{http_code}",
    "--connect-timeout","2",
    "--max-time",[string]$TimeoutSec,
    "-X",$Method,$Url
  )

  try { $code = & curl.exe @args } catch { $code = "0" }

  $got = [int]($code -as [int])
  $ok  = ($got -eq $Expect)

  [pscustomobject]@{
    Method = $Method
    Url    = $Url
    Expect = $Expect
    Got    = $got
    Result = if ($ok) { "PASS" } else { "FAIL" }
  }
}

# bloqueados 501
$blocked = @(
  @{u="$BaseUrl/api/campeoes?rachaId=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/estatisticas/ranking-geral?rachaId=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/estatisticas/artilheiros?rachaId=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/estatisticas/assistencias?rachaId=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/partidas?rachaId=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/atletas"; m="GET"; e=501},
  @{u="$BaseUrl/api/atletas/by-slug/qualquer?tenant=demo"; m="GET"; e=501},
  @{u="$BaseUrl/api/atletas/abc"; m="GET"; e=501},

  @{u="$BaseUrl/api/admin/rachas"; m="GET"; e=501},
  @{u="$BaseUrl/api/admin/rachas/demo-rachao/admins"; m="GET"; e=501},
  @{u="$BaseUrl/api/admin/rachas/demo-rachao/admins/adm123"; m="GET"; e=501},
  @{u="$BaseUrl/api/admin/rachas/demo-rachao/times/time123"; m="GET"; e=501},
  @{u="$BaseUrl/api/admin/solicitacoes"; m="GET"; e=501},
  @{u="$BaseUrl/api/admin/racha/publish"; m="POST"; e=501},
  @{u="$BaseUrl/api/admin/racha/unpublish"; m="POST"; e=501}
)

# públicos 200
$public = @(
  @{u="$BaseUrl/api/public/jogos-do-dia-fallback"; m="GET"; e=200}
)

$results  = @()
$results += $blocked | ForEach-Object { Test-Http -Url $_.u -Method $_.m -Expect $_.e }
$results += $public  | ForEach-Object { Test-Http -Url $_.u -Method $_.m -Expect $_.e }

$results | Format-Table -AutoSize

$failed = @($results | Where-Object Result -eq "FAIL")
if ($Ci) {
  if ($failed.Count -gt 0) { exit 1 } else { exit 0 }
} else {
  if ($failed.Count -gt 0) {
    Write-Host "`n❌ Falhou em pelo menos um endpoint." -ForegroundColor Red
  } else {
    Write-Host "`n✅ Todos os endpoints retornaram o esperado. Pode marcar a Fase 0 como CONCLUÍDA." -ForegroundColor Green
  }
  Read-Host "`nPressione ENTER para fechar"
}
