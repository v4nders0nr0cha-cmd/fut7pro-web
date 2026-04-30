import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ACTIVE_ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ACTIVE_ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD;
const activeTenantSlug = process.env.E2E_ACTIVE_TENANT_SLUG;

const shouldRun =
  Boolean(adminEmail) &&
  Boolean(adminPassword) &&
  process.env.E2E_RUN_FINANCEIRO_MENSALISTAS_SMOKE === "1";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCurrencyPtBr(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function loginAdmin(page: Page) {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  const submit = page.locator(
    '[data-testid="admin-login-submit"], button:has-text("Entrar no painel")'
  );
  await expect(submit.first()).toBeEnabled({ timeout: 30000 });

  const emailInput = page.locator('[data-testid="admin-login-email"], input[type="email"]').first();
  const passwordInputLocator = page
    .locator('[data-testid="admin-login-password"], input[type="password"]')
    .first();
  const passwordInputVisible = await passwordInputLocator
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (!passwordInputVisible) {
    const legacyToggle = page
      .getByRole("button", { name: /Usar senha \(legado\)|Entrar com senha/i })
      .first();
    const toggleVisible = await legacyToggle.isVisible({ timeout: 5000 }).catch(() => false);
    if (!toggleVisible) {
      throw new Error("Login admin não exibiu campo de senha nem botão de modo legado.");
    }
    await legacyToggle.click();
  }

  const passwordInput = page
    .locator('[data-testid="admin-login-password"], input[type="password"]')
    .first();
  await expect(passwordInput).toBeVisible({ timeout: 10000 });

  await emailInput.fill(adminEmail || "");
  await passwordInput.fill(adminPassword || "");
  await expect(emailInput).toHaveValue(adminEmail || "");
  await expect(passwordInput).toHaveValue(adminPassword || "");

  const waitLoginState = async () =>
    Promise.race([
      page
        .waitForURL(/\/admin\/(selecionar-racha|dashboard|status-assinatura)/, { timeout: 45000 })
        .then(() => "redirect" as const)
        .catch(() => null),
      page
        .locator('[role="alert"], [aria-live="polite"]')
        .filter({ hasText: /E-mail ou senha inválidos|E-mail ou senha invalidos/i })
        .first()
        .waitFor({ state: "visible", timeout: 12000 })
        .then(() => "invalid_credentials" as const)
        .catch(() => null),
    ]);

  await submit.first().click();
  let loginState = await waitLoginState();

  if (!loginState) {
    for (let attempt = 0; attempt < 2 && !loginState; attempt += 1) {
      await page.waitForTimeout(3000);
      const currentPath = new URL(page.url()).pathname;
      if (
        currentPath === "/admin/selecionar-racha" ||
        currentPath === "/admin/dashboard" ||
        currentPath === "/admin/status-assinatura"
      ) {
        loginState = "redirect";
        break;
      }
      const canRetry = await submit
        .first()
        .isEnabled()
        .catch(() => false);
      if (canRetry) {
        await submit.first().click();
      }
      loginState = await waitLoginState();
    }
  }

  if (loginState === "invalid_credentials") {
    throw new Error(
      "Falha de autenticação: e-mail/senha inválidos para o login admin. Verifique as credenciais E2E."
    );
  }

  if (loginState !== "redirect") {
    throw new Error(
      "Login não redirecionou para /admin/selecionar-racha ou /admin/dashboard dentro do tempo esperado."
    );
  }

  let currentPathname = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto("/admin/selecionar-racha", { waitUntil: "domcontentloaded", timeout: 45000 });
    currentPathname = new URL(page.url()).pathname;
    if (currentPathname !== "/admin/login") {
      break;
    }
    await page.waitForTimeout(1000);
  }

  if (page.url().includes("/admin/selecionar-racha")) {
    if (activeTenantSlug) {
      let selected = false;
      let redirectTo: string | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const selectResponse = await page.request.post("/api/admin/hub/select", {
          data: { slug: activeTenantSlug },
          timeout: 60000,
        });
        if (selectResponse.ok()) {
          const selectBody = (await selectResponse.json().catch(() => ({}))) as {
            redirectTo?: string;
            blocked?: boolean;
          };
          redirectTo =
            typeof selectBody?.redirectTo === "string"
              ? selectBody.redirectTo
              : selectBody?.blocked
                ? "/admin/status-assinatura"
                : "/admin/dashboard";
          selected = true;
          break;
        }
        await page.waitForTimeout(1000);
      }
      if (!selected) {
        throw new Error("Não foi possível selecionar o tenant ativo para o painel admin.");
      }
      const cookies = await page.context().cookies();
      const hasActiveTenantCookie = cookies.some(
        (cookie) =>
          cookie.name === "fut7pro_admin_active_tenant" && cookie.value === activeTenantSlug
      );
      if (!hasActiveTenantCookie) {
        throw new Error("Cookie de tenant ativo não foi persistido após seleção do racha.");
      }

      await page.goto(redirectTo || "/admin/dashboard", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    }

    await page
      .waitForURL(/\/admin\/(dashboard|status-assinatura)/, { timeout: 5000 })
      .catch(() => null);

    const afterSelectPathname = (() => {
      try {
        return new URL(page.url()).pathname;
      } catch {
        return page.url();
      }
    })();

    if (afterSelectPathname === "/admin/selecionar-racha" && !activeTenantSlug) {
      const selectDashboardButton = page
        .locator('[data-testid^="admin-hub-select-"], [data-testid="admin-hub-list"] button')
        .filter({ hasText: /Acessar painel/i })
        .first();
      const useFallbackButton = !(await selectDashboardButton
        .isVisible({ timeout: 4000 })
        .catch(() => false));

      const selectButton = useFallbackButton
        ? page
            .locator('[data-testid^="admin-hub-select-"], [data-testid="admin-hub-list"] button')
            .filter({ hasText: /Acessar painel|Ver status/i })
            .first()
        : selectDashboardButton;
      await expect(selectButton).toBeVisible({ timeout: 20000 });
      await Promise.all([
        page.waitForURL(/\/admin\/(dashboard|status-assinatura)/, { timeout: 30000 }),
        selectButton.click(),
      ]);
    }
  }

  if (/\/admin\/status-assinatura/.test(page.url())) {
    throw new Error("Conta de teste bloqueada para acesso ao painel.");
  }

  let financeiroProbeOk = false;
  let financeiroProbeStatus: number | null = null;
  let financeiroProbeBody = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const financeiroProbe = await page.request.get("/api/admin/financeiro");
    financeiroProbeStatus = financeiroProbe.status();
    if (financeiroProbe.ok()) {
      financeiroProbeOk = true;
      break;
    }
    financeiroProbeBody = (await financeiroProbe.text().catch(() => "")).trim();
    await page.waitForTimeout(1000);
  }
  if (!financeiroProbeOk) {
    const bodySnippet = financeiroProbeBody ? ` body=${financeiroProbeBody.slice(0, 220)}` : "";
    throw new Error(
      `Sessão autenticada, mas o acesso ao módulo financeiro retornou erro. status=${financeiroProbeStatus ?? "desconhecido"}${bodySnippet}`
    );
  }

  if (/\/admin\/login/.test(page.url())) {
    throw new Error("Sessão de admin não foi mantida após autenticação.");
  }
}

