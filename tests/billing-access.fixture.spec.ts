import { expect, test } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";

for (const width of [1280, 390, 320]) {
  test(`assinatura respeita acesso oficial em ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const guide = await installGuide(page);
    Object.assign(guide.state, {
      dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
      preparationCelebratedAt: "2026-11-21T12:00:00Z",
      footballInvitePresentedAt: "2026-11-21T12:00:00Z",
      footballStartedAt: "2026-11-21T12:00:00Z",
    });
    let canAccess = false;
    const access = () => ({
      canAccess,
      blocked: !canAccess,
      accessStatus: canAccess ? "LIBERADO_POR_COMPENSACAO" : "EXPIRADO",
      source: canAccess ? "COMPENSATION" : "SUBSCRIPTION",
      effectiveAccessUntil: "2099-01-01T00:00:00Z",
      daysRemaining: 55,
      compensationActive: canAccess,
    });
    const subscription = () => ({
      id: "fixture-sub",
      tenantId: "fixture-tenant",
      planKey: "monthly_essential",
      interval: "month",
      amount: 15000,
      status: "past_due",
      requiresUpfront: false,
      marketingEnabled: false,
      financialStatus: { code: "PENDENTE", label: "Pendente" },
      access: access(),
      invoices: [],
    });
    await page.route("**/api/admin/billing/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      expect(route.request().method()).toBe("GET");
      await route.fulfill({
        json: path.endsWith("/plans")
          ? { plans: [], meta: {} }
          : path.endsWith("/capabilities")
            ? { tenantId:"fixture-tenant",subscriptionId:"fixture-sub",capabilities:{canViewHistory:true,canPay:true,canUsePix:true,canUseRecurring:true} }
          : path.endsWith("/overview")
            ? {subscription:{...subscription(),amountCents:15000},access:access(),financialStatus:{code:"PENDENTE",label:"Pendente"}}
          : path.endsWith("/status")
            ? {
                access: access(),
                active: false,
                financialStatus: { code: "PENDENTE", label: "Pendente" },
              }
            : subscription(),
      });
    });
    await login(page);
    await page.goto("/admin/financeiro/planos-limites");
    const accessField = page.getByText("Status de acesso", { exact: true }).locator("..");
    await expect(accessField.getByText("Acesso bloqueado", { exact: true })).toBeVisible();
    await expect(page.getByText("Ativo", { exact: true })).toHaveCount(0);
    canAccess = true;
    await page.reload();
    await expect(accessField.getByText("Acesso liberado", { exact: true })).toBeVisible();
    await expect(
      page
        .getByText("Status financeiro", { exact: true })
        .locator("..")
        .getByText("Pendente", { exact: true })
    ).toBeVisible();
    const payment = page.getByRole("button", { name: "Regularizar pagamento", exact: true });
    await payment.focus();
    await expect(payment).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}
