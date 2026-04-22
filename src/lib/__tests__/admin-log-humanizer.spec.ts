import { humanizeAdminLog } from "@/lib/admin-log-humanizer";
import type { AdminLog } from "@/types/admin";

describe("humanizeAdminLog", () => {
  it("turns deleted round payloads into a short administrative summary", () => {
    const log: AdminLog = {
      id: "log-1",
      action: "RODADA_EXCLUIDA",
      adminId: "user-1",
      adminName: "Felipe",
      adminEmail: "felipe@racha.com",
      timestamp: "2026-04-18T20:46:16.679Z",
      details: JSON.stringify({
        action: "RODADA_EXCLUIDA",
        dateKey: "2026-04-12",
        deletedAt: "2026-04-18T20:46:16.679Z",
        actorUserId: "user-1",
        reason: "Lançamento incorreto - lançamento apenas de duas partidas",
        matches: [{ id: "match-1" }, { id: "match-2" }],
        impact: {
          matches: 2,
          presences: 18,
          goals: 9,
          assists: 6,
        },
      }),
    };

    const humanized = humanizeAdminLog(log);

    expect(humanized.actionLabel).toBe("Rodada excluída");
    expect(humanized.actorLabel).toBe("Felipe");
    expect(humanized.summary).toContain("Rodada de 12/04/2026 excluída.");
    expect(humanized.summary).toContain(
      "Motivo informado: Lançamento incorreto - lançamento apenas de duas partidas."
    );
    expect(humanized.summary).toContain(
      "Impacto: 2 partidas, 18 presenças, 9 gols, 6 assistências."
    );
    expect(humanized.summary).not.toContain("actorUserId");
    expect(humanized.technicalDetails).toContain('"actorUserId"');
  });

  it("hides technical email lookup data from the main summary", () => {
    const log: AdminLog = {
      id: "log-2",
      action: "AUTH_LOOKUP_EMAIL",
      details: JSON.stringify({
        tenantSlug: "meu-racha",
        emailHash: "abc123",
        ip: "192.168.0.10",
        userAgent: "Mozilla/5.0",
      }),
    };

    const humanized = humanizeAdminLog(log);

    expect(humanized.actionLabel).toBe("Consulta de e-mail no acesso");
    expect(humanized.actorLabel).toBe("Sistema");
    expect(humanized.summary).toContain("dados sensíveis ficam ocultos");
    expect(humanized.summary).not.toContain("emailHash");
    expect(humanized.technicalDetails).toContain('"emailHash": "[redigido]"');
    expect(humanized.technicalDetails).toContain("192.168.***.***");
  });

  it("keeps already useful admin-role messages readable", () => {
    const log: AdminLog = {
      id: "log-3",
      action: "ADMIN_ROLE_ASSIGNED",
      adminName: "Felipe",
      details: "Presidente definiu Lucas como Vice-Presidente.",
    };

    const humanized = humanizeAdminLog(log);

    expect(humanized.actionLabel).toBe("Cargo administrativo atribuído");
    expect(humanized.summary).toBe("Presidente definiu Lucas como Vice-Presidente.");
    expect(humanized.technicalDetails).toBeNull();
  });

  it("converts superadmin access compensation events into customer-facing language", () => {
    const log: AdminLog = {
      id: "log-4",
      action: "superadmin:access-compensation:notification-result",
      details: JSON.stringify({
        status: "delivered",
        result: "ok",
        tenantSlug: "racha",
      }),
    };

    const humanized = humanizeAdminLog(log);

    expect(humanized.actionLabel).toBe("Notificação sobre ajuste de acesso");
    expect(humanized.contextLabel).toBe("Acesso do racha");
    expect(humanized.summary).toContain("notificação sobre ajuste de acesso");
    expect(humanized.summary).not.toContain("superadmin");
  });

  it("keeps a non-empty summary for unknown JSON payloads", () => {
    const log: AdminLog = {
      id: "log-5",
      action: "EVENTO_NOVO_INTERNO",
      details: JSON.stringify({
        actorUserId: "user-1",
        tenantSlug: "racha",
        internalKey: "value",
      }),
    };

    const humanized = humanizeAdminLog(log);

    expect(humanized.actionLabel).toBe("Evento novo interno");
    expect(humanized.summary).toBe(
      "Evento registrado com informações adicionais. Os detalhes técnicos ficam disponíveis para auditoria."
    );
    expect(humanized.technicalDetails).toContain('"actorUserId"');
  });
});
