import { test, expect } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
import { openSubscriptionCentral } from "./fixtures/subscription-central";

for (const width of [1280, 768, 390, 320]) {
  test(`Central completa, histórico e foco em ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const guide = await installGuide(page);
    Object.assign(guide.state, {
      dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
      preparationCelebratedAt: "2026-11-21T12:00:00Z",
      footballInvitePresentedAt: "2026-11-21T12:00:00Z",
      footballStartedAt: "2026-11-21T12:00:00Z",
    });
    const access = {
      canAccess: true,
      blocked: false,
      source: "COMPENSATION",
      accessStatus: "LIBERADO_POR_COMPENSACAO",
      compensationActive: true,
      effectiveAccessUntil: "2027-01-15T12:00:00Z",
      daysRemaining: 55,
    };
    const subscription = {
      id: "fixture-sub",
      tenantId: "fixture-tenant",
      planKey: "monthly_essential",
      interval: "month",
      amount: 15000,
      pricingPreview: {
        totalCents: 15000,
        baseAmountCents: 15000,
        discountCents: 0,
        discountPct: 0,
        isFirstPayment: true,
        firstPaymentDiscountApplied: false,
      },
      status: "past_due",
      requiresUpfront: false,
      marketingEnabled: false,
      access,
      invoices: [],
    };
    const pageData = (items: any[], more = false) => ({
      items,
      page: { limit: 10, hasMore: more, nextCursor: more ? "next-fixture" : null },
      coverage: {
        recordedFrom: "2026-01-01T00:00:00Z",
        earlierEventsUnavailable: true,
        reconstructed: false,
      },
    });
    const invoice = (n: number) => ({
      id: `invoice-${String(n).padStart(4, "0")}`,
      type: "RECURRING",
      createdAt: "2026-11-01T12:00:00Z",
      status: "paid",
      providerStatus: "approved",
      chargedAmountCents: 15000,
      paidAmountCents: 15000,
      refundedAmountCents: n === 1 ? 2500 : 0,
      confirmedDiscountAmountCents: null,
      currency: "BRL",
      paymentConfirmedAt: "2026-11-01T12:00:00Z",
      paymentMethod: "pix",
      commercialSnapshot: null,
      historicalTermsAvailable: false,
      receipt: null,
      receiptAvailability: "NOT_RECORDED",
    });
    let pixPosts = 0;
    await page.route("**/api/admin/billing/**", async (route) => {
      const url = new URL(route.request().url()),
        path = url.pathname;
      if (route.request().method() !== "GET") {
        pixPosts++;
        return route.fulfill({ status: 503, json: { message: "Falha isolada no provedor" } });
      }
      let body: any;
      if (path.endsWith("/plans"))
        body = {
          plans: [
            {
              key: "monthly_essential",
              label: "Essencial",
              amount: 150,
              interval: "month",
              features: ["Gestão dos atletas", "Estatísticas do grupo"],
            },
          ],
          meta: {},
        };
      else if (path.endsWith("/capabilities"))
        body = {
          tenantId: "fixture-tenant",
          subscriptionId: "fixture-sub",
          capabilities: {
            canViewHistory: true,
            canPay: true,
            canUseRecurring: true,
            canUsePix: true,
            canCancel: true,
            canChangePlan: false,
            canApplyCoupon: true,
            canCreateSubscription: false,
            changePlanRequiresSupport: true,
            operationPending: false,
          },
        };
      else if (path.endsWith("/status"))
        body = { access, active: false, financialStatus: { code: "PENDENTE", label: "Pendente" } };
      else if (path.endsWith("/overview"))
        body = {
          subscription: { ...subscription, amountCents: 15000, createdAt: "2026-01-01T00:00:00Z" },
          access,
          financialStatus: { code: "PENDENTE", label: "Pendente" },
          historyAvailable: true,
          invoices: { pending: 1, confirmed: 12 },
        };
      else if (path.endsWith("/benefits"))
        body = {
          ...pageData(
            url.searchParams.get("kind") === "coupons"
              ? []
              : [
                  {
                    id: "guide-reward",
                    source: "GUIDE_REWARD",
                    days: 10,
                    customerReason: "Conclusão do Guia Interativo",
                    reasonCategory: "REWARD",
                    type: "TRIAL_EXTENSION",
                    appliedAt: "2026-11-01T12:00:00Z",
                    previousAccessUntil: "2026-11-10T12:00:00Z",
                    newAccessUntil: "2026-11-20T12:00:00Z",
                    grantStatus: "APPLIED",
                    validity: "EXPIRED",
                    revertedAt: null,
                  },
                ]
          ),
          initialTrial: {
            evidence: "UNAVAILABLE",
            originalDays: null,
            start: null,
            originalEnd: null,
            originalPlanKey: null,
          },
          currentCouponTerms: null,
        };
      else if (/\/invoices\/[^/]+$/.test(path)) body = invoice(Number(path.split("-").pop()));
      else if (path.endsWith("/invoices"))
        body = url.searchParams.get("cursor")
          ? pageData([invoice(11), invoice(12)])
          : pageData(
              Array.from({ length: 10 }, (_, i) => invoice(i + 1)),
              true
            );
      else if (path.endsWith("/events")) body = pageData([]);
      else body = subscription;
      return route.fulfill({ json: body });
    });
    const groupReady = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/admin/access" && response.ok(),
      { timeout: 90000 }
    );
    await Promise.all([login(page), groupReady]);
    await expect(page.getByTestId("admin-dashboard-card-monetizacao")).toBeVisible({
      timeout: 30000,
    });
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find(
            (cookie) => cookie.name === "fut7pro_admin_active_tenant"
          )?.value
      )
      .toBe("grupo-fixture");
    await openSubscriptionCentral(page);
    await expect(
      page.getByRole("heading", { name: "Minha assinatura", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Acesso liberado", { exact: true })).toBeVisible();
    await expect(page.getByText("Pendente", { exact: true })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Central de Assinatura" });
    await page.screenshot({ path: testInfo.outputPath(`overview-${width}.png`), fullPage: true });
    await nav.getByRole("link", { name: "Benefícios" }).click();
    await expect(page).toHaveURL(/\/admin\/assinatura\/beneficios$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Benefícios do grupo" })).toBeVisible();
    await expect(page.getByText("Recompensa do Guia Interativo")).toBeVisible();
    await expect(
      page.getByText(/detalhes originais deste período não estão disponíveis/)
    ).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`benefits-${width}.png`), fullPage: true });
    await nav.getByRole("link", { name: "Pagamentos" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/admin\/assinatura\/pagamentos$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Pagamentos e cobranças" })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page
        .getByRole("button", { name: /Detalhar cobrança/ })
        .filter({ visible: true })
        .first()
    ).toBeVisible();
    const detail = page
      .getByRole("button", { name: /Detalhar cobrança/ })
      .filter({ visible: true })
      .first();
    await detail.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Detalhes da cobrança" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Devolução parcial")).toBeVisible();
    await expect(dialog.getByText("R$ 25,00")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(detail).toBeFocused();
    await page.getByRole("button", { name: /Próxima/ }).click();
    await expect(
      page.getByRole("button", { name: "Detalhar cobrança ICE-0012" }).filter({ visible: true })
    ).toBeVisible();
    await page.getByLabel("Situação", { exact: true }).selectOption("refunds");
    await page.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(page).toHaveURL(/status=refunds/);
    await page.screenshot({ path: testInfo.outputPath(`payments-${width}.png`), fullPage: true });
    await nav.getByRole("link", { name: "Planos", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/admin\/assinatura\/planos$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Planos para o seu grupo" })).toBeVisible();
    await expect(
      page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name: "Essencial", exact: true }) })
    ).toContainText(/R\$\s*150,00/);
    await page.screenshot({ path: testInfo.outputPath(`plans-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.goto("/admin/financeiro/planos-limites?faturas=1");
    await expect(page).toHaveURL(/\/admin\/assinatura\/pagamentos/);
    await page.goto("/admin/assinatura");
    const regularize = page.getByRole("button", { name: "Pagar cobrança" });
    await expect(regularize).toBeEnabled();
    await regularize.focus();
    await page.keyboard.press("Enter");
    const paymentDialog = page.getByRole("dialog", { name: "Escolha como deseja pagar" });
    await expect(paymentDialog).toBeVisible();
    await expect(paymentDialog.getByRole("checkbox")).toHaveCount(0);
    await paymentDialog.getByRole("button", { name: "Ver formas de pagamento" }).click();
    await expect(
      paymentDialog.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })
    ).toBeDisabled();
    await paymentDialog.getByRole("button", { name: "Pagar com PIX" }).click();
    await expect(paymentDialog.getByText(/Não foi possível confirmar a operação/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(paymentDialog).not.toBeVisible();
    await expect(regularize).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`payment-error-${width}.png`),
      fullPage: true,
    });
    expect(pixPosts).toBe(1);
  });
}
