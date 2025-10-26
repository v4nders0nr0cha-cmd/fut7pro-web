const { test, expect, request } = require('@playwright/test');

test('home e /api/health/backend ok', async ({ page, baseURL }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Fut7Pro/i);

  const ctx = await request.newContext();
  const url = String(baseURL).replace(/\/$/, '') + '/api/health/backend';
  const res = await ctx.get(url);
  expect(res.status()).toBe(200);
});

