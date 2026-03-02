import { test, expect } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const pendingEmail = process.env.E2E_PENDING_EMAIL;
const pendingPassword = process.env.E2E_PENDING_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const shouldRun =
  process.env.E2E_RUN_AUTH === "1" &&
  Boolean(slug) &&
  Boolean(pendingEmail) &&
  Boolean(pendingPassword) &&
  Boolean(adminEmail) &&
  Boolean(adminPassword);

test.describe("athlete pending login", () => {
  test("mostra modal de pendencia e aparece no painel admin", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    await page.goto(`/${slug}/login`);
    await page.getByLabel("E-mail").fill(pendingEmail || "");
    const pendingPasswordInput = page.getByLabel(/Senha/i).first();
    const pendingPasswordVisible = await pendingPasswordInput.isVisible().catch(() => false);
    if (!pendingPasswordVisible) {
      await page.getByRole("button", { name: /Entrar com senha \(legado\)/i }).click();
      await expect(pendingPasswordInput).toBeVisible({ timeout: 10000 });
    }
    await pendingPasswordInput.fill(pendingPassword || "");
    await page.getByRole("button", { name: /^Entrar$|Entrar com senha/i }).click();

    await expect(page.getByRole("heading", { name: /Solicitacao pendente/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "Ok" }).click();
    await expect(page).not.toHaveURL(/\/admin\//);

    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill(adminEmail || "");
    const adminPasswordInput = page.getByLabel(/Senha/i).first();
    const adminPasswordVisible = await adminPasswordInput.isVisible().catch(() => false);
    if (!adminPasswordVisible) {
      await page.getByRole("button", { name: /Usar senha \(legado\)/i }).click();
      await expect(adminPasswordInput).toBeVisible({ timeout: 10000 });
    }
    await adminPasswordInput.fill(adminPassword || "");
    await page.getByRole("button", { name: /Entrar no painel|Entrar com senha/i }).click();

    await page.waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 });
    if (page.url().includes("/admin/selecionar-racha")) {
      await page
        .getByRole("button", { name: /Acessar painel/i })
        .first()
        .click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    }

    await page.goto("/admin/jogadores/listar-cadastrar");
    await expect(page.getByText(pendingEmail || "")).toBeVisible({ timeout: 20000 });
  });
});
