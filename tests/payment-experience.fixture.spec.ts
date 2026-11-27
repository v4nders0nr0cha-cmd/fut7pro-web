import { test, expect } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
import { openSubscriptionCentral } from "./fixtures/subscription-central";

const before = process.env.PAYMENT_CAPTURE_BASELINE === "1";
for (const width of [1280, 768, 390, 320]) {
  test(`escolha de pagamento, cupom e foco ${width}px`, async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const guide = await installGuide(page);
    Object.assign(guide.state, {
      dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
      preparationCelebratedAt: "2026-11-21T12:00:00Z",
      footballInvitePresentedAt: "2026-11-21T12:00:00Z",
      footballStartedAt: "2026-11-21T12:00:00Z",
    });
    let coupon = "",
      mode = "TESTE",
      pixPosts = 0,
      cardPosts = 0,
      applyPosts = 0;
    const access = {
      canAccess: true,
      blocked: false,
      source: "TRIAL",
      accessStatus: "TESTE",
      effectiveAccessUntil: "2027-01-15T12:00:00Z",
    };
    const pricing = () => ({
      baseAmountCents: 15000,
      totalCents: coupon ? 12000 : 15000,
      recurringAmountCents: 15000,
      discountCents: coupon ? 3000 : 0,
      discountPct: coupon ? 20 : 0,
      isFirstPayment: true,
      firstPaymentDiscountApplied: Boolean(coupon),
      recurringDiscountApplied: false,
    });
    const subscription = () => ({
      id: "fixture-sub",
      tenantId: "fixture-tenant",
      planKey: "monthly_essential",
      interval: "month",
      amount: 15000,
      status: mode === "TESTE" ? "trialing" : "past_due",
      couponCode: coupon || undefined,
      trialEnd: "2027-01-15T12:00:00Z",
      pricingPreview: pricing(),
      access,
      financialStatus: { code: mode, label: mode === "TESTE" ? "Em teste" : "Vencido" },
    });
    await page.route("**/api/admin/billing/**", async (route) => {
      const url = new URL(route.request().url()),
        path = url.pathname;
      let body: any;
      if (route.request().method() === "POST") {
        if (path.endsWith("apply-coupon")) {
          applyPosts++;
          coupon = route.request().postDataJSON().couponCode;
          body = subscription();
        } else if (path.endsWith("/pix")) {
          pixPosts++;
          body = {
            invoice: { id: "fixture-invoice", amount: pricing().totalCents, status: "pending" },
            pricing: pricing(),
            pix: {
              qrCode: "PIX-FICTICIO-SEM-VALOR-PARA-PAGAMENTO",
              expiresAt: "2099-01-15T12:00:00Z",
            },
          };
        } else if (path.endsWith("activate")) {
          cardPosts++;
          return route.fulfill({
            status: 409,
            json: { message: "Provedor simulado: checkout não iniciado nesta verificação." },
          });
        } else return route.fulfill({ status: 400, json: { message: "Operação fora da fixture" } });
      } else if (path.includes("/coupon/"))
        body = {
          valid: path.endsWith("/VALIDO"),
          discountPct: 20,
          extraTrialDays: 5,
          priceWithCouponCents: 12000,
          recurringAmountCents: 15000,
          couponAppliesToRecurring: false,
        };
      else if (path.endsWith("plans"))
        body = {
          plans: [
            {
              key: "monthly_essential",
              label: "Essencial Mensal",
              interval: "month",
              amount: 150,
              features: [],
            },
          ],
          meta: {},
        };
      else if (path.endsWith("capabilities"))
        body = {
          tenantId: "fixture-tenant",
          subscriptionId: "fixture-sub",
          capabilities: {
            canViewHistory: true,
            canPay: true,
            canUseRecurring: true,
            canUsePix: true,
            canApplyCoupon: !coupon,
            canChangePlan: false,
            canCancel: true,
            operationPending: false,
          },
        };
      else if (path.endsWith("status"))
        body = { active: false, access, financialStatus: subscription().financialStatus };
      else if (path.endsWith("overview"))
        body = {
          subscription: {
            ...subscription(),
            amountCents: 15000,
            createdAt: "2026-11-01T12:00:00Z",
          },
          access,
          financialStatus: subscription().financialStatus,
          invoices: { pending: mode === "TESTE" ? 0 : 1, confirmed: 0 },
          historyAvailable: true,
        };
      else if (path.includes("/subscription/tenant")) body = subscription();
      else body = { items: [], page: { limit: 10, hasMore: false, nextCursor: null } };
      return route.fulfill({ json: body });
    });
    const groupReady = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/admin/access" && response.ok(),
      { timeout: 90000 }
    );
    await Promise.all([login(page), groupReady]);
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find(
            (cookie) => cookie.name === "fut7pro_admin_active_tenant"
          )?.value
      )
      .toBe("grupo-fixture");
    await openSubscriptionCentral(page);
    const payment = page.getByRole("button", {
      name: before ? "Regularizar pagamento" : "Configurar pagamento",
      exact: true,
    });
    await expect(payment).toBeEnabled({ timeout: 30000 });
    await page.screenshot({
      path: info.outputPath(`${before ? "before" : "after"}-overview-${width}.png`),
      fullPage: true,
    });
    if (!before) {
      await expect(
        page.getByRole("link", { name: "Consultar benefícios", exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Ver planos disponíveis", exact: true })
      ).toHaveCount(0);
    }
    await payment.focus();
    await page.keyboard.press("Enter");
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    if (!before) {
      const rect = await dialog.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.y).toBeGreaterThanOrEqual(0);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(901);
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 1);
    }
    await page.screenshot({
      path: info.outputPath(`${before ? "before" : "after"}-payment-${width}.png`),
      fullPage: false,
    });
    if (before) {
      await page.keyboard.press("Escape");
      return;
    }
    await expect(dialog.getByRole("checkbox")).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: /Pagar com PIX/ })).toBeEnabled();
    await dialog.getByRole("button", { name: /Continuar com cartão/ }).click();
    await expect(dialog.getByRole("checkbox")).toBeFocused();
    await expect(
      dialog.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })
    ).toBeDisabled();
    await dialog.getByRole("checkbox").check();
    await dialog.getByText("Tem um cupom de desconto?").click();
    await dialog.getByLabel("Código do cupom").fill("INVALIDO");
    await dialog.getByRole("button", { name: "Aplicar cupom", exact: true }).click();
    await expect(dialog.getByText(/Este cupom não está disponível/)).toBeVisible();
    expect(applyPosts).toBe(0);
    await dialog.getByLabel("Código do cupom").fill("VALIDO");
    await dialog.getByRole("button", { name: "Aplicar cupom", exact: true }).click();
    await expect(dialog.getByRole("button", { name: /Pagar com PIX/ })).toBeEnabled();
    await expect(dialog.getByText(/120,00/).first()).toBeVisible();
    await expect(dialog.getByText(/Depois:.*150,00/)).toBeVisible();
    await expect(dialog.getByRole("checkbox")).not.toBeChecked();
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" }).click();
    await expect(dialog.getByText(/Provedor simulado/)).toBeVisible();
    expect(cardPosts).toBe(1);
    await dialog.getByRole("button", { name: /Pagar com PIX/ }).click();
    await expect(page.getByLabel("Código PIX copia e cola")).toHaveValue(
      "PIX-FICTICIO-SEM-VALOR-PARA-PAGAMENTO"
    );
    await expect(page.getByRole("dialog").getByText(/120,00/)).toBeVisible();
    expect(pixPosts).toBe(1);
    expect(applyPosts).toBe(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(payment).toBeFocused();
    mode = "VENCIDO";
    await page.getByRole("button", { name: "Atualizar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Regularizar pagamento", exact: true })
    ).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}
