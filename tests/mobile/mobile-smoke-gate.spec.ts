import { expect, test, type Page } from "@playwright/test";

type ViewportPreset = {
  name: string;
  width: number;
  height: number;
};

type TouchIssue = {
  tag: string;
  width: number;
  height: number;
  label: string;
};

type LayoutCheck = {
  overflow: boolean;
  touchIssues: TouchIssue[];
};

const MIN_TOUCH_TARGET = Number.parseInt(process.env.MOBILE_SMOKE_MIN_TOUCH_TARGET ?? "44", 10);

const MANDATORY_VIEWPORTS: ViewportPreset[] = [
  { name: "p_320x640", width: 320, height: 640 },
  { name: "p_360x740", width: 360, height: 740 },
  { name: "p_375x812", width: 375, height: 812 },
  { name: "p_390x844", width: 390, height: 844 },
  { name: "p_412x915", width: 412, height: 915 },
  { name: "p_480x800", width: 480, height: 800 },
  { name: "p_768x1024", width: 768, height: 1024 },
  { name: "l_640x320", width: 640, height: 320 },
  { name: "l_740x360", width: 740, height: 360 },
  { name: "l_812x375", width: 812, height: 375 },
  { name: "l_844x390", width: 844, height: 390 },
  { name: "l_915x412", width: 915, height: 412 },
  { name: "l_800x480", width: 800, height: 480 },
  { name: "l_1024x768", width: 1024, height: 768 },
];

const DEFAULT_ROUTES = [
  "/",
  "/partidas",
  "/estatisticas/ranking-geral",
  "/admin/login",
  "/superadmin/login",
];

function parseRoutes(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_ROUTES;

  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_ROUTES;

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((route) => (typeof route === "string" ? route.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      return DEFAULT_ROUTES;
    }
  }

  return trimmed
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean);
}

const CRITICAL_ROUTES = parseRoutes(process.env.MOBILE_SMOKE_ROUTES);

async function runLayoutChecks(page: Page) {
  return page.evaluate((minimumTouchSize) => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc ? doc.scrollWidth : 0, body ? body.scrollWidth : 0);

    const nodes = Array.from(
      document.querySelectorAll(
        "button, input[type='button'], input[type='submit'], input[type='email'], input[type='password'], select, textarea, [role='button']"
      )
    );

    const touchIssues: TouchIssue[] = [];

    for (const node of nodes) {
      const element = node as HTMLElement;
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.pointerEvents === "none"
      ) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;

      if (
        rect.bottom < 0 ||
        rect.right < 0 ||
        rect.top > window.innerHeight ||
        rect.left > window.innerWidth
      ) {
        continue;
      }

      if (rect.width < minimumTouchSize && rect.height < minimumTouchSize) {
        const label =
          (
            element.getAttribute("aria-label") ||
            element.getAttribute("name") ||
            element.innerText ||
            element.id ||
            element.tagName ||
            ""
          )
            .toString()
            .trim()
            .slice(0, 80) || element.tagName;

        touchIssues.push({
          tag: element.tagName,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          label,
        });
      }
    }

    return {
      overflow: scrollWidth - window.innerWidth > 1,
      touchIssues: touchIssues.slice(0, 20),
    };
  }, MIN_TOUCH_TARGET);
}

async function gotoWithRetry(page: Page, route: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await page.goto(route, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable = message.includes("ERR_ABORTED") || message.includes("frame was detached");

      if (!retryable || attempt === attempts) break;
      await page.waitForTimeout(1_500);
    }
  }

  throw lastError;
}

test.describe("mobile smoke gate matrix", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "A matriz completa roda somente no projeto chromium."
    );
  });

  for (const viewport of MANDATORY_VIEWPORTS) {
    test.describe(viewport.name, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const route of CRITICAL_ROUTES) {
        test(`${route} sem overflow e touch targets >= ${MIN_TOUCH_TARGET}px`, async ({
          page,
        }, testInfo) => {
          const response = await gotoWithRetry(page, route);

          const status = response?.status() ?? 0;
          expect(status, `HTTP inesperado na rota ${route}`).toBeLessThan(400);

          await page.waitForTimeout(1_200);

          const layout = (await runLayoutChecks(page)) as LayoutCheck;

          if (layout.overflow || layout.touchIssues.length > 0) {
            await testInfo.attach("layout-check", {
              body: JSON.stringify(
                {
                  route,
                  viewport,
                  overflow: layout.overflow,
                  touchIssues: layout.touchIssues,
                },
                null,
                2
              ),
              contentType: "application/json",
            });
          }

          expect(
            layout.overflow,
            `Overflow horizontal detectado em ${route} @ ${viewport.name}`
          ).toBe(false);

          expect(
            layout.touchIssues,
            `Touch targets menores que ${MIN_TOUCH_TARGET}px em ${route} @ ${viewport.name}`
          ).toHaveLength(0);
        });
      }
    });
  }
});
