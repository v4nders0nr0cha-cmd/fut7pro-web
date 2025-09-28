param(
  [string]$Slug = "demo-rachao",
  [string]$ComposeFile = "docker-compose.postgres.yml"
)

$ErrorActionPreference = "Stop"

function Write-Step($message) {
  Write-Host "`n== $message ==" -ForegroundColor Cyan
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI nao encontrado. Instale o Docker Desktop ou adicione o executavel ao PATH."
}

Write-Step "1) Subindo Postgres"
docker compose -f $ComposeFile up -d

Write-Host "Aguardando Postgres responder em 5432..."
for ($i = 1; $i -le 30; $i++) {
  try {
    $tcp = New-Object Net.Sockets.TcpClient("127.0.0.1", 5432)
    if ($tcp.Connected) {
      $tcp.Close()
      break
    }
  } catch {
    # aguardando
  }
  Start-Sleep -Seconds 2
  if ($i -eq 30) {
    throw "Postgres nao respondeu a tempo."
  }
}

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/fut7pro?schema=public"

Write-Step "2) Prisma generate e migrate dev"
npx prisma generate
npx prisma migrate dev --name add-campeao

Write-Step "3) Seed de campeoes"
if (Test-Path "./scripts/seed-campeoes.ts") {
  npx tsx ./scripts/seed-campeoes.ts --slug $Slug
} else {
  Write-Warning "scripts/seed-campeoes.ts nao encontrado. Pulei o seed."
}

Write-Step "4) Validacao rapida das rotas"
try {
  $racha = Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/public/rachas/$Slug" | ConvertFrom-Json
  if (-not $racha) {
    throw "Resposta vazia da rota /api/public/rachas/$Slug"
  }
  $rachaId = $racha.id
  Write-Host "RachaId: $rachaId"

  $camp = Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/campeoes?rachaId=$rachaId" | ConvertFrom-Json
  if ($camp) {
    Write-Host "Total de campeoes retornados: $($camp.Count)"
  } else {
    Write-Host "Nenhum campeao retornado ainda."
  }
} catch {
  Write-Warning "Falha ao validar rotas. Verifique se o Next esta rodando em http://localhost:3000"
  Write-Warning $_
}

Write-Host "`nConcluido." -ForegroundColor Green
