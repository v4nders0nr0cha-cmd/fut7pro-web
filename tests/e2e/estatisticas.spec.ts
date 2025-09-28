import { expect, test, type Page } from '@playwright/test';

const BASE_PATH = process.env.RACHA_PATH ?? '/rachas/demo-rachao';

async function goto(page: Page, path: string) {
  await page.goto(`${BASE_PATH}${path}`);
  await page.waitForLoadState('networkidle');
}

test.describe('Estatisticas publicas', () => {
  test('Ranking geral renderiza e lista atletas', async ({ page }) => {
    await goto(page, '/estatisticas/ranking-geral');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('Artilheiros exibem tabela com dados', async ({ page }) => {
    await goto(page, '/estatisticas/artilheiros');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('Assistencias exibem tabela com dados', async ({ page }) => {
    await goto(page, '/estatisticas/assistencias');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('Classificacao dos times renderiza tabela', async ({ page }) => {
    await goto(page, '/estatisticas/classificacao-dos-times');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });
});
