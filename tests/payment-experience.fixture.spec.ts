import { test, expect } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
import { openSubscriptionCentral } from "./fixtures/subscription-central";

const before = process.env.PAYMENT_CAPTURE_BASELINE === "1";
const scenarios = (["month", "year"] as const).flatMap((interval) =>
  [1280, 768, 390, 320].map((width) => ({ interval, width }))
);
for (const { interval, width } of scenarios) {
  const baseCents = interval === "month" ? 15000 : 150000;
  const planKey = interval === "month" ? "monthly_essential" : "yearly_essential";
  const planLabel = interval === "month" ? "Essencial Mensal" : "Essencial Anual";
  test(`escolha de pagamento, cupom e foco ${interval} ${width}px`, async ({ page }, info) => {
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
      applyPosts = 0,
      recurringLinked = false;
    const access = {
      canAccess: true,
      blocked: false,
      source: "TRIAL",
      accessStatus: "TESTE",
      effectiveAccessUntil: "2027-01-15T12:00:00Z",
    };
    const pricing = () => ({
      baseAmountCents: baseCents,
      totalCents: coupon ? baseCents * 0.8 : baseCents,
      recurringAmountCents: baseCents,
      discountCents: coupon ? baseCents * 0.2 : 0,
      discountPct: coupon ? 20 : 0,
      isFirstPayment: true,
      firstPaymentDiscountApplied: Boolean(coupon),
      recurringDiscountApplied: false,
    });
    const subscription = () => ({
      id: "fixture-sub",
      tenantId: "fixture-tenant",
      planKey,
      interval,
      amount: baseCents,
      mpPreapprovalId: recurringLinked ? "fixture-recurring" : undefined,
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
          priceWithCouponCents: baseCents * 0.8,
          recurringAmountCents: baseCents,
          couponAppliesToRecurring: false,
        };
      else if (path.endsWith("plans"))
        body = {
          plans: [
            {
              key: planKey,
              label: planLabel,
              interval,
              amount: baseCents / 100,
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
        body = {
          active: false,
          preapproval: recurringLinked ? "authorized" : "pending",
          access,
          financialStatus: subscription().financialStatus,
        };
      else if (path.endsWith("overview"))
        body = {
          subscription: {
            ...subscription(),
            amountCents: baseCents,
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
      name: "Configurar pagamento",
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
    const mercadoPago = dialog.getByRole("region", {
      name: "Mercado Pago - assinatura automática",
    });
    await expect(mercadoPago).toBeVisible();
    const logo = mercadoPago.locator("img");
    await expect(logo).toHaveAttribute("src", "/images/payments/mercado-pago-logo.png");
    await expect
      .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBe(600);
    const imageResponse = await page.request.get("/images/payments/mercado-pago-logo.png");
    expect(imageResponse.ok()).toBe(true);
    expect(imageResponse.headers()["content-type"]).toContain("image/png");
    expect(
      await logo.evaluate((image: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return {
          width: image.naturalWidth,
          height: image.naturalHeight,
          alpha: context.getImageData(0, 0, 1, 1).data[3],
          fit: getComputedStyle(image).objectFit,
          renderedWidth: image.getBoundingClientRect().width,
          renderedHeight: image.getBoundingClientRect().height,
        };
      })
    ).toEqual({
      width: 600,
      height: 442,
      alpha: 0,
      fit: "contain",
      renderedWidth: 32,
      renderedHeight: 24,
    });
    await expect(
      dialog.getByText(
        interval === "month"
          ? /um mês de cada vez. No mês seguinte/
          : /um ano de cada vez. No ano seguinte/
      )
    ).toBeVisible();
    await expect(dialog.getByText(/Você já tem uma assinatura automática/)).toHaveCount(0);
    const help = dialog
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "Qual a diferença entre as opções?" }) });
    await expect(help).not.toHaveAttribute("open", "");
    const helpToggle = help.locator("summary");
    await helpToggle.focus();
    await page.keyboard.press("Enter");
    await expect(help).toHaveAttribute("open", "");
    await expect(
      help.getByText(interval === "month" ? /uma vez por mês/ : /uma vez por ano/)
    ).toBeVisible();
    await page.screenshot({ path: info.outputPath(`after-help-${width}.png`), fullPage: false });
    await page.keyboard.press("Enter");
    await expect(help).not.toHaveAttribute("open", "");
    expect(pixPosts + cardPosts + applyPosts).toBe(0);
    await expect(dialog.getByRole("heading", { name: /Cartão de crédito/ })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: /Pagar com PIX/ })).toBeEnabled();
    await dialog.getByRole("button", { name: /Ver formas de pagamento/ }).click();
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
    await expect(
      dialog.getByText(interval === "month" ? /120,00/ : /1\.200,00/).first()
    ).toBeVisible();
    await expect(
      dialog.getByText(interval === "month" ? /Depois:.*150,00/ : /Depois:.*1\.500,00/)
    ).toBeVisible();
    await expect(dialog.getByRole("checkbox")).not.toBeChecked();
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" }).click();
    await expect(dialog.getByText(/Provedor simulado/)).toBeVisible();
    expect(cardPosts).toBe(1);
    await dialog.getByRole("checkbox").uncheck();
    await expect(
      dialog.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })
    ).toBeDisabled();
    await dialog.getByRole("button", { name: /Pagar com PIX/ }).click();
    await expect(page.getByLabel("Código PIX copia e cola")).toHaveValue(
      "PIX-FICTICIO-SEM-VALOR-PARA-PAGAMENTO"
    );
    await expect(
      page.getByRole("dialog").getByText(interval === "month" ? /120,00/ : /1\.200,00/)
    ).toBeVisible();
    expect(pixPosts).toBe(1);
    expect(applyPosts).toBe(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(payment).toBeFocused();
    mode = "VENCIDO";
    recurringLinked = true;
    await page.getByRole("button", { name: "Atualizar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Regularizar pagamento", exact: true })
    ).toBeEnabled();
    await page.getByRole("button", { name: "Regularizar pagamento", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pagar com PIX" })).toHaveAccessibleDescription(
      "Você já tem uma assinatura automática. Pagar com PIX não cancela essa assinatura."
    );
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}
