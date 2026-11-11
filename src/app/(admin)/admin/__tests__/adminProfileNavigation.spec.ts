import { ADMIN_BILLING_HREF, getAdminProfileSections } from "../adminProfileNavigation";

describe("navegação compartilhada do perfil administrativo", () => {
  it("mantém os destinos de conta, assinatura e ajuda para desktop e Mais", () => {
    const sections = getAdminProfileSections({
      tenantSlug: "seu-racha",
      athleteKey: "felipe",
      canSwitchGroup: true,
    });
    const items = sections.flatMap((section) => section.items);
    expect(sections.map((section) => section.title)).toEqual([
      "Minha conta",
      "Assinatura Fut7Pro",
      "Ajuda e orientação",
    ]);
    expect(items.find((item) => item.id === "billing")?.href).toBe(ADMIN_BILLING_HREF);
    expect(items.find((item) => item.id === "group-profile")?.href).toBe("/seu-racha/perfil");
    expect(items.find((item) => item.id === "public-profile")?.href).toBe(
      "/seu-racha/atletas/felipe"
    );
    expect(items.find((item) => item.id === "switch-group")?.href).toBe("/admin/selecionar-racha");
  });

  it("oculta opções dependentes de grupo e atleta quando não disponíveis", () => {
    const ids = getAdminProfileSections({
      tenantSlug: null,
      athleteKey: null,
      canSwitchGroup: false,
    }).flatMap((section) => section.items.map((item) => item.id));
    expect(ids).not.toContain("group-profile");
    expect(ids).not.toContain("public-profile");
    expect(ids).not.toContain("switch-group");
    expect(ids).toContain("billing");
  });
});
