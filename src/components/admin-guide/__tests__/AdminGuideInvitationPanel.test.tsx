import type { ComponentProps } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminGuideInvitationPanel from "../AdminGuideInvitationPanel";
import type { AdminGuideData } from "@/types/admin-guide";
let guide: AdminGuideData;
const update = jest.fn();
const onBack = jest.fn();
const onContinue = jest.fn();
function panel(
  mode?: "onboarding" | "reinvite",
  props: Partial<ComponentProps<typeof AdminGuideInvitationPanel>> = {}
) {
  return (
    <AdminGuideInvitationPanel
      guide={guide}
      mode={mode}
      updating={false}
      update={update}
      onBack={onBack}
      onContinue={onContinue}
      origin="dashboard"
      {...props}
    />
  );
}
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  update.mockResolvedValue(true);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  guide = {
    tenant: { id: "group", slug: "pelada", publicUrl: "https://app.fut7pro.com.br/pelada" },
    administrator: { membershipId: "admin", status: "APROVADO" },
    eligibility: { preparationComplete: true, footballUnlocked: false },
    capabilities: { managePlayers: true },
    pedagogicalState: {
      revision: 0,
      viewedResources: [],
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
    },
    tasks: [
      { id: "ACCOUNT_READY", completed: true, canAct: true },
      { id: "ACTIVE_PLAYERS", completed: false, canAct: true },
    ],
    actionAvailability: { ACTIVE_PLAYERS: { allowed: true, reason: null } },
  } as unknown as AdminGuideData;
});
it("shows two channels, no manual registration and loads each example only on request", () => {
  render(panel());
  expect(screen.getByRole("heading", { name: "Convide a galera pelo WhatsApp" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Coloque o site no Instagram" })).toBeVisible();
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.queryByRole("link", { name: "Cadastrar jogador manualmente" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Instagram" }));
  fireEvent.click(screen.getByRole("button", { name: "Ver exemplo no Instagram" }));
  expect(screen.getAllByRole("img")).toHaveLength(1);
  expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("instagram.webp"));
  fireEvent.click(screen.getByRole("button", { name: "Voltar às opções de convite" }));
  expect(screen.getByRole("button", { name: "Instagram" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Ver exemplo no Instagram" })).toHaveFocus();
  expect(update).not.toHaveBeenCalled();
});
it("requires an explicit declaration and waits for the backend completion instead of PATCH success", async () => {
  const view = render(panel());
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({ action: "INVITATION_COPY_RECORDED", channel: "WHATSAPP" })
  );
  expect(screen.queryByText("Etapa concluída!")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Já compartilhei o convite" }));
  await waitFor(() =>
    expect(update).toHaveBeenCalledWith({
      action: "INVITATION_SHARED_CONFIRMED",
      channel: "WHATSAPP",
    })
  );
  expect(screen.queryByRole("button", { name: "Continuar para a próxima etapa" })).toBeNull();
  guide = { ...guide, tasks: guide.tasks.map((t) => ({ ...t, completed: true })) };
  view.rerender(panel());
  await screen.findByRole("heading", { name: "Etapa concluída!" });
  expect(screen.getByRole("link", { name: "Cadastrar jogador manualmente" })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=dashboard"
  );
  fireEvent.click(screen.getByRole("button", { name: "Continuar para a próxima etapa" }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});
it("does not record a failed clipboard write", async () => {
  (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error("denied"));
  render(panel());
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  await screen.findByText(/A cópia falhou/);
  expect(update).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Já compartilhei o convite" })).toBeNull();
});
it("opening an app, returning focus and elapsed time never confirm sharing", async () => {
  jest.useFakeTimers();
  try {
    render(panel());
    const link = screen.getByRole("link", { name: "Compartilhar no WhatsApp" });
    expect(link).toHaveAttribute("target", "_blank");
    fireEvent.click(link);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
      jest.advanceTimersByTime(11000);
    });
    expect(update).toHaveBeenCalledWith({
      action: "RESOURCE_VIEWED",
      resourceId: "whatsapp-share-attempt",
    });
    expect(update).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: "INVITATION_SHARED_CONFIRMED" })
    );
    expect(screen.queryByText("Etapa concluída!")).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});
it("serializes declaration clicks, shows network errors and permits an idempotent retry", async () => {
  let finish!: (value: boolean) => void;
  update.mockImplementation(({ action }) =>
    action === "INVITATION_SHARED_CONFIRMED"
      ? new Promise<boolean>((resolve) => (finish = resolve))
      : Promise.resolve(true)
  );
  render(panel());
  fireEvent.click(screen.getByRole("link", { name: "Abrir Instagram" }));
  const confirm = screen.getByRole("button", { name: "Já compartilhei o convite" });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(
    update.mock.calls.filter(([a]) => a.action === "INVITATION_SHARED_CONFIRMED")
  ).toHaveLength(1);
  await act(async () => finish(false));
  await screen.findByText(/Não foi possível confirmar/);
  update.mockResolvedValue(true);
  fireEvent.click(screen.getByRole("button", { name: "Já compartilhei o convite" }));
  await screen.findByRole("button", { name: "Atualizar progresso" });
  expect(screen.queryByText("Etapa concluída!")).toBeNull();
});
it("resumes an unconfirmed intent after remount and isolates it by administrator and group", () => {
  const view = render(panel());
  fireEvent.click(screen.getByRole("link", { name: "Abrir Instagram" }));
  view.unmount();
  const second = render(panel());
  expect(screen.getByRole("heading", { name: "Conseguiu compartilhar o convite?" })).toBeVisible();
  guide = { ...guide, administrator: { ...guide.administrator, membershipId: "other-admin" } };
  second.rerender(panel());
  expect(screen.getByRole("heading", { name: "Traga seus primeiros jogadores" })).toBeVisible();
  expect(screen.queryByText("Etapa concluída!")).toBeNull();
});
it("reinvites after completion without reopening the milestone or writing onboarding progress", async () => {
  guide.tasks.forEach((task) => (task.completed = true));
  guide.actionAvailability = { ACTIVE_PLAYERS: { allowed: false, reason: "PREVIOUS_STEPS" } };
  sessionStorage.setItem("guide-invitation:v2:group:admin", "INSTAGRAM");
  render(panel("reinvite"));
  expect(screen.getByRole("heading", { name: "Convidar mais jogadores" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Etapa concluída!" })).toBeNull();
  expect(screen.queryByRole("heading", { name: "Conseguiu compartilhar o convite?" })).toBeNull();
  expect(screen.getByRole("link", { name: "Compartilhar no WhatsApp" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Copiar convite" }));
  await screen.findByText(/Convite copiado! Envie a mensagem aos jogadores/);
  expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("link", { name: "Compartilhar no WhatsApp" }));
  expect(screen.getByText(/Abra o aplicativo e compartilhe o convite/)).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Etapa concluída!" })).toBeNull();
  expect(guide.tasks.find((task) => task.id === "ACTIVE_PLAYERS")?.completed).toBe(true);
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Voltar à Fase 2" }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

it("respects historical completion, registration permissions and already used channels", () => {
  guide.tasks.forEach((t) => (t.completed = true));
  guide.capabilities.managePlayers = false;
  guide.pedagogicalState.invitationConfirmations = {
    WHATSAPP: "2026-11-18T00:00:00Z",
    INSTAGRAM: "2026-11-18T00:00:00Z",
  };
  render(panel());
  expect(screen.getByRole("heading", { name: "Etapa concluída!" })).toBeVisible();
  expect(screen.queryByRole("link", { name: "Cadastrar jogador manualmente" })).toBeNull();
  expect(screen.queryByText("Quer divulgar o site em mais um lugar?")).toBeNull();
  expect(screen.getByRole("button", { name: "Continuar para a próxima etapa" })).toBeEnabled();
  expect(update).not.toHaveBeenCalled();
});
it("remembers the declared Instagram channel even if recording the preceding copy failed", () => {
  guide.tasks.forEach((task) => (task.completed = true));
  guide.pedagogicalState.invitationConfirmations = { INSTAGRAM: "2026-11-18T00:00:00Z" };
  render(panel());
  expect(screen.getByRole("button", { name: "Compartilhar também no WhatsApp" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Divulgar também no Instagram" })).toBeNull();
});

it("offers contextual manual registration independently of the initial invitation step", () => {
  guide.tasks.forEach((task) => {
    task.completed = true;
    task.canAct = false;
  });
  guide.actionAvailability = { ACTIVE_PLAYERS: { allowed: false, reason: "PREVIOUS_STEPS" } };
  const onNavigate = jest.fn();
  render(panel("reinvite", { onNavigate, returnTo: "/admin/dashboard" }));
  const section = screen.getByRole("region", { name: "Cadastro manual de jogadores" });
  expect(section).toHaveTextContent("Prefere cadastrar os jogadores manualmente?");
  expect(section).toHaveTextContent(
    "Você não precisa esperar os atletas criarem suas contas. Pode cadastrá-los manualmente e vinculá-los às contas deles posteriormente."
  );
  const link = screen.getByRole("link", { name: "Cadastrar jogador" });
  expect(link).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=dashboard"
  );
  const share = screen.getByRole("region", { name: "Instagram" });
  const back = screen.getByRole("button", { name: "Voltar à Fase 2" });
  expect(share.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(section.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(link);
  expect(onNavigate).toHaveBeenCalledTimes(1);
  expect(update).not.toHaveBeenCalled();
  expect(guide.tasks.every((task) => task.completed)).toBe(true);
});
it.each(["permission", "pending", "updating", "unlocked", "onboarding"])(
  "hides the additional manual registration shortcut for %s",
  (condition) => {
    if (condition === "permission") guide.capabilities.managePlayers = false;
    if (condition === "pending") guide.administrator.status = "PENDENTE";
    if (condition === "unlocked") guide.eligibility!.footballUnlocked = true;
    render(
      panel(condition === "onboarding" ? "onboarding" : "reinvite", {
        updating: condition === "updating",
      })
    );
    expect(screen.queryByRole("region", { name: "Cadastro manual de jogadores" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Cadastrar jogador" })).toBeNull();
    expect(update).not.toHaveBeenCalled();
  }
);
it("keeps full-page and contextual return destinations for manual registration", () => {
  const view = render(panel("reinvite", { origin: "pagina" }));
  expect(screen.getByRole("link", { name: "Cadastrar jogador" })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=pagina"
  );
  view.rerender(panel("reinvite", { returnTo: "/admin/partidas/criar-times" }));
  expect(screen.getByRole("link", { name: "Cadastrar jogador" })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=dashboard&guiaRetorno=%2Fadmin%2Fpartidas%2Fcriar-times"
  );
});
