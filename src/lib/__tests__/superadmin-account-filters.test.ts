import {
  DEFAULT_ACCOUNT_FILTERS,
  filterSuperAdminAccounts,
  getAccountDeletionBlockers,
} from "../superadmin-account-filters";
import type { Usuario } from "@/types/superadmin";

function account(overrides: Partial<Usuario>): Usuario {
  return {
    id: overrides.id || "user-1",
    nome: overrides.nome || "Conta QA",
    email: overrides.email || "qa@fut7pro.dev",
    criadoEm: overrides.criadoEm || "2026-01-01T12:00:00.000Z",
    memberships: [],
    ...overrides,
  };
}

describe("superadmin account filters", () => {
  const now = new Date("2026-04-20T12:00:00.000Z");

  it("searches by tenant name and membership role", () => {
    const users = [
      account({
        id: "president",
        nome: "Maria Presidente",
        memberships: [
          {
            id: "m1",
            role: "PRESIDENTE",
            status: "ATIVO",
            tenantId: "tenant-1",
            tenantNome: "Racha Central",
          },
        ],
      }),
      account({ id: "athlete", nome: "Joao Atleta", email: "joao@fut7pro.dev" }),
    ];

    expect(
      filterSuperAdminAccounts(users, "Racha Central", DEFAULT_ACCOUNT_FILTERS, now)
    ).toHaveLength(1);
    expect(filterSuperAdminAccounts(users, "Presidente", DEFAULT_ACCOUNT_FILTERS, now)[0].id).toBe(
      "president"
    );
  });

  it("combines inactivity and tenant-count filters", () => {
    const users = [
      account({ id: "never", lastLoginAt: undefined }),
      account({
        id: "recent",
        lastLoginAt: "2026-04-19T12:00:00.000Z",
        memberships: [{ id: "m2", tenantId: "tenant-2", tenantNome: "Racha Ativo" }],
      }),
      account({ id: "old", lastLoginAt: "2026-01-01T12:00:00.000Z" }),
    ];

    const result = filterSuperAdminAccounts(
      users,
      "",
      { ...DEFAULT_ACCOUNT_FILTERS, tenantCount: "0", inactivity: "90" },
      now
    );

    expect(result.map((user) => user.id)).toEqual(["never", "old"]);
  });

  it("does not mix unknown providers into the credentials filter", () => {
    const users = [
      account({ id: "credentials", authProvider: "credentials" }),
      account({ id: "passwordless", authProvider: "passwordless" }),
      account({ id: "google", authProvider: "google" }),
    ];

    const result = filterSuperAdminAccounts(
      users,
      "",
      { ...DEFAULT_ACCOUNT_FILTERS, provider: "credentials" },
      now
    );

    expect(result.map((user) => user.id)).toEqual(["credentials"]);
  });

  it("keeps date-only creation filters on the intended local calendar day", () => {
    const users = [
      account({ id: "inside", criadoEm: "2026-04-20T12:00:00.000Z" }),
      account({ id: "outside", criadoEm: "2026-04-21T12:00:00.000Z" }),
    ];

    const result = filterSuperAdminAccounts(
      users,
      "",
      { ...DEFAULT_ACCOUNT_FILTERS, createdFrom: "2026-04-20", createdTo: "2026-04-20" },
      now
    );

    expect(result.map((user) => user.id)).toEqual(["inside"]);
  });

  it("marks linked accounts as not safely deletable on the client preview", () => {
    const linked = account({
      memberships: [{ id: "m3", tenantId: "tenant-3", tenantNome: "Racha Bloqueado" }],
    });

    expect(getAccountDeletionBlockers(linked)).toEqual(["1 racha(s) vinculado(s)"]);
    expect(getAccountDeletionBlockers(account({ id: "free" }))).toEqual([]);
  });
});
