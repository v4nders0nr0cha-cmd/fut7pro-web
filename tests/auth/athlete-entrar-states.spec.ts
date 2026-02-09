import { expect, test } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const shouldRun = process.env.E2E_RUN_AUTH === "1" && Boolean(slug);

async function openEntrarWithLookupMock(
  page: Parameters<typeof test>[0]["page"],
  payload: Record<string, unknown>
) {
  test.skip(!shouldRun, "E2E auth envs not set");

  await page.route("**/api/auth/lookup-email", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });

  const tenantSlug = slug as string;
  await page.goto(`/${tenantSlug}/entrar`);
  await page.getByPlaceholder("ex: seuemail@dominio.com").fill("atleta@teste.com");
  await page.getByRole("button", { name: /^Continuar$/i }).click();
}

test.describe("athlete entrar states", () => {
  test("ACTIVE redireciona para login com e-mail preenchido", async ({ page }) => {
    await openEntrarWithLookupMock(page, {
      exists: true,
      userExists: true,
      providers: ["credentials"],
      hasPassword: true,
      availableAuthMethods: ["password"],
      membershipStatus: "ACTIVE",
      nextAction: "LOGIN",
      requiresCaptcha: false,
    });

    await expect(page).toHaveURL(new RegExp(`/${slug as string}/login`));
    await expect(page.getByLabel("E-mail")).toHaveValue("atleta@teste.com");
  });

  test("REGISTER redireciona para cadastro com e-mail preenchido", async ({ page }) => {
    await openEntrarWithLookupMock(page, {
      exists: false,
      userExists: false,
      providers: [],
      hasPassword: false,
      availableAuthMethods: [],
      membershipStatus: "NONE",
      nextAction: "REGISTER",
      requiresCaptcha: false,
    });

    await expect(page).toHaveURL(new RegExp(`/${slug as string}/register`));
    await expect(page.getByLabel("E-mail")).toHaveValue("atleta@teste.com");
    await expect(page.getByText(/Primeiro acesso no Fut7Pro/i)).toBeVisible();
  });

  test("REQUEST_JOIN redireciona para login com aviso de solicitação", async ({ page }) => {
    await openEntrarWithLookupMock(page, {
      exists: true,
      userExists: true,
      providers: ["credentials"],
      hasPassword: true,
      availableAuthMethods: ["password"],
      membershipStatus: "NONE",
      nextAction: "REQUEST_JOIN",
      requiresCaptcha: false,
    });

    await expect(page).toHaveURL(new RegExp(`/${slug as string}/login\\?.*intent=request-join`));
    await expect(page.getByLabel("E-mail")).toHaveValue("atleta@teste.com");
    await expect(page.getByText(/você ainda não joga neste racha/i)).toBeVisible();
  });

  test("WAIT_APPROVAL redireciona para aguardando aprovação", async ({ page }) => {
    await openEntrarWithLookupMock(page, {
      exists: true,
      userExists: true,
      providers: ["credentials"],
      hasPassword: true,
      availableAuthMethods: ["password"],
      membershipStatus: "PENDING",
      nextAction: "WAIT_APPROVAL",
      requiresCaptcha: false,
    });

    await expect(page).toHaveURL(new RegExp(`/${slug as string}/aguardando-aprovacao`));
  });

  test("link de esqueci senha aponta para rota publica slugada", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");
    await page.goto(`/${slug as string}/login`);

    const forgotLink = page.getByRole("link", { name: "Esqueci minha senha" });
    await expect(forgotLink).toHaveAttribute("href", `/${slug as string}/esqueci-senha`);
  });

  test("slug invalido mostra tela de racha nao encontrado", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    const invalidSlug = `racha-inexistente-${Date.now()}`;
    await page.goto(`/${invalidSlug}/entrar`);
    await expect(page.getByText(/Racha n(ã|a)o encontrado/i)).toBeVisible();
  });
});
