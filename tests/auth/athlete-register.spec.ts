import { test, expect } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const shouldRunAuth =
  process.env.E2E_RUN_AUTH === "1" &&
  Boolean(process.env.E2E_ATHLETE_EMAIL) &&
  Boolean(process.env.E2E_ATHLETE_PASSWORD) &&
  Boolean(process.env.E2E_ATHLETE_NAME);

test.describe("athlete register", () => {
  test("renders register form", async ({ page }) => {
    test.skip(!slug, "E2E_PUBLIC_SLUG not set");

    await page.goto(`/${slug}/register`);
    await expect(page.getByRole("heading", { name: "Criar conta de atleta" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
    await expect(page.getByLabel("Nome")).toBeVisible();
    await expect(page.getByLabel("Apelido (opcional)")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByLabel("Posicao principal")).toBeVisible();
    await expect(page.getByLabel("Posicao secundaria")).toBeVisible();
    await expect(page.getByLabel("Dia")).toBeVisible();
    await expect(page.getByLabel("Mes")).toBeVisible();
    await expect(page.getByLabel("Ano (opcional)")).toBeVisible();
  });

  test("registers athlete via email", async ({ page }) => {
    test.skip(!slug || !shouldRunAuth, "E2E auth envs not set");

    await page.goto(`/${slug}/register`);
    await page.getByLabel("Nome").fill(process.env.E2E_ATHLETE_NAME || "Joao");
    await page.getByLabel("Apelido (opcional)").fill("Teste");
    await page.getByLabel("E-mail").fill(process.env.E2E_ATHLETE_EMAIL || "");
    await page.getByLabel("Senha").fill(process.env.E2E_ATHLETE_PASSWORD || "");
    await page.getByLabel("Posicao principal").selectOption("Atacante");
    await page.getByLabel("Posicao secundaria").selectOption("Meia");
    await page.getByLabel("Dia").selectOption("10");
    await page.getByLabel("Mes").selectOption("7");
    await page.getByLabel("Ano (opcional)").fill("1998");

    await page.getByRole("button", { name: "Cadastrar atleta" }).click();
    await expect(page.getByText(/Cadastro (enviado|concluido)/i)).toBeVisible({ timeout: 10000 });
  });
});
