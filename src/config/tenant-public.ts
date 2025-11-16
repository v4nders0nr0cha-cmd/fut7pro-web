import { rachaConfig } from "@/config/racha.config";

export const DEFAULT_PUBLIC_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG?.trim() || rachaConfig.slug || "fut7pro";
