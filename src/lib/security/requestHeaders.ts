export function buildSecurityRequestHeaders(
  incomingHeaders: Headers,
  nonce: string,
  csp: string
): Headers {
  const requestHeaders = new Headers(incomingHeaders);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads this request header to apply nonce to framework/runtime scripts.
  requestHeaders.set("content-security-policy", csp);
  return requestHeaders;
}
