import { test, expect } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
import { openSubscriptionCentral } from "./fixtures/subscription-central";

for (const width of [1280, 768, 390, 320]) {
  test(`PIX expirado, cortesia e conciliação em ${width}px`, async ({ page }, testInfo) => {
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
      effectiveAccessUntil: "2026-12-15T12:00:00Z",
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
      status: "pending",
      providerStatus: null,
      chargedAmountCents: 15000,
      paidAmountCents: null,
      refundedAmountCents: n === 1 ? 2500 : 0,
      confirmedDiscountAmountCents: null,
      currency: null,
      paymentConfirmedAt: null,
      paymentMethod: "pix",
      commercialSnapshot: null,
      historicalTermsAvailable: false,
      presentation: { pix: true, code: reconciled && n === 1 ? "PIX_CANCELED" : "PIX_EXPIRED", label: reconciled && n === 1 ? "PIX cancelado" : "PIX expirado", expiresAt: "2026-11-14T00:00:00Z", needsReconciliation: !reconciled },
      receipt: null,
      receiptAvailability: "NOT_RECORDED",
    });
    let reconciled = false;
    let pixPosts = 0;
    await page.route("**/api/admin/billing/**", async (route) => {
      const url = new URL(route.request().url()),
        path = url.pathname;
      if (route.request().method() !== "GET") {
        if (path.endsWith("/invoices/invoice-0001/reconcile")) {
          reconciled = true;
          return route.fulfill({ json: { outcome: "UPDATED", providerStatus: "cancelled", presentation: { label: "PIX cancelado" } } });
        }
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
            canViewHistory: true, canReconcilePayments: true,
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
          invoices: { pending: 0, confirmed: 0, pixAttempts: 3, pixExpired: reconciled ? 2 : 3, pixCanceled: reconciled ? 1 : 0, overdueConfirmed: 0, attemptsAreNotDebt: true, assessmentComplete: true },
          activeAccessBenefit: { source: "ADMIN_ADJUSTMENT", days: 90, reasonCategory: "COMMERCIAL_COURTESY", customerReason: "Cortesia", newAccessUntil: access.effectiveAccessUntil },
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
              Array.from({ length: 3 }, (_, i) => invoice(i + 1)),
              false
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
    await expect(page.getByText("Você está usando o Fut7Pro grátis!")).toBeVisible();
    await expect(page.getByText("3 tentativas PIX registradas")).toBeVisible();
    await expect(page.getByRole("button", { name: "Regularizar pagamento" })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`pix-overview-${width}.png`), fullPage: true });
    const nav = page.getByRole("navigation", { name: "Central de Assinatura" });
    await nav.getByRole("link", { name: "Pagamentos" }).click();
    const detail = page.getByRole("button", { name: /Detalhar cobrança/ }).filter({ visible: true }).first();
    await detail.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Detalhes da cobrança" });
    await expect(dialog.getByText("PIX expirado", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Conferir no Mercado Pago" }).click();
    await expect.poll(() => reconciled).toBe(true);
    await expect(dialog.getByText("PIX cancelado", { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`pix-reconciled-${width}.png`), fullPage: true });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(detail).toBeFocused();
    expect(pixPosts).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}
