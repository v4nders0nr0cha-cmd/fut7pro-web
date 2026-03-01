import { buildSecurityRequestHeaders } from "@/lib/security/requestHeaders";

describe("buildSecurityRequestHeaders", () => {
  it("forwards nonce and csp to the request headers clone", () => {
    const sourceHeaders = new Headers({
      accept: "text/html",
      "x-forwarded-host": "app.fut7pro.com.br",
    });

    const nonce = "nonce-123";
    const csp = "default-src 'self'; script-src 'self' 'nonce-nonce-123'";
    const forwardedHeaders = buildSecurityRequestHeaders(sourceHeaders, nonce, csp);

    expect(forwardedHeaders).not.toBe(sourceHeaders);
    expect(forwardedHeaders.get("x-nonce")).toBe(nonce);
    expect(forwardedHeaders.get("content-security-policy")).toBe(csp);
    expect(forwardedHeaders.get("accept")).toBe("text/html");
    expect(sourceHeaders.get("x-nonce")).toBeNull();
    expect(sourceHeaders.get("content-security-policy")).toBeNull();
  });
});
