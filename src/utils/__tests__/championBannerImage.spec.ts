import { resolveChampionBannerImage } from "../championBannerImage";

describe("resolveChampionBannerImage", () => {
  it("prioriza bannerUrl quando banner e logo existem", () => {
    const result = resolveChampionBannerImage({
      bannerUrl: "https://cdn/banner.jpg",
      logoUrl: "https://cdn/logo.png",
      defaultImage: "/default.jpg",
    });

    expect(result.image).toBe("https://cdn/banner.jpg");
  });

  it("usa logo do time quando bannerUrl nao existe", () => {
    const result = resolveChampionBannerImage({
      bannerUrl: null,
      logoUrl: "https://cdn/logo.png",
      defaultImage: "/default.jpg",
    });

    expect(result.image).toBe("https://cdn/logo.png");
  });
  it("não usa Hawks como banner do campeão sem logo", () => {
    expect(resolveChampionBannerImage({ logoUrl: "/images/times/time_padrao_01.png", defaultImage: "/default.jpg" }).image).toBe("/default.jpg");
  });
});
