import { expect, test } from '@playwright/test';

const BASE_PATH = process.env.RACHA_PATH ?? '/rachas/demo-rachao';

const HEADING_REGEX = /campe/i;
const CATEGORIA_REGEX = /melhor do ano|artilheiro|atacante do ano|meia do ano|zagueiro do ano|goleiro do ano|time campe/i;

test.describe('Pagina publica: Os Campeoes', () => {
  test('renderiza e exibe ao menos uma categoria de campeao', async ({ page }) => {
    await page.goto(`${BASE_PATH}/os-campeoes`);

    const heading = page.getByRole('heading', { name: HEADING_REGEX }).first();
    await expect(heading).toBeVisible();

    const categoria = page.getByText(CATEGORIA_REGEX).first();
    await expect(categoria).toBeVisible();
  });
});