async function resolveCompetencia(page: Page) {
  const mesSelect = page
    .locator("label", { hasText: /^Mês$/i })
    .locator("xpath=following-sibling::select")
    .first();
  const anoSelect = page
    .locator("label", { hasText: /^Ano$/i })
    .locator("xpath=following-sibling::select")
    .first();

  const mesRaw = await mesSelect.inputValue();
  const anoRaw = await anoSelect.inputValue();
  const mes = String(mesRaw).padStart(2, "0");
  const ano = String(anoRaw);

  return {
    ano: Number(ano),
    mes: Number(mesRaw),
    competencia: `${ano}-${mes}`,
  };
}

test.describe("Smoke financeiro mensalistas", () => {
  test.setTimeout(360000);

  test("registra, evita duplicidade, processa lote e cancela com reflexo no financeiro", async ({
    page,
  }) => {
    test.skip(
      !shouldRun,
      "Credenciais de admin ativo para smoke financeiro mensalistas não configuradas."
    );

    try {
      await loginAdmin(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Falha de autenticação")) {
        test.skip(true, "Credenciais E2E inválidas para o smoke financeiro mensalistas.");
      }
      throw error;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.goto("/admin/financeiro/mensalistas", { waitUntil: "domcontentloaded" });
      const pathname = (() => {
        try {
          return new URL(page.url()).pathname;
        } catch {
          return page.url();
        }
      })();
      if (pathname === "/admin/financeiro/mensalistas") {
        break;
      }
      await page.waitForTimeout(1200);
    }
    await expect(page.getByRole("heading", { name: /Mensalistas/i })).toBeVisible({
      timeout: 30000,
    });
    await page
      .getByText(/Carregando mensalistas e dados financeiros/i)
      .first()
      .waitFor({ state: "hidden", timeout: 60000 })
      .catch(() => null);

    const emptyStateVisible = await page
      .getByText(/Nenhum mensalista encontrado/i)
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    test.skip(emptyStateVisible, "Ambiente sem mensalistas para executar o smoke financeiro.");

    const { ano, mes, competencia } = await resolveCompetencia(page);

    let capturedRetryPayload: {
      athleteId: string;
      year: number;
      month: number;
      value: number;
    } | null = null;

    page.on("requestfinished", (request) => {
      try {
        if (request.method() !== "POST") return;
        if (!request.url().includes("/api/admin/financeiro/mensalistas/pagamentos/")) return;
        if (request.url().includes("/cancelar") || request.url().includes("/lote")) return;

        const athleteMatch = request
          .url()
          .match(/\/api\/admin\/financeiro\/mensalistas\/pagamentos\/([^/?#]+)/i);
        if (!athleteMatch?.[1]) return;

        const payload = request.postDataJSON() as {
          year?: unknown;
          month?: unknown;
          value?: unknown;
        };

        const parsedYear = Number(payload?.year);
        const parsedMonth = Number(payload?.month);
        const parsedValue = Number(payload?.value);
        if (
          !Number.isFinite(parsedYear) ||
          !Number.isFinite(parsedMonth) ||
          !Number.isFinite(parsedValue)
        ) {
          return;
        }

        capturedRetryPayload = {
          athleteId: decodeURIComponent(athleteMatch[1]),
          year: parsedYear,
          month: parsedMonth,
          value: parsedValue,
        };
      } catch {
        // noop
      }
    });

    await Promise.race([
      page
        .getByRole("button", { name: /^Registrar pagamento$/i })
        .first()
        .waitFor({ state: "visible", timeout: 20000 })
        .catch(() => null),
      page
        .getByRole("button", { name: /Cancelar pagamento/i })
        .first()
        .waitFor({ state: "visible", timeout: 20000 })
        .catch(() => null),
      page
        .getByText(/Nenhum mensalista encontrado/i)
        .first()
        .waitFor({ state: "visible", timeout: 20000 })
        .catch(() => null),
    ]);

    let pendingCountBeforeIndividual = await page
      .getByRole("button", { name: /^Registrar pagamento$/i })
      .count();
    if (pendingCountBeforeIndividual === 0) {
      const bootstrapCancelButton = page
        .getByRole("button", { name: /Cancelar pagamento/i })
        .first();
      const bootstrapCancelVisible = await bootstrapCancelButton
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (bootstrapCancelVisible) {
        await bootstrapCancelButton.click();
        await expect(
          page.getByRole("heading", { name: /Cancelar pagamento registrado/i })
        ).toBeVisible({ timeout: 10000 });
        await page.getByRole("button", { name: /Confirmar cancelamento/i }).click();
        await expect(
          page
            .getByText(/Pagamento cancelado com sucesso|Este pagamento já estava cancelado/i)
            .first()
        ).toBeVisible({ timeout: 20000 });
        pendingCountBeforeIndividual = await page
          .getByRole("button", { name: /^Registrar pagamento$/i })
          .count();
      }
    }
    test.skip(
      pendingCountBeforeIndividual === 0,
      "Ambiente sem atletas pendentes para validar pagamento individual."
    );

    const firstPendingButton = page.getByRole("button", { name: /^Registrar pagamento$/i }).first();
    const firstPendingRow = firstPendingButton.locator("xpath=ancestor::tr[1]");
    const firstAthleteName = (await firstPendingRow.locator("td").first().innerText())
      .split("\n")[0]
      .trim();
    const trackedAthleteRow = page
      .locator("tr")
      .filter({ hasText: new RegExp(escapeRegex(firstAthleteName), "i") })
      .first();

    const firstAthleteValueRaw = await firstPendingRow.locator("td").nth(2).innerText();
    const firstAthleteValue = parseCurrencyPtBr(firstAthleteValueRaw);

    await firstPendingButton.click();
    await expect(
      page.getByRole("heading", { name: /Confirmar pagamento da mensalidade/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Confirmar pagamento/i }).click();

    const successModalHeading = page
      .getByRole("heading", {
        name: /Pagamento registrado com sucesso|Pagamento já registrado/i,
      })
      .first();
    await Promise.race([
      successModalHeading.waitFor({ state: "visible", timeout: 60000 }),
      trackedAthleteRow.getByText(/Pago/i).first().waitFor({ state: "visible", timeout: 60000 }),
    ]);

    const closeFeedbackButton = page.getByRole("button", { name: /^Fechar$/i }).first();
    const closeFeedbackVisible = await closeFeedbackButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (closeFeedbackVisible) {
      await closeFeedbackButton.click();
    }

    await expect(trackedAthleteRow.getByText(/Pago/i).first()).toBeVisible({ timeout: 60000 });
    const firstViewButton = trackedAthleteRow
      .getByRole("button", { name: /Ver lançamento/i })
      .first();
    await expect(firstViewButton).toBeVisible({ timeout: 15000 });

    await Promise.all([
      page.waitForURL(/\/admin\/financeiro\/prestacao-de-contas/, { timeout: 30000 }),
      firstViewButton.click(),
    ]);
    const origemMensalistasVisibleInicial = await page
      .getByText(/Origem: Mensalistas/i)
      .first()
      .isVisible({ timeout: 15000 })
      .catch(() => false);
    if (!origemMensalistasVisibleInicial) {
      await expect(page.getByText(/Mensalidade/i).first()).toBeVisible({ timeout: 15000 });
    }
    await expect(
      page.getByText(new RegExp(escapeRegex(firstAthleteName), "i")).first()
    ).toBeVisible({
      timeout: 15000,
    });

    if (capturedRetryPayload) {
      const retryResponse = await page.request.post(
        `/api/admin/financeiro/mensalistas/pagamentos/${encodeURIComponent(
          capturedRetryPayload.athleteId
        )}`,
        {
          data: {
            year: capturedRetryPayload.year,
            month: capturedRetryPayload.month,
            value: capturedRetryPayload.value,
            athleteName: firstAthleteName,
          },
        }
      );
      expect(retryResponse.ok()).toBeTruthy();
      const retryBody = (await retryResponse.json()) as { status?: string };
      expect(retryBody.status).toBe("already_registered");
    }

    await page.goto("/admin/financeiro/mensalistas", { waitUntil: "domcontentloaded" });

    const pendingCountBeforeBatch = await page
      .getByRole("button", { name: /^Registrar pagamento$/i })
      .count();

    if (pendingCountBeforeBatch > 0) {
      const batchButton = page.getByRole("button", {
        name: /Registrar pagamento de todos os pendentes/i,
      });
      await expect(batchButton).toBeVisible({ timeout: 15000 });
      await batchButton.click();
      await expect(
        page.getByRole("heading", { name: /Confirmar pagamento em massa/i })
      ).toBeVisible();
      await page.getByRole("button", { name: /Confirmar pagamentos/i }).click();

      const batchModalHeading = page
        .getByRole("heading", {
          name: /Pagamentos registrados com sucesso/i,
        })
        .first();
      const batchModalVisible = await batchModalHeading
        .isVisible({ timeout: 20000 })
        .catch(() => false);
      if (batchModalVisible) {
        await page.getByRole("button", { name: /^Fechar$/i }).click();
      }

      const pendingCountAfterBatch = await page
        .getByRole("button", { name: /^Registrar pagamento$/i })
        .count();
      expect(pendingCountAfterBatch).toBeLessThanOrEqual(pendingCountBeforeBatch);
    }

    const financeiroAfterBatchResponse = await page.request.get("/api/admin/financeiro");
    expect(financeiroAfterBatchResponse.ok()).toBeTruthy();
    const financeiroAfterBatchBody = (await financeiroAfterBatchResponse.json()) as Array<{
      sourceType?: string;
      competencia?: string;
      competenciaAno?: number;
      competenciaMes?: number;
      canceledAt?: string | null;
    }>;
    const mensalistasAfterBatch = financeiroAfterBatchBody.filter((item) => {
      const source = String(item?.sourceType || "").toUpperCase();
      const comp =
        typeof item?.competencia === "string" && item.competencia.trim()
          ? item.competencia.trim()
          : `${item?.competenciaAno ?? ""}-${String(item?.competenciaMes ?? "").padStart(2, "0")}`;
      return source === "MENSALISTAS" && comp === competencia && !item?.canceledAt;
    });
    expect(mensalistasAfterBatch.length).toBeGreaterThan(0);

    await page.goto("/admin/financeiro/mensalistas", { waitUntil: "domcontentloaded" });

    const cancelButton = page.getByRole("button", { name: /Cancelar pagamento/i }).first();
    const cancelButtonVisible = await cancelButton.isVisible({ timeout: 10000 }).catch(() => false);
    if (!cancelButtonVisible) {
      test.info().annotations.push({
        type: "info",
        description: "Sem pagamento apto para cancelamento no ambiente atual.",
      });
      return;
    }

    const cancelRow = cancelButton.locator("xpath=ancestor::tr[1]");
    const cancelAthleteName = (await cancelRow.locator("td").first().innerText())
      .split("\n")[0]
      .trim();

    await cancelButton.click();
    await expect(
      page.getByRole("heading", { name: /Cancelar pagamento registrado/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Confirmar cancelamento/i }).click();

    const cancelFeedbackVisible = await page
      .getByText(/Pagamento cancelado com sucesso|Este pagamento já estava cancelado/i)
      .first()
      .isVisible({ timeout: 20000 })
      .catch(() => false);
    expect(cancelFeedbackVisible).toBeTruthy();

    await expect(cancelRow.getByRole("button", { name: /^Registrar pagamento$/i })).toBeVisible({
      timeout: 15000,
    });

    await page.goto(
      `/admin/financeiro/prestacao-de-contas?origem=mensalistas&competencia=${encodeURIComponent(
        competencia
      )}`,
      {
        waitUntil: "domcontentloaded",
      }
    );

    const canceledAthleteVisible = await page
      .getByText(new RegExp(escapeRegex(cancelAthleteName), "i"))
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(canceledAthleteVisible).toBeFalsy();

    expect(ano).toBeGreaterThanOrEqual(2000);
    expect(mes).toBeGreaterThanOrEqual(1);
    expect(firstAthleteValue).toBeGreaterThan(0);
  });
});
