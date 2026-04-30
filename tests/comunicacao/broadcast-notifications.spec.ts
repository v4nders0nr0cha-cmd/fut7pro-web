import { test, expect } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const athleteEmail = process.env.E2E_ATHLETE_EMAIL;
const athletePassword = process.env.E2E_ATHLETE_PASSWORD;

const shouldRun =
  process.env.E2E_RUN_AUTH === "1" &&
  Boolean(slug) &&
  Boolean(adminEmail) &&
  Boolean(adminPassword) &&
  Boolean(athleteEmail) &&
  Boolean(athletePassword);

test.describe("broadcast notifications", () => {
  test("admin sends and athlete receives", async ({ browser }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    const message = `E2E broadcast ${Date.now()}`;

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/login");
    await adminPage.getByLabel("E-mail").fill(adminEmail || "");
    const adminPasswordInput = adminPage.getByLabel(/Senha/i).first();
    const adminPasswordVisible = await adminPasswordInput.isVisible().catch(() => false);
    if (!adminPasswordVisible) {
      await adminPage.getByRole("button", { name: /Usar senha \(legado\)/i }).click();
      await expect(adminPasswordInput).toBeVisible({ timeout: 10000 });
    }
    await adminPasswordInput.fill(adminPassword || "");
    await adminPage.getByRole("button", { name: /Entrar no painel|Entrar com senha/i }).click();

    await adminPage.waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 });
    if (adminPage.url().includes("/admin/selecionar-racha")) {
      await adminPage
        .getByRole("button", { name: /Acessar painel/i })
        .first()
        .click();
      await adminPage.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    }

    await adminPage.goto("/admin/comunicacao/notificacoes");
    await adminPage.getByLabel("Mensagem").fill(message);
    await adminPage.getByRole("button", { name: /Enviar/i }).click();
    await expect(adminPage.getByText(/Notificacao enviada/i)).toBeVisible({ timeout: 20000 });

    await adminContext.close();

    const athleteContext = await browser.newContext();
    const athletePage = await athleteContext.newPage();

    await athletePage.goto(`/${slug}/login`);
    await athletePage.getByLabel("E-mail").fill(athleteEmail || "");
    const athletePasswordInput = athletePage.getByLabel(/Senha/i).first();
    const athletePasswordVisible = await athletePasswordInput.isVisible().catch(() => false);
    if (!athletePasswordVisible) {
      await athletePage.getByRole("button", { name: /Entrar com senha \(legado\)/i }).click();
      await expect(athletePasswordInput).toBeVisible({ timeout: 10000 });
    }
    await athletePasswordInput.fill(athletePassword || "");
    await athletePage.getByRole("button", { name: /^Entrar$|Entrar com senha/i }).click();

    await athletePage.waitForURL(new RegExp(`/${slug}`), { timeout: 20000 });
    await athletePage.goto(`/${slug}/comunicacao/notificacoes`);

    const notificationCard = athletePage.getByText(message).first();
    await expect(notificationCard).toBeVisible({ timeout: 20000 });

    await notificationCard.click();
    await athletePage.waitForTimeout(1000);

    await athleteContext.close();
  });
});
