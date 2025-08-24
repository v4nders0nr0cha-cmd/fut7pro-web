import fs from "node:fs";

const base = process.env.BASE_URL;

if (!base)
  console.log("Skipping smoke test: BASE_URL is not set.");
  process.exit(0);
}

const list = JSON.parse(fs.readFileSync("scripts/ci/web-routes.json", "utf8"));

async function check(route, terms) {
  const url = base.replace(/\/$/, "") + route;
  const res = await fetch(url, { redirect: "manual" });
  if (res.status >= 300 && res.status < 400) {
    throw new Error(`Redirecionamento inesperado em ${url} status ${res.status}`);
  }
  if (res.status !== 200) {
    throw new Error(`status ${res.status} em ${url}`);
  }
  const html = await res.text();
  const ok = terms.some((t) => html.includes(t));
  if (!ok) throw new Error(`Conteúdo esperado não encontrado em ${url}. Procurado: ${terms.join(", ")}`);
  console.log(`OK ${url}`);
}

(async () => {
  for (const item of list) {
    await check(item.path, item.terms);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
