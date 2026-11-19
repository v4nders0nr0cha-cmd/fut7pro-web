type ChampionBannerImageInput = {
  bannerUrl?: string | null;
  logoUrl?: string | null;
  defaultImage: string;
  isLoading?: boolean;
};

function normalizeImageUrl(value?: string | null) {
  const trimmed = value?.trim() || "";
  return trimmed || null;
}

export function resolveChampionBannerImage({
  bannerUrl,
  logoUrl,
  defaultImage,
  isLoading = false,
}: ChampionBannerImageInput) {
  const realBannerImage = normalizeImageUrl(bannerUrl);
  const fallbackTeamImage =
    logoUrl === "/images/times/time_padrao_01.png" ? null : normalizeImageUrl(logoUrl);
  const isImageLoading = !realBannerImage && !fallbackTeamImage && isLoading;

  return {
    image: realBannerImage || fallbackTeamImage || (!isImageLoading ? defaultImage : null),
    isImageLoading,
  };
}
