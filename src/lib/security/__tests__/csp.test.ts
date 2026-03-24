import { buildWebCsp } from "@/lib/security/csp";

function getDirective(csp: string, directive: string): string {
  return (
    csp
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${directive} `)) || ""
  );
}

describe("buildWebCsp", () => {
  it("usa nonce em script-src e remove unsafe-inline", () => {
    const csp = buildWebCsp({ nonce: "nonce-test", isProd: true });
    const scriptSrc = getDirective(csp, "script-src");

    expect(scriptSrc).toContain("'nonce-nonce-test'");
    expect(scriptSrc).toContain("'sha256-UD+8zGDNZL1t7UbARE6w2M2yzWVpmyqGrMs2AanBW2w='");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("permite unsafe-eval apenas fora de producao", () => {
    const csp = buildWebCsp({ nonce: "nonce-test", isProd: false });
    const scriptSrc = getDirective(csp, "script-src");

    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(scriptSrc).toContain("'unsafe-inline'");
  });
});
