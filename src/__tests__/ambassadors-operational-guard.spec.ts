import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("ambassadors operational guards", () => {
  it("blocks the legacy marketing listing route instead of rendering the old mock UI", () => {
    const source = read("src/app/(superadmin)/superadmin/(protected)/(legacy)/marketing/page.tsx");

    expect(source).toContain("notFound()");
    expect(source).not.toContain("useState");
    expect(source).not.toContain("Registrar pagamento manual");
    expect(source).not.toContain("initialInfluencers");
  });

  it("blocks the legacy marketing detail route instead of allowing manual payment registration", () => {
    const source = read(
      "src/app/(superadmin)/superadmin/(protected)/(legacy)/marketing/[id]/page.tsx"
    );

    expect(source).toContain("notFound()");
    expect(source).not.toContain("RegistrarPagamentoModal");
    expect(source).not.toContain("calcularTotalVendas");
    expect(source).not.toContain("Registrar pagamento manual");
  });

  it("keeps recurring ledger materialization disabled during operational validation", () => {
    const source = read(
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/EmbaixadoresClient.tsx"
    );

    expect(source).toContain("Materializar ledger recorrente");
    expect(source).toContain(
      "Indisponível durante a validação operacional do programa de embaixadores."
    );
    expect(source).toContain("disabled");
  });

  it("shows four official levels and does not use the old recurring level 2 setting", () => {
    const source = read(
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/EmbaixadoresClient.tsx"
    );

    expect(source).toContain("level: 1 | 2 | 3 | 4");
    expect(source).toContain("Comissao nivel 1");
    expect(source).toContain("Comissao nivel 2");
    expect(source).toContain("Comissao nivel 3");
    expect(source).toContain("Comissao nivel 4");
    expect(source).not.toContain("recurringLevel2Cents");
    expect(source).toContain("recurringLevel3Cents");
    expect(source).toContain("recurringLevel4Cents");
  });
});
