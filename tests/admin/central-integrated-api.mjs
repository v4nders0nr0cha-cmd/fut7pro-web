import assert from "node:assert/strict";
import fs from "node:fs";
if (process.env.CENTRAL_HOMOLOGATION !== "1") throw new Error("Isolated homologation only");
const base = "http://127.0.0.1:4317";
let checks = 0;
const ok = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
async function login(email) {
  const r = await fetch(base + "/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "fixture-only-password" }),
  });
  assert.equal(r.status, 200);
  return (await r.json()).accessToken;
}
async function call(token, path, body, slug = "grupo-fixture") {
  const r = await fetch(base + "/billing/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: "Bearer " + token,
      "x-tenant-slug": slug,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, body: await r.json() };
}
const sub = "subscription/homolog-subscription";
const owner = await login("presidente@fixture.invalid");
for (const [email, history, cancel] of [
  ["presidente", true, true],
  ["vice", true, false],
  ["financeiro", true, false],
  ["futebol", false, false],
  ["superadmin", true, true],
]) {
  const token = await login(email + "@fixture.invalid");
  const caps = await call(token, "capabilities");
  ok(
    caps.status === 200 && caps.body.capabilities.canViewHistory === history,
    email + " history capability"
  );
  ok(caps.body.capabilities.canCancel === cancel, email + " cancellation capability");
  const invoices = await call(token, sub + "/invoices");
  ok(invoices.status === (history ? 200 : 403), email + " enforced history permission");
}
const overview = await call(owner, sub + "/overview");
ok(
  overview.body.access.canAccess && overview.body.financialStatus.code === "PENDENTE",
  "compensation and financial debt remain separate"
);
const refunds = await call(owner, sub + "/invoices?status=refunds");
ok(
  refunds.body.items.length === 2 && refunds.body.items.every((i) => i.refundedAmountCents > 0),
  "real refund filter"
);
const first = await call(owner, sub + "/invoices?limit=10");
const next = await call(
  owner,
  sub + "/invoices?limit=10&cursor=" + encodeURIComponent(first.body.page.nextCursor)
);
const records = [...first.body.items, ...next.body.items];
ok(
  new Set(records.map((i) => i.id)).size === records.length &&
    records.length >= 15 &&
    !next.body.page.hasMore,
  "real cursor pagination"
);
ok(
  (await call(owner, sub + "/invoices?status=__proto__")).status === 400,
  "invalid query rejected"
);
ok(
  (await call(owner, "subscription/history-legacy-sub/invoices")).status === 404,
  "foreign subscription denied"
);
ok(
  (await call(owner, sub + "/overview", undefined, "history-legacy")).status === 403,
  "foreign tenant denied"
);
const pix = await Promise.all([call(owner, sub + "/pix", {}), call(owner, sub + "/pix", {})]);
const successes = pix.filter((r) => r.status === 201);
ok(
  successes.length >= 1 && new Set(successes.map((r) => r.body.invoice.id)).size === 1,
  "simultaneous PIX has one charge"
);
const reused = await call(owner, sub + "/pix", {});
ok(
  reused.status === 201 && reused.body.invoice.id === successes[0].body.invoice.id,
  "pending PIX reused"
);
const status = await call(owner, sub + "/status");
ok(status.body.active === false, "pending PIX is not confirmed payment");
fs.mkdirSync("test-results/central-integrated-api", { recursive: true });
fs.writeFileSync(
  "test-results/central-integrated-api/result.json",
  JSON.stringify(
    {
      checks,
      backend: "Nest billing controllers + real JWT strategy + tenant/membership guards",
      database: "isolated PostgreSQL",
      paymentProvider: "simulated",
      administrativeShell: "fixture",
      passed: true,
    },
    null,
    2
  )
);
console.log(`${checks} integrated HTTP checks passed`);
