import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import AdminGuideAccessHint from "../AdminGuideAccessHint";
import AdminGuideMobileAccess from "../AdminGuideMobileAccess";
import { GUIDE_CLOSED, GUIDE_ACCESS_USED, notifyGuideAccess } from "@/lib/admin-guide-access";
let guide: any;
let pathname = "/admin/dashboard";
let mobile = false;
jest.mock("@/hooks/useAdminGuide", () => ({ useAdminGuide: () => ({ guide }) }));
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
const identity = () => ({
  tenantId: guide.tenant.id,
  membershipId: guide.administrator.membershipId,
});
function Surface({ overlay = false, menu = false }: { overlay?: boolean; menu?: boolean }) {
  return (
    <>
      <button id="admin-help-launcher" aria-expanded={menu} aria-controls="help">
        Ajuda
      </button>
      <AdminGuideMobileAccess />
      <AdminGuideAccessHint />
      {overlay && <div role="dialog">Outro modal</div>}
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  pathname = "/admin/dashboard";
  mobile = false;
  guide = {
    tenant: { id: "t1", slug: "grupo" },
    administrator: { membershipId: "m1" },
    activationProgress: { complete: false },
    pedagogicalState: {},
  };
  (window.matchMedia as jest.Mock).mockImplementation(() => ({ matches: mobile }));
  jest.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as any);
  jest
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ left: 300, top: 100, bottom: 144, width: 44, height: 44 } as DOMRect);
});
afterEach(() => jest.restoreAllMocks());
it("exposes a 44px manual mobile link despite permanent dismissal and hides only after real completion", () => {
  guide.pedagogicalState.dashboardInviteDismissedAt = "2026-11-18";
  const view = render(<AdminGuideMobileAccess />);
  expect(screen.getByRole("link", { name: "Abrir Guia Interativo" })).toHaveAttribute(
    "href",
    "/admin/dashboard?retomarGuia=1&grupoGuia=grupo"
  );
  expect(screen.getByRole("link")).toHaveClass("h-11", "w-11", "lg:hidden");
  guide = { ...guide, activationProgress: { complete: true } };
  view.rerender(<AdminGuideMobileAccess />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  guide = null;
  view.rerender(<AdminGuideMobileAccess />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
it.each([false, true])(
  "teaches access once in this browser (mobile=%s), including after a new login",
  async (isMobile) => {
    mobile = isMobile;
    const view = render(<Surface />);
    act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
    await screen.findByRole("status");
    expect(
      screen.getByText(isMobile ? "Continue quando quiser" : "Seu guia está sempre por aqui!")
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    view.unmount();
    render(<Surface />);
    act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  }
);
it("dismisses the hint when the indicated access is used, without changing automatic preference", async () => {
  mobile = true;
  render(<Surface />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  await screen.findByRole("status");
  fireEvent.click(screen.getByRole("link", { name: "Abrir Guia Interativo" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(guide.pedagogicalState).toEqual({});
});
it("waits until other dialogs and menus close before recording its actual presentation", async () => {
  const view = render(<Surface overlay />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(localStorage.getItem("guide-access-hint:v1:t1:m1")).toBeNull();
  view.rerender(<Surface menu />);
  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  view.rerender(<Surface />);
  await screen.findByRole("status");
  expect(localStorage.getItem("guide-access-hint:v1:t1:m1")).toBe("1");
  view.rerender(<Surface overlay />);
  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
});
it("isolates administrator/group and rejects events from a previous group", async () => {
  const view = render(<Surface />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  await screen.findByRole("status");
  fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
  const previous = identity();
  guide = { ...guide, tenant: { id: "t2", slug: "outro" } };
  view.rerender(<Surface />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, previous));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  await screen.findByRole("status");
});
it("never offers a hint for a permanently dismissed or completed guide", () => {
  guide.pedagogicalState.dashboardInviteDismissedAt = "2026-11-18";
  const view = render(<Surface />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  guide = { ...guide, activationProgress: { complete: true }, pedagogicalState: {} };
  view.rerender(<Surface />);
  act(() => notifyGuideAccess(GUIDE_CLOSED, identity()));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("distinguishes the X callback from Escape without changing existing dialog closing", () => {
  const close = jest.fn();
  const explicit = jest.fn();
  render(
    <Fut7DialogBase open title="Exemplo" onClose={close} onCloseButton={explicit}>
      Conteúdo
    </Fut7DialogBase>
  );
  fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
  expect(explicit).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
  expect(explicit).toHaveBeenCalledTimes(1);
});
