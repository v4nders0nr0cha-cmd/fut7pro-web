import { isEnvFlagEnabled, isSuperAdminLegacyEnabled } from "@/lib/feature-flags";

describe("feature flags", () => {
  const originalLegacyFlag = process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES;

  afterEach(() => {
    if (originalLegacyFlag === undefined) {
      delete process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES;
    } else {
      process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES = originalLegacyFlag;
    }
  });

  it("interpreta valores booleanos esperados", () => {
    expect(isEnvFlagEnabled("1")).toBe(true);
    expect(isEnvFlagEnabled("true")).toBe(true);
    expect(isEnvFlagEnabled("yes")).toBe(true);
    expect(isEnvFlagEnabled("on")).toBe(true);
    expect(isEnvFlagEnabled("0")).toBe(false);
    expect(isEnvFlagEnabled("false")).toBe(false);
    expect(isEnvFlagEnabled("no")).toBe(false);
    expect(isEnvFlagEnabled(undefined)).toBe(false);
  });

  it("mantem rotas legacy desativadas por padrao", () => {
    delete process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES;
    expect(isSuperAdminLegacyEnabled()).toBe(false);
  });

  it("habilita rotas legacy somente quando a flag estiver ativa", () => {
    process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES = "true";
    expect(isSuperAdminLegacyEnabled()).toBe(true);

    process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES = "false";
    expect(isSuperAdminLegacyEnabled()).toBe(false);
  });
});
