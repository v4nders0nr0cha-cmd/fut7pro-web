const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isEnvFlagEnabled(value: string | undefined | null): boolean {
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export function isSuperAdminLegacyEnabled(): boolean {
  return isEnvFlagEnabled(process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES);
}
