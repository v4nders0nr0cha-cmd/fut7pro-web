import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";
import { isFut7ProAccountComplete } from "@/utils/public-auth-flow";

describe("Fut7Pro session and global profile rules", () => {
  it("does not treat terminal token errors as usable sessions", () => {
    expect(
      hasUsableFut7ProSession(
        { user: { accessToken: "token", tokenError: "RefreshAccessTokenError" } },
        "authenticated"
      )
    ).toBe(false);
    expect(hasUsableFut7ProSession({ user: { accessToken: "token" } }, "authenticated")).toBe(true);
  });

  it("requires secondary position for line players but not for goalkeeper", () => {
    expect(
      isFut7ProAccountComplete({
        name: "Neymar",
        position: "Atacante",
        birthDay: 5,
        birthMonth: 2,
      })
    ).toBe(false);
    expect(
      isFut7ProAccountComplete({
        name: "Neymar",
        position: "Atacante",
        positionSecondary: "Meia",
        birthDay: 5,
        birthMonth: 2,
      })
    ).toBe(true);
    expect(
      isFut7ProAccountComplete({
        name: "Goleiro",
        position: "Goleiro",
        birthDay: 1,
        birthMonth: 1,
      })
    ).toBe(true);
  });
});
