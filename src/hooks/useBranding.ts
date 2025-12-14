import { useCallback, useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { useAboutPublic, useAboutAdmin } from "@/hooks/useAbout";
import { rachaConfig } from "@/config/racha.config";

type BrandingOptions = {
  scope?: "public" | "admin" | "superadmin";
  slug?: string;
};

export function useBranding(options?: BrandingOptions) {
  const { tenantSlug } = useRacha();
  const scope = options?.scope ?? "public";
  const resolvedSlug = options?.slug || tenantSlug || rachaConfig.slug;

  const publicAbout = useAboutPublic(scope === "public" ? resolvedSlug : undefined);
  const adminAbout = useAboutAdmin();

  const about = scope === "admin" || scope === "superadmin" ? adminAbout.about : publicAbout.about;
  const isLoading =
    scope === "admin" || scope === "superadmin" ? adminAbout.isLoading : publicAbout.isLoading;

  const branding = useMemo(() => {
    const nome = about?.nome || rachaConfig.nome || "Fut7Pro";
    const logo = about?.logoUrl || rachaConfig.logo || "/images/logos/logo_fut7pro.png";
    return { nome, logo };
  }, [about?.logoUrl, about?.nome]);

  const brandText = useCallback(
    (text: string) => text.replace(/fut7pro/gi, () => branding.nome),
    [branding.nome]
  );

  return { ...branding, brandText, isLoading };
}
