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

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

test.describe("comunicados modal", () => {
  test("mostra modal no login enquanto ativo", async ({ browser }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    const title = `Comunicado E2E ${Date.now()}`;
    const message = "Aviso E2E para teste de modal";
    const startAt = toLocalInputValue(new Date(Date.now() - 60 * 1000));
    const endAt = toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/login");
    await adminPage.getByLabel("E-mail").fill(adminEmail || "");
    await adminPage.getByLabel("Senha").fill(adminPassword || "");
    await adminPage.getByRole("button", { name: /Entrar no painel/i }).click();

    await adminPage.waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 });
    if (adminPage.url().includes("/admin/selecionar-racha")) {
      await adminPage
        .getByRole("button", { name: /Acessar painel/i })
        .first()
        .click();
      await adminPage.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    }

    await adminPage.goto("/admin/comunicacao/comunicados");
    await adminPage.getByRole("button", { name: /Novo Comunicado/i }).click();
    await adminPage.getByLabel("Titulo").fill(title);
    await adminPage.getByLabel("Mensagem").fill(message);
    await adminPage.getByLabel("Inicio").fill(startAt);
    await adminPage.getByLabel("Fim").fill(endAt);
    await adminPage.getByRole("button", { name: /Publicar/i }).click();
    await expect(adminPage.getByText(/Comunicado publicado/i)).toBeVisible({ timeout: 20000 });

    await adminContext.close();

    const athleteContext = await browser.newContext();
    const athletePage = await athleteContext.newPage();

    await athletePage.goto(`/${slug}/login`);
    await athletePage.getByLabel("E-mail").fill(athleteEmail || "");
    await athletePage.getByLabel("Senha").fill(athletePassword || "");
    await athletePage.getByRole("button", { name: /^Entrar$/i }).click();

    await expect(athletePage.getByText(title)).toBeVisible({ timeout: 20000 });
    await athletePage.getByRole("button", { name: /Fechar/i }).click();

    await athleteContext.close();

    const athleteContext2 = await browser.newContext();
    const athletePage2 = await athleteContext2.newPage();
    await athletePage2.goto(`/${slug}/login`);
    await athletePage2.getByLabel("E-mail").fill(athleteEmail || "");
    await athletePage2.getByLabel("Senha").fill(athletePassword || "");
    await athletePage2.getByRole("button", { name: /^Entrar$/i }).click();
    await expect(athletePage2.getByText(title)).toBeVisible({ timeout: 20000 });
    await athletePage2.getByRole("button", { name: /Fechar/i }).click();
    await athleteContext2.close();

    const adminContext2 = await browser.newContext();
    const adminPage2 = await adminContext2.newPage();
    await adminPage2.goto("/admin/login");
    await adminPage2.getByLabel("E-mail").fill(adminEmail || "");
    await adminPage2.getByLabel("Senha").fill(adminPassword || "");
    await adminPage2.getByRole("button", { name: /Entrar no painel/i }).click();
    await adminPage2.waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 });
    if (adminPage2.url().includes("/admin/selecionar-racha")) {
      await adminPage2
        .getByRole("button", { name: /Acessar painel/i })
        .first()
        .click();
      await adminPage2.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    }
    await adminPage2.goto("/admin/comunicacao/comunicados");
    const card = adminPage2.locator("div", { hasText: title }).first();
    await card.getByRole("button", { name: /Arquivar/i }).click();
    await adminPage2.getByRole("button", { name: /^Arquivar$/i }).click();
    await expect(adminPage2.getByText(/Comunicado arquivado/i)).toBeVisible({ timeout: 20000 });
    await adminContext2.close();

    const athleteContext3 = await browser.newContext();
    const athletePage3 = await athleteContext3.newPage();
    await athletePage3.goto(`/${slug}/login`);
    await athletePage3.getByLabel("E-mail").fill(athleteEmail || "");
    await athletePage3.getByLabel("Senha").fill(athletePassword || "");
    await athletePage3.getByRole("button", { name: /^Entrar$/i }).click();

    await athletePage3.waitForTimeout(2000);
    await expect(athletePage3.getByText(title)).toHaveCount(0);

    await athleteContext3.close();
  });
});
