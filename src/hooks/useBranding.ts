import { useCallback, useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { useAboutPublic, useAboutAdmin } from "@/hooks/useAbout";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { rachaConfig } from "@/config/racha.config";

type BrandingOptions = {
  scope?: "public" | "admin" | "superadmin";
  slug?: string;
};

function formatSlugName(slug: string) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useBranding(options?: BrandingOptions) {
  const { tenantSlug } = useRacha();
  const scope = options?.scope ?? "public";
  const resolvedSlug = options?.slug || tenantSlug || rachaConfig.slug;

  const publicAbout = useAboutPublic(scope === "public" ? resolvedSlug : undefined);
  const adminAbout = useAboutAdmin({ enabled: scope === "admin" });
  const shouldLoadRacha = scope !== "superadmin" && Boolean(resolvedSlug);
  const { racha, isLoading: isLoadingRacha } = useRachaPublic(shouldLoadRacha ? resolvedSlug : "");

  const about = scope === "admin" ? adminAbout.about : publicAbout.about;
  const isLoading =
    scope === "admin" ? adminAbout.isLoading : publicAbout.isLoading || isLoadingRacha;
  const aboutNome = about?.nome?.trim() || "";
  const aboutLogo = about?.logoUrl?.trim() || "";
  const rachaNome = racha?.nome?.trim() || "";
  const rachaLogo = racha?.logoUrl?.trim() || "";

  const branding = useMemo(() => {
    if (scope === "superadmin") {
      return {
        nome: rachaConfig.nome || "Fut7Pro",
        logo: rachaConfig.logo || "/images/logos/logo_fut7pro.png",
      };
    }
    const slugLabel = resolvedSlug ? formatSlugName(resolvedSlug) : "";
    const isDefaultAboutName =
      aboutNome &&
      resolvedSlug &&
      resolvedSlug !== rachaConfig.slug &&
      aboutNome.toLowerCase() === rachaConfig.nome.toLowerCase();
    const isDefaultRachaName =
      rachaNome &&
      resolvedSlug &&
      resolvedSlug !== rachaConfig.slug &&
      rachaNome.toLowerCase() === rachaConfig.nome.toLowerCase();
    const nome =
      (!isDefaultAboutName && aboutNome) ||
      (!isDefaultRachaName && rachaNome) ||
      (resolvedSlug && resolvedSlug !== rachaConfig.slug ? slugLabel : "") ||
      rachaConfig.nome ||
      "Fut7Pro";
    const isDefaultAboutLogo =
      aboutLogo && (aboutLogo === rachaConfig.logo || aboutLogo.includes("logo_fut7pro"));
    const logo =
      (aboutLogo && !isDefaultAboutLogo ? aboutLogo : "") ||
      rachaLogo ||
      rachaConfig.logo ||
      "/images/logos/logo_fut7pro.png";
    return { nome, logo };
  }, [aboutLogo, aboutNome, rachaLogo, rachaNome, resolvedSlug, scope]);

  const brandText = useCallback(
    (text: string) => text.replace(/fut7pro/gi, () => branding.nome),
    [branding.nome]
  );

  return { ...branding, brandText, isLoading };
}
