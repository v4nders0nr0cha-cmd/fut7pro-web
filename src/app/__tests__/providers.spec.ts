import { getSessionProviderKey } from "@/app/providers";

describe("getSessionProviderKey", () => {
  it("remonta o SessionProvider quando a sessao anonima passa a autenticada", () => {
    const anonymousKey = getSessionProviderKey(undefined);
    const authenticatedSession = {
      user: {
        id: "user-1",
        email: "atleta@teste.com",
        accessToken: "access-token",
      },
      expires: "2099-01-01T00:00:00.000Z",
    } as unknown as Parameters<typeof getSessionProviderKey>[0];
    const authenticatedKey = getSessionProviderKey(authenticatedSession);

    expect(anonymousKey).toBe("anonymous");
    expect(authenticatedKey).toBe("authenticated:user-1");
    expect(authenticatedKey).not.toBe(anonymousKey);
  });
});
