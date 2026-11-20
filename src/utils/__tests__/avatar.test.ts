import { DEFAULT_ADMIN_AVATAR, DEFAULT_ATHLETE_AVATAR, getAvatarSrc } from "../avatar";

describe("avatar source", () => {
  it.each([
    undefined,
    null,
    "",
    "  ",
    "null",
    "undefined",
    "not-a-url",
    "javascript:void(0)",
    "https://[invalid",
    "//external.test/photo.jpg",
  ])("uses the neutral local placeholder for %s", (value) => {
    expect(getAvatarSrc(value)).toBe(DEFAULT_ATHLETE_AVATAR);
  });
  it.each([
    "/images/jogadores/jogador_padrao_01.jpg",
    "/images/jogadores/jogador_padrao_09.jpg?v=2",
    "https://app.fut7pro.com.br/images/jogadores/jogador_padrao_01.jpg",
    "/images/avatar_padrao_admin.png",
  ])("recognizes old system placeholders without changing stored data: %s", (value) => {
    expect(getAvatarSrc(value)).toBe(DEFAULT_ATHLETE_AVATAR);
    expect(getAvatarSrc(null, value)).toBe(DEFAULT_ATHLETE_AVATAR);
  });
  it.each([
    "/uploads/real-athlete.jpg",
    "https://api.fut7pro.com.br/uploads/real.jpg",
    "data:image/png;base64,aGVsbG8=",
    "blob:https://app.fut7pro.com.br/123",
  ])("preserves a real photo or local upload preview: %s", (value) => {
    expect(getAvatarSrc(`  ${value}  `)).toBe(value);
  });
  it("shares a neutral source for administrators and athletes and preserves explicit safe fallbacks", () => {
    expect(DEFAULT_ADMIN_AVATAR).toBe(DEFAULT_ATHLETE_AVATAR);
    expect(getAvatarSrc(null, "/images/custom-placeholder.svg")).toBe(
      "/images/custom-placeholder.svg"
    );
    expect(getAvatarSrc("https://photos.example/images/jogadores/jogador_padrao_01.jpg")).toBe(
      "https://photos.example/images/jogadores/jogador_padrao_01.jpg"
    );
  });
});
