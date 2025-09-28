import { expect, test, type APIRequestContext } from '@playwright/test';

import { ensureRacha } from '../utils/ensureRacha';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const RACHA_PATH = process.env.RACHA_PATH ?? '/rachas/demo-rachao';
const SEED_SLUG = process.env.SEED_SLUG ?? 'demo-rachao';

function buildJogadores(prefix: string) {
  return Array.from({ length: 5 }).map((_, index) => ({
    id: `${prefix}-${index + 1}`,
    nome: `${prefix === 'azul' ? 'Time Azul' : 'Time Vermelho'} Jogador ${index + 1}`,
    apelido: `${prefix.toUpperCase()}${index + 1}`,
    posicao: index === 0 ? 'GOL' : index < 3 ? 'MEI' : 'ATA',
    status: 'titular',
    gols: index === 0 ? 0 : 1,
    assistencias: index % 2 === 0 ? 1 : 0,
  }));
}

function startOfTodayISO() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return start.toISOString();
}

async function ensurePartidasPublicadas(request: APIRequestContext, baseUrl: string, rachaId: string) {
  const dataISO = startOfTodayISO();
  const jogadoresTimeA = buildJogadores('azul');
  const jogadoresTimeB = buildJogadores('vermelho');

  const payload = {
    rachaId,
    data: dataISO,
    horarioBase: '19:00',
    jogos: [
      {
        ordem: 1,
        tempo: 15,
        timeA: { id: 'azul', nome: 'Time Azul' },
        timeB: { id: 'vermelho', nome: 'Time Vermelho' },
        destaquesA: ['Jogador destaque Azul'],
        destaquesB: ['Jogador destaque Vermelho'],
      },
    ],
    times: [
      { id: 'azul', nome: 'Time Azul', jogadores: jogadoresTimeA },
      { id: 'vermelho', nome: 'Time Vermelho', jogadores: jogadoresTimeB },
    ],
    config: {
      duracaoPartidaMin: 15,
      horarioInicio: '19:00',
    },
  };

  const publishResponse = await request.post(`${baseUrl}/api/admin/sorteio/publicar`, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });

  if (publishResponse.ok()) {
    return;
  }

  const fallbackResponse = await request.post(`${baseUrl}/api/admin/partidas`, {
    data: {
      rachaId,
      data: dataISO,
      horario: '19:00',
      local: 'Quadra Principal',
      timeA: 'Time Azul',
      timeB: 'Time Vermelho',
      golsTimeA: 0,
      golsTimeB: 0,
      jogadoresA: JSON.stringify(jogadoresTimeA),
      jogadoresB: JSON.stringify(jogadoresTimeB),
      destaquesA: null,
      destaquesB: null,
      finalizada: false,
    },
    headers: { 'Content-Type': 'application/json' },
  });

  expect(fallbackResponse.ok(), 'fallback POST /api/admin/partidas').toBeTruthy();
}

test('publica partidas e valida paginas publicas', async ({ page, request }) => {
  const rachaId = await ensureRacha(request, BASE_URL, SEED_SLUG);

  await ensurePartidasPublicadas(request, BASE_URL, rachaId);

  await page.goto(`${RACHA_PATH}/partidas/times-do-dia`);
  await expect(page.getByRole('heading', { name: /times do dia/i, level: 1 }).first()).toBeVisible();
  await expect(page.getByText(/(vs|x)/i).first()).toBeVisible();

  await page.goto(`${RACHA_PATH}/partidas/historico`);
  await expect(page.getByRole('heading', { name: /historico de partidas/i, level: 1 }).first()).toBeVisible();
  await expect(page.getByText(/(vs|x)/i).first()).toBeVisible();
});
