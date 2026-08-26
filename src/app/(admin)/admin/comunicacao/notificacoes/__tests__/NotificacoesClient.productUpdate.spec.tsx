import {
  getNotificationActionLabel,
  getNotificationTypeLabel,
  isProductUpdateNotification,
} from "../NotificacoesClient";
import type { AdminNotificationItem } from "@/hooks/useAdminNotifications";

function notification(overrides: Partial<AdminNotificationItem> = {}): AdminNotificationItem {
  return {
    id: "notification-1",
    tenantId: null,
    recipientType: "ADMIN",
    recipientId: "admin-1",
    type: "SYSTEM_ANNOUNCEMENT",
    title: "Aviso",
    body: "Mensagem",
    href: "/admin/configuracoes/changelog",
    readAt: null,
    isRead: false,
    metadata: null,
    createdAt: "2026-08-26T16:00:00.000Z",
    updatedAt: "2026-08-26T16:00:00.000Z",
    ...overrides,
  };
}

describe("product update admin notifications", () => {
  it("exibe product_update como Atualizacoes com CTA de novidades", () => {
    const item = notification({
      metadata: {
        category: "product_update",
        changelogVersion: "2026.08.26",
      },
    });

    expect(isProductUpdateNotification(item)).toBe(true);
    expect(getNotificationTypeLabel(item)).toBe("Atualizações");
    expect(getNotificationActionLabel(item)).toBe("Ver novidades");
  });

  it("mantem SYSTEM_ANNOUNCEMENT comum como Sistema e Abrir item", () => {
    const item = notification({
      metadata: {
        category: "maintenance",
      },
    });

    expect(isProductUpdateNotification(item)).toBe(false);
    expect(getNotificationTypeLabel(item)).toBe("Sistema");
    expect(getNotificationActionLabel(item)).toBe("Abrir item");
  });
});
