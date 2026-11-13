import http from "node:http";

const host = "127.0.0.1";
const port = 4317;
const password = "fixture-only-password";
const tenant = { id: "fixture-tenant", slug: "grupo-fixture", name: "Grupo Fixture" };
const accounts = {
  "presidente@fixture.invalid": { role: "PRESIDENTE", blocked: false, group: true },
  "admin@fixture.invalid": { role: "ADMIN", blocked: false, group: true },
  "futebol@fixture.invalid": { role: "DIRETOR_FUTEBOL", blocked: false, group: true },
  "bloqueado@fixture.invalid": { role: "PRESIDENTE", blocked: true, group: true },
  "sem-grupo@fixture.invalid": { role: "ADMIN", blocked: false, group: false },
};

function send(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function token(email) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
  ).toString("base64url");
  return `fixture.${payload}.${Buffer.from(email).toString("base64url")}`;
}

const tokenToEmail = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  console.error(`[fixture] ${req.method} ${url.pathname}`);
  if (url.pathname === "/health") return send(res, 200, { fixture: true });

  if (url.pathname === "/auth/login" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const credentials = JSON.parse(body || "{}");
    const email = String(credentials.email || "").toLowerCase();
    if (!accounts[email] || credentials.password !== password) {
      return send(res, 401, { message: "Credenciais de fixture inválidas" });
    }
    const accessToken = token(email);
    tokenToEmail.set(accessToken, email);
    return send(res, 200, { accessToken, refreshToken: `fixture-refresh:${email}` });
  }

  const accessToken = String(req.headers.authorization || "").replace(/^Bearer /, "");
  const email = tokenToEmail.get(accessToken);
  const account = email && accounts[email];
  if (!account) return send(res, 401, { message: "Fixture sem sessão" });

  if (url.pathname === "/auth/me") {
    return send(res, 200, {
      id: `fixture-${account.role.toLowerCase()}`,
      name: "Usuário Fixture",
      email,
      role: account.role,
      tenantId: account.group ? tenant.id : null,
      tenantSlug: account.group ? tenant.slug : null,
      emailVerified: true,
    });
  }
  if (url.pathname === "/admin/hub") {
    return send(
      res,
      200,
      account.group
        ? [
            {
              tenantId: tenant.id,
              tenantSlug: tenant.slug,
              tenantName: tenant.name,
              role: account.role,
              subscription: {
                status: account.blocked ? "BLOQUEADO" : "ATIVO",
                blocked: account.blocked,
              },
            },
          ]
        : []
    );
  }
  if (url.pathname === "/admin/access") {
    if (!account.group || req.headers["x-tenant-slug"] !== tenant.slug) {
      return send(res, 403, { message: "Grupo não autorizado" });
    }
    return send(res, 200, {
      allowed: !account.blocked,
      blocked: account.blocked,
      status: account.blocked ? "BLOQUEADO" : "ATIVO",
      reason: account.blocked ? "Assinatura bloqueada" : null,
      tenant,
      role: account.role,
    });
  }
  if (url.pathname === "/me") {
    return send(res, 200, {
      user: { id: `fixture-${account.role.toLowerCase()}`, email },
      tenant: account.group ? { tenantId: tenant.id, tenantSlug: tenant.slug } : null,
      membership: account.group ? { role: account.role, status: "APROVADO" } : null,
      athlete: null,
    });
  }
  if (account.blocked || !account.group) {
    return send(res, 403, { message: "Acesso ao grupo bloqueado" });
  }
  if (url.pathname === "/admin/about" && req.method === "GET") {
    return send(res, 200, {
      data: {
        nome: tenant.name,
        presidente: { nome: "Presidente Fixture", email: "presidente@fixture.invalid" },
      },
    });
  }
  if (url.pathname === "/admin/administradores" && req.method === "GET") {
    return send(res, 200, {
      slots: [
        { role: "PRESIDENTE", status: "ACTIVE", name: "Presidente Fixture" },
        { role: "VICE_PRESIDENTE", status: "EMPTY" },
        { role: "DIRETOR_FUTEBOL", status: "EMPTY" },
        { role: "DIRETOR_FINANCEIRO", status: "EMPTY" },
      ],
    });
  }
  if (url.pathname === "/admin/solicitacoes/count") {
    return send(res, 200, { count: 2 });
  }
  if (url.pathname === "/admin/mensalistas/requests/count") {
    return send(res, 200, { total: 1 });
  }
  if (url.pathname === `/public/${tenant.slug}/tenant`)
    return send(res, 200, { themeKey: "default" });
  return send(res, 404, { message: `Fixture sem contrato: ${req.method} ${url.pathname}` });
});

server.listen(port, host, () => console.log(`Admin fixture listening on ${host}:${port}`));
