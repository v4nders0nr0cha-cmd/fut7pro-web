// tests/utils/locators.ts
import type { Page, Locator } from "@playwright/test";

function accentInsensitive(pattern: string | RegExp): RegExp {
  const src = typeof pattern === "string" ? pattern : pattern.source;
  const map: Record<string, string> = {
    a: "aáàâãä",
    e: "eéêë",
    i: "iíï",
    o: "oóôõö",
    u: "uúü",
    c: "cç",
  };
  return new RegExp(
    src.replace(/[aeiouc]/gi, (ch) => {
      const low = ch.toLowerCase();
      const cls = map[low] ?? low;
      const set = `${cls}${cls.toUpperCase()}`;
      return `[${set}]`;
    }),
    "i"
  );
}

export function visibleHeading(page: Page, text: RegExp | string): Locator {
  const name = accentInsensitive(text);
  return page.getByRole("heading", { name }).first();
}
