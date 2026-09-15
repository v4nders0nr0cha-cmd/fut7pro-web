import { expect, test } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const shouldRun = process.env.E2E_RUN_AUTH === "1" && Boolean(slug);

async function openEntrar(page: Parameters<typeof test>[0]["page"]) {
  test.skip(!shouldRun, "E2E auth envs not set");

  const tenantSlug = slug as string;
  const url = `/${tenantSlug}/entrar`;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(800);
    }
  }
  if (lastError) throw lastError;

  const rejectCookies = page.getByRole("button", { name: /^Rejeitar$/i });
  if (await rejectCookies.isVisible({ timeout: 5000 }).catch(() => false)) {
    await rejectCookies.click();
  }
}

test.describe("athlete entrar states", () => {
  test.describe.configure({ mode: "serial" });

  test("solicita codigo por passwordless sem lookup pre-auth", async ({ page }) => {
    let lookupCalls = 0;
    await page.route("**/api/auth/lookup-email**", async (route) => {
      lookupCalls += 1;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "lookup-email should not be called by /entrar" }),
      });
    });

    await page.route("**/api/public/*/auth/passwordless/request", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "Se estiver tudo certo, enviaremos seu código.",
          resendCooldownSeconds: 60,
          turnstileProof: "proof",
        }),
      });
    });

    await openEntrar(page);

    await page.getByPlaceholder("email@exemplo.com").fill("atleta@teste.com");
    const turnstileButton = page.getByRole("button", { name: /Resolver verificação/i });
    if (await turnstileButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await turnstileButton.click();
    }
    await page.getByRole("button", { name: "Enviar código de acesso" }).click();

    await expect(
      page.getByText(/Se houver uma Conta Fut7Pro com at\*\*\*@teste.com/i)
    ).toBeVisible();
    await expect(page.getByPlaceholder("Digite os 6 dígitos")).toBeVisible();
    await expect(page.getByRole("link", { name: /Criar Conta Fut7Pro/i })).toBeVisible();
    expect(lookupCalls).toBe(0);
  });

  test("link de esqueci senha aponta para rota publica slugada", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");
    await page.goto(`/${slug as string}/login`, { waitUntil: "domcontentloaded" });

    const forgotLink = page.getByRole("link", { name: "Esqueci minha senha" });
    await expect(forgotLink).toHaveAttribute("href", `/${slug as string}/esqueci-senha`);
  });

  test("slug invalido mostra tela de racha nao encontrado", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    const invalidSlug = `racha-inexistente-${Date.now()}`;
    await page.goto(`/${invalidSlug}/entrar`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Racha n(ã|a)o encontrado/i)).toBeVisible();
  });
});
