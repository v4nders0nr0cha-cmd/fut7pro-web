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
      "Indisponível durante a validação operacional do programa Creators Fut7Pro."
    );
    expect(source).toContain("disabled");
  });

  it("shows four official levels and does not use the old recurring level 2 setting", () => {
    const source = read(
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/EmbaixadoresClient.tsx"
    );

    expect(source).toContain("type CreatorLevel = 1 | 2 | 3 | 4");
    expect(source).toContain("level: CreatorLevel");
    expect(source).toContain("autoLevel?: CreatorLevel");
    expect(source).toContain("manualMinimumLevel?: CreatorLevel | null");
    expect(source).toContain("effectiveLevel?: CreatorLevel");
    expect(source).toContain("Comissao Creator");
    expect(source).toContain("Comissao Creator Embaixador");
    expect(source).toContain("Comissao Creator Pro");
    expect(source).toContain("Comissao Creator VIP");
    expect(source).not.toContain("recurringLevel2Cents");
    expect(source).toContain("recurringLevel3Cents");
    expect(source).toContain("recurringLevel4Cents");
  });

  it("shows application profile and creator motivation as read-only review data", () => {
    const source = read(
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/EmbaixadoresClient.tsx"
    );

    expect(source).toContain("creatorMotivation: string | null");
    expect(source).toContain("Perfil de atuação");
    expect(source).toContain("Motivação para ser Creator");
    expect(source).toContain('|| "Não informado"');
    expect(source).not.toContain("Nicho:");
    expect(source).not.toContain("setCreatorMotivation");
  });

  it("uses Creators Fut7Pro naming on visible web surfaces while preserving technical routes", () => {
    const visibleSources = [
      "src/app/(superadmin)/superadmin/Sidebar.tsx",
      "src/components/layout/BottomMenuSuperAdmin.tsx",
      "src/app/(superadmin)/superadmin/Header.tsx",
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/suporte/page.tsx",
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/page.tsx",
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/gestao/page.tsx",
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/EmbaixadoresClient.tsx",
      "src/app/(superadmin)/superadmin/(protected)/(operacoes)/embaixadores/gestao/EmbaixadoresGestaoClient.tsx",
      "src/app/cadastrar-racha/layout.tsx",
      "src/app/cadastrar-racha/page.tsx",
      "src/app/(admin)/admin/financeiro/planos-limites/page.tsx",
    ]
      .map(read)
      .join("\n");

    expect(visibleSources).toContain("Creators Fut7Pro");
    expect(visibleSources).toContain("Creator Embaixador");
    expect(visibleSources).toContain("Cupom Creator");
    expect(visibleSources).toContain("Vínculo Creator/racha");
    expect(visibleSources).toContain("Aguardando retorno do Creator");

    const forbiddenVisibleLabels = [
      "Solicitações de Embaixador",
      "Solicitacoes de Embaixador",
      "Gestão de Embaixadores",
      "Gestao de Embaixadores",
      "Excluir Embaixador",
      "Excluir embaixador",
      "Suspender Embaixador",
      "Reativar Embaixador",
      "Área do Embaixador",
      "Painel do Embaixador",
      "cupom de embaixador",
      "Cupom de embaixador",
      "cupom do embaixador",
      "Cupom do link de embaixador",
      "seu embaixador",
      "Autoindicação",
    ];

    for (const forbidden of forbiddenVisibleLabels) {
      expect(visibleSources).not.toContain(forbidden);
    }
  });
});
