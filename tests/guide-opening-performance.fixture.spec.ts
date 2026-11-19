import { expect, test } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
const legacy = process.env.GUIDE_PERF_MODE === "legacy";
const apiDelayMs = 6000;
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  for (const route of ["/admin/dashboard", "/admin/partidas/criar-times"]) {
    test(`guide opening performance ${viewport.name} ${route}`, async ({ page }, info) => {
      test.setTimeout(180_000);
      await page.setViewportSize(viewport);
      await installGuide(page);
      let armed = false;
      let calls = 0;
      await page.route("**/api/admin/guide", async (request) => {
        if (armed && request.request().method() === "GET") {
          calls++;
          await new Promise((resolve) => setTimeout(resolve, apiDelayMs));
        }
        await request.fallback();
      });
      await login(page);
      const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
      const samples: any[] = [];
      for (let index = 0; index < 3; index++) {
        if (new URL(page.url()).pathname !== route) {
          await page.waitForLoadState("networkidle");
          await page.goto(route);
        }
        await page.waitForLoadState("networkidle");
        const ack = page.getByRole("button", { name: "Entendi", exact: true });
        if (await ack.isVisible()) await ack.click();
        if (viewport.name === "desktop")
          await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
        const trigger =
          viewport.name === "mobile"
            ? page.getByLabel("Abrir Guia Interativo", { exact: true })
            : page
                .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
                .getByRole(legacy ? "link" : "button", { name: /Guia Interativo/ });
        await trigger.evaluate((element) => {
          const target = window as any;
          target.__guideTiming = {
            startedAt: 0,
            origin: performance.timeOrigin,
            originalPath: location.pathname,
          };
          const observer = new MutationObserver(() => {
            const metrics = target.__guideTiming;
            if (!metrics.startedAt) return;
            const visible = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')].find(
              (node) =>
                node.textContent?.includes("Guia Interativo Fut7Pro") &&
                node.getClientRects().length > 0
            );
            if (!visible) return;
            if (metrics.shellMs === undefined) {
              metrics.shellMs = performance.now() - metrics.startedAt;
              metrics.pathAtShell = location.pathname;
              requestAnimationFrame(() => {
                metrics.frameMs = performance.now() - metrics.startedAt;
              });
            }
            if (
              metrics.contentMs === undefined &&
              [...visible.querySelectorAll("h3")].some(
                (node) => node.textContent === "Cadastre os times"
              )
            )
              metrics.contentMs = performance.now() - metrics.startedAt;
          });
          observer.observe(document.body, { subtree: true, childList: true, attributes: true });
          element.addEventListener(
            "click",
            () => {
              target.__guideTiming.startedAt = performance.now();
            },
            { once: true, capture: true }
          );
          target.__guideTimingCleanup = () => observer.disconnect();
        });
        const initialCalls = calls;
        armed = true;
        const response = page.waitForResponse(
          (r) => new URL(r.url()).pathname === "/api/admin/guide" && r.request().method() === "GET"
        );
        await trigger.click();
        await expect(dialog).toBeVisible({ timeout: 20_000 });
        await expect(
          dialog.getByRole("heading", { name: "Cadastre os times", exact: true })
        ).toBeVisible();
        await response;
        await page.waitForLoadState("networkidle");
        const metrics = await page.evaluate(() => {
          const target = window as any;
          const timing = target.__guideTiming;
          const resources = (
            performance.getEntriesByType("resource") as PerformanceResourceTiming[]
          ).filter(
            (entry) =>
              new URL(entry.name).pathname === "/api/admin/guide" &&
              entry.startTime >= timing.startedAt
          );
          target.__guideTimingCleanup();
          return {
            ...timing,
            apiMs: resources.map((entry) => entry.responseEnd - entry.startTime),
            confirmationMs: resources.length
              ? Math.max(...resources.map((entry) => entry.responseEnd)) - timing.startedAt
              : null,
            sameDocument: timing.origin === performance.timeOrigin,
          };
        });
        metrics.getCalls = calls - initialCalls;
        expect(metrics.sameDocument).toBe(true);
        expect(metrics.getCalls).toBeGreaterThanOrEqual(1);
        if (legacy) expect(metrics.shellMs).toBeGreaterThanOrEqual(apiDelayMs - 100);
        else {
          expect(metrics.shellMs).toBeLessThan(1000);
          expect(metrics.pathAtShell).toBe(route);
          expect(metrics.contentMs).toBeLessThan(1000);
          expect(metrics.getCalls).toBe(1);
        }
        samples.push(metrics);
        armed = false;
        await dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
        await expect(dialog).toHaveCount(0);
      }
      if (!legacy) {
        const frames = samples.map((sample) => sample.frameMs).sort((a, b) => a - b);
        expect(frames[1]).toBeLessThanOrEqual(300);
      }
      const report = {
        mode: legacy ? "legacy" : "immediate",
        viewport,
        route,
        apiDelayMs,
        samples,
      };
      console.log("GUIDE_PERFORMANCE", JSON.stringify(report));
      await info.attach("guide-opening-performance", {
        body: JSON.stringify(report, null, 2),
        contentType: "application/json",
      });
    });
  }
}
