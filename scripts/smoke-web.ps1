param(
  [string]$BaseUrl = $env:NEXT_PUBLIC_API_URL,
  [int]$TimeoutSec = 15
)

if (-not $BaseUrl) {
  Write-Error "Defina NEXT_PUBLIC_API_URL ou informe -BaseUrl."
  exit 1
}

function Invoke-SmokeCall {
  param(
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -Headers @{ Accept = "application/json" }
    return @{
      Url = $Url
      Status = $response.StatusCode
      Ok = $true
    }
  } catch {
    $status = $_.Exception.Response.StatusCode.value__ 2>$null
    return @{
      Url = $Url
      Status = $status
      Ok = $false
      Error = $_.Exception.Message
    }
  }
}

$endpoints = @(
  "/health",
  "/health/readiness",
  "/public/demo-rachao/teams"
)

Write-Host "== Fut7Pro Web smoke =="
Write-Host "Base URL: $BaseUrl"

$results = foreach ($path in $endpoints) {
  $url = "$BaseUrl$path"
  Invoke-SmokeCall -Url $url
}

$results | ForEach-Object {
  $status = if ($_.Ok) { "[OK ]" } else { "[FAIL]" }
  Write-Host ("{0} {1} -> {2}" -f $status, $_.Status, $_.Url)
  if (-not $_.Ok -and $_.Error) {
    Write-Host ("       {0}" -f $_.Error)
  }
}

if ($results | Where-Object { -not $_.Ok }) {
  exit 2
}

exit 0
