const fs = require("fs");

const pages = [
  "app/page.tsx",
  "app/partidas/page.tsx",
  "app/partidas/historico/page.tsx",
  "app/partidas/detalhes/page.tsx",
  "app/partidas/times-do-dia/page.tsx",
  "app/estatisticas/page.tsx",
  "app/estatisticas/ranking-geral/page.tsx",
  "app/estatisticas/artilheiros/page.tsx",
  "app/estatisticas/assistencias/page.tsx",
  "app/estatisticas/melhores-por-posicao/page.tsx",
  "app/estatisticas/graficos-visuais/page.tsx",
  "app/estatisticas/tira-teima/page.tsx",
  "app/os-campeoes/page.tsx",
  "app/perfil/page.tsx",
  "app/grandes-torneios/page.tsx",
  "app/sobre/page.tsx",
  "app/sobre/nossa-historia/page.tsx",
  "app/sobre/estatuto/page.tsx",
  "app/sobre/aniversariantes/page.tsx",
  "app/sobre/nossos-parceiros/page.tsx",
  "app/sobre/contato/page.tsx",
  "app/sobre/prestacao-de-contas/page.tsx",
];

const content = `export default function Page() { return <div>Página em construção</div>; }`;

pages.forEach((path) => {
  fs.writeFileSync(path, content, { encoding: "utf8" });
});
