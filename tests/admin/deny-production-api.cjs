const blocked = "api.fut7pro.com.br";
function deny(url) {
  if (url && new URL(url).hostname === blocked) {
    throw new Error(`Admin smoke blocked production API: ${url}`);
  }
}
const originalFetch = globalThis.fetch;
globalThis.fetch = function (input, init) {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  deny(url);
  return originalFetch.call(this, input, init);
};
for (const protocol of ["http", "https"]) {
  const client = require(`node:${protocol}`);
  for (const method of ["request", "get"]) {
    const original = client[method];
    client[method] = function (...args) {
      const target = args[0];
      const hostname =
        typeof target === "string" || target instanceof URL
          ? new URL(target).hostname
          : target?.hostname || target?.host;
      if (hostname === blocked)
        throw new Error(`Admin smoke blocked production API via ${protocol}.${method}`);
      return original.apply(this, args);
    };
  }
}
