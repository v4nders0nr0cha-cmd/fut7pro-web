import { getSession } from "next-auth/react";
import { mutate } from "swr";
import {
  buildPublicAthleteMeKey,
  buildPublicUnreadCountKey,
  syncPublicAuthState,
} from "@/utils/public-session-sync";

jest.mock("next-auth/react", () => ({
  getSession: jest.fn(),
}));

jest.mock("swr", () => ({
  mutate: jest.fn(),
}));

const mockedGetSession = getSession as jest.Mock;
const mockedMutate = mutate as jest.Mock;

const authenticatedSession = {
  user: {
    id: "user-1",
    name: "Pelé",
    accessToken: "access-token",
  },
};

describe("syncPublicAuthState", () => {
  beforeEach(() => {
    mockedGetSession.mockReset();
    mockedMutate.mockReset().mockResolvedValue(undefined);
  });

  it("confirma a sessao no servidor, atualiza o SessionProvider e revalida o tenant atual", async () => {
    const refreshSession = jest.fn().mockResolvedValue(authenticatedSession);
    mockedGetSession.mockResolvedValue(authenticatedSession);

    await expect(
      syncPublicAuthState({ publicSlug: "Casa-Do-Gamer", refreshSession })
    ).resolves.toEqual(authenticatedSession);

    expect(mockedGetSession).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(mockedMutate.mock.calls.map(([key]) => key)).toEqual([
      "/api/perfil/global",
      buildPublicAthleteMeKey("casa-do-gamer"),
      buildPublicUnreadCountKey("casa-do-gamer"),
    ]);
  });

  it("aguarda a transicao viva do SessionProvider no primeiro login", async () => {
    const waitForProviderSession = jest.fn().mockResolvedValue(authenticatedSession);
    mockedGetSession.mockResolvedValue(authenticatedSession);

    await expect(
      syncPublicAuthState({ publicSlug: "Casa-Do-Gamer", waitForProviderSession })
    ).resolves.toEqual(authenticatedSession);

    expect(waitForProviderSession).toHaveBeenCalledTimes(1);
    expect(mockedMutate).toHaveBeenCalledTimes(3);
  });

  it("recusa navegar quando a transicao viva do SessionProvider falha", async () => {
    const waitForProviderSession = jest
      .fn()
      .mockRejectedValue(new Error("PUBLIC_SESSION_PROVIDER_TIMEOUT"));
    mockedGetSession.mockResolvedValue(authenticatedSession);

    await expect(
      syncPublicAuthState({ publicSlug: "racha", waitForProviderSession })
    ).rejects.toThrow("PUBLIC_SESSION_PROVIDER_TIMEOUT");

    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("recusa continuar quando o servidor ainda nao confirma uma sessao utilizavel", async () => {
    mockedGetSession.mockResolvedValue(null);
    const refreshSession = jest.fn();

    await expect(syncPublicAuthState({ publicSlug: "racha", refreshSession })).rejects.toThrow(
      "PUBLIC_SESSION_NOT_CONFIRMED"
    );

    expect(refreshSession).not.toHaveBeenCalled();
    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("propaga falha de getSession sem tentar atualizar o provider", async () => {
    mockedGetSession.mockRejectedValue(new Error("network failure"));
    const refreshSession = jest.fn();

    await expect(syncPublicAuthState({ publicSlug: "racha", refreshSession })).rejects.toThrow(
      "network failure"
    );

    expect(refreshSession).not.toHaveBeenCalled();
    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("recusa navegar quando o SessionProvider permanece desatualizado", async () => {
    mockedGetSession.mockResolvedValue(authenticatedSession);
    const refreshSession = jest.fn().mockResolvedValue(null);

    await expect(syncPublicAuthState({ publicSlug: "racha", refreshSession })).rejects.toThrow(
      "PUBLIC_SESSION_PROVIDER_NOT_SYNCED"
    );

    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("propaga falha de update sem revalidar dados dependentes", async () => {
    mockedGetSession.mockResolvedValue(authenticatedSession);
    const refreshSession = jest.fn().mockRejectedValue(new Error("provider failure"));

    await expect(syncPublicAuthState({ publicSlug: "racha", refreshSession })).rejects.toThrow(
      "provider failure"
    );

    expect(mockedMutate).not.toHaveBeenCalled();
  });

  it("revalida somente as chaves da pelada informada em cada sincronizacao", async () => {
    const refreshSession = jest.fn().mockResolvedValue(authenticatedSession);
    mockedGetSession.mockResolvedValue(authenticatedSession);

    await syncPublicAuthState({ publicSlug: "primeira-pelada", refreshSession });
    mockedMutate.mockClear();
    await syncPublicAuthState({ publicSlug: "segunda-pelada", refreshSession });

    const revalidatedKeys = mockedMutate.mock.calls.map(([key]) => key);
    expect(revalidatedKeys).toContain("/api/me?slug=segunda-pelada&context=athlete");
    expect(revalidatedKeys).toContain("/api/public/segunda-pelada/notifications/unread-count");
    expect(revalidatedKeys).not.toContain("/api/me?slug=primeira-pelada&context=athlete");
  });
});
