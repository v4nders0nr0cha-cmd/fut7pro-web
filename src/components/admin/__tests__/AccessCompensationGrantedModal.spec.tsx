import { render, screen } from "@testing-library/react";
import type { AdminNotificationItem } from "@/hooks/useAdminNotifications";
import AccessCompensationGrantedModal from "../AccessCompensationGrantedModal";

jest.mock("framer-motion", () => ({
  ...jest.requireActual("framer-motion"),
  useReducedMotion: () => true,
}));

function notification(overrides: Partial<AdminNotificationItem> = {}): AdminNotificationItem {
  return {
    id: "comp-1",
    tenantId: "tenant-1",
    recipientType: "ADMIN",
    recipientId: "admin-1",
    type: "ACCESS_COMPENSATION_GRANTED",
    title: "Acesso liberado por compensação",
    body: "Seu racha recebeu uma compensação de acesso de 7 dias extras.",
    href: "/admin/comunicacao/notificacoes?highlight=comp-1",
    readAt: null,
    isRead: false,
    metadata: {
      daysGranted: 7,
      newAccessUntil: "2099-05-01T12:00:00.000Z",
      reasonCategory: "COMMERCIAL_COURTESY",
      reasonDescription: "Cortesia de teste",
      incidentCode: "INC-123",
    },
    createdAt: "2026-04-11T10:00:00.000Z",
    updatedAt: "2026-04-11T10:00:00.000Z",
    ...overrides,
  };
}

function renderModal(item: AdminNotificationItem) {
  render(
    <AccessCompensationGrantedModal
      open
      notification={item}
      onDismiss={jest.fn()}
      onViewDetails={jest.fn()}
    />
  );
}

describe("AccessCompensationGrantedModal", () => {
  it("exibe a linguagem neutra e preserva os dados recebidos", () => {
    const item = notification();
    const original = JSON.parse(JSON.stringify(item));

    renderModal(item);

    expect(
      screen.getByRole("dialog", { name: "Compensação concedida ao seu grupo" })
    ).toBeInTheDocument();
    expect(screen.getByText("Seu grupo recebeu dias extras de acesso")).toBeInTheDocument();
    expect(
      screen.getByText("O Fut7Pro liberou um período extra de acesso para o seu grupo.")
    ).toBeInTheDocument();
    expect(screen.getByText("+7 dias")).toBeInTheDocument();
    expect(screen.getByText("01/05/2099")).toBeInTheDocument();
    expect(screen.getByText("Motivo: Cortesia comercial")).toBeInTheDocument();
    expect(screen.getByText("Detalhe: Cortesia de teste")).toBeInTheDocument();
    expect(screen.getByText("Incidente: INC-123")).toBeInTheDocument();
    expect(item).toEqual(original);
  });

  it.each(["+3 dias", "+3 dia(s)"])(
    "mantém o fallback de dias em uma notificação antiga com %s",
    (oldDays) => {
      const item = notification({
        body: `Compensação concedida: ${oldDays} de acesso.`,
        metadata: { newAccessUntil: "2099-05-01T12:00:00.000Z" },
      });
      const original = JSON.parse(JSON.stringify(item));

      renderModal(item);

      expect(screen.getByText("+3 dias")).toBeInTheDocument();
      expect(screen.getByText("01/05/2099")).toBeInTheDocument();
      expect(item).toEqual(original);
    }
  );
});
