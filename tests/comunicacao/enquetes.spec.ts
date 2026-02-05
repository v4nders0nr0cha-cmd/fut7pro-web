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

async function loginAdmin(page: any, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: /Entrar no painel/i }).click();
  await page.waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 });
  if (page.url().includes("/admin/selecionar-racha")) {
    await page
      .getByRole("button", { name: /Acessar painel/i })
      .first()
      .click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
  }
}

async function loginAthlete(page: any, slugValue: string, email: string, password: string) {
  await page.goto(`/${slugValue}/login`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: /^Entrar$/i }).click();
}

test.describe("enquetes", () => {
  test("admin cria enquete, atleta vota, resultados atualizam e enquete agendada bloqueia voto", async ({
    browser,
  }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    const pollTitle = `Enquete E2E ${Date.now()}`;
    const optionA = "Opção A";
    const optionB = "Opção B";
    const endAt = toLocalInputValue(new Date(Date.now() + 10 * 60 * 1000));

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAdmin(adminPage, adminEmail || "", adminPassword || "");

    await adminPage.goto("/admin/comunicacao/enquetes");
    await adminPage.getByRole("button", { name: /Nova Enquete/i }).click();
    await adminPage.getByPlaceholder("Ex: Qual horário preferido?").fill(pollTitle);
    await adminPage.getByPlaceholder("Opção 1").fill(optionA);
    await adminPage.getByPlaceholder("Opção 2").fill(optionB);
    await adminPage.getByLabel("Definir término").click();
    await adminPage.locator('input[type="datetime-local"]').first().fill(endAt);
    await adminPage.getByRole("button", { name: /Publicar enquete/i }).click();
    await expect(adminPage.getByText(/Enquete publicada com sucesso/i)).toBeVisible({
      timeout: 20000,
    });
    await adminContext.close();

    const athleteContext = await browser.newContext();
    const athletePage = await athleteContext.newPage();
    await loginAthlete(athletePage, slug || "", athleteEmail || "", athletePassword || "");
    await athletePage.goto(`/${slug}/comunicacao/mensagens`);
    await athletePage.getByRole("button", { name: /Enquetes/i }).click();

    const pollCard = athletePage.locator("div", { hasText: pollTitle }).first();
    await pollCard.getByRole("button", { name: /Votar|Ver detalhes/i }).click();
    await athletePage.getByText(optionA).click();
    await athletePage.getByRole("button", { name: /Enviar voto|Atualizar voto/i }).click();
    await expect(athletePage.getByText(/Voto registrado/i)).toBeVisible({ timeout: 20000 });
    await athleteContext.close();

    const adminContext2 = await browser.newContext();
    const adminPage2 = await adminContext2.newPage();
    await loginAdmin(adminPage2, adminEmail || "", adminPassword || "");
    await adminPage2.goto("/admin/comunicacao/enquetes");

    const adminCard = adminPage2.locator("div", { hasText: pollTitle }).first();
    await adminCard.getByRole("button", { name: /Resultados/i }).click();
    await expect(adminPage2.getByText(optionA)).toBeVisible({ timeout: 20000 });
    await adminPage2.getByRole("button", { name: /Fechar/i }).click();

    await adminCard.getByRole("button", { name: /Encerrar/i }).click();
    await adminPage2.getByRole("button", { name: /^Encerrar$/i }).click();
    await expect(adminPage2.getByText(/Enquete encerrada/i)).toBeVisible({ timeout: 20000 });

    const scheduledTitle = `Enquete agendada ${Date.now()}`;
    const startAt = toLocalInputValue(new Date(Date.now() + 10 * 60 * 1000));
    const endAtScheduled = toLocalInputValue(new Date(Date.now() + 20 * 60 * 1000));

    await adminPage2.getByRole("button", { name: /Nova Enquete/i }).click();
    await adminPage2.getByPlaceholder("Ex: Qual horário preferido?").fill(scheduledTitle);
    await adminPage2.getByPlaceholder("Opção 1").fill(optionA);
    await adminPage2.getByPlaceholder("Opção 2").fill(optionB);
    await adminPage2.getByLabel("Início imediato").click();
    const dateInputs = adminPage2.locator('input[type="datetime-local"]');
    await dateInputs.nth(0).fill(startAt);
    await dateInputs.nth(1).fill(endAtScheduled);
    await adminPage2.getByRole("button", { name: /Publicar enquete/i }).click();
    await expect(adminPage2.getByText(/Enquete publicada com sucesso/i)).toBeVisible({
      timeout: 20000,
    });
    await adminContext2.close();

    const athleteContext2 = await browser.newContext();
    const athletePage2 = await athleteContext2.newPage();
    await loginAthlete(athletePage2, slug || "", athleteEmail || "", athletePassword || "");
    await athletePage2.goto(`/${slug}/comunicacao/mensagens`);
    await athletePage2.getByRole("button", { name: /Enquetes/i }).click();

    const scheduledCard = athletePage2.locator("div", { hasText: scheduledTitle }).first();
    await scheduledCard.getByRole("button", { name: /Votar|Ver detalhes/i }).click();
    await expect(athletePage2.getByText(/Enquete agendada. O voto será liberado/i)).toBeVisible({
      timeout: 20000,
    });
    const voteButton = athletePage2.getByRole("button", { name: /Enviar voto|Atualizar voto/i });
    await expect(voteButton).toBeDisabled();

    await athleteContext2.close();
  });
});
