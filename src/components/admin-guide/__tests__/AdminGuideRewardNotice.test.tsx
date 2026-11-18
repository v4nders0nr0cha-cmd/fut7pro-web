import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminGuideRewardNotice from "../AdminGuideRewardNotice";
let guide: any;
const update = jest.fn();
jest.mock("@/hooks/useAdminGuide", () => ({
  useAdminGuide: () => ({ guide, update, updating: false }),
}));
jest.mock("../AdminGuideDialog", () => ({
  __esModule: true,
  default: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
}));
beforeEach(() => {
  jest.clearAllMocks();
  update.mockResolvedValue(true);
  guide = {
    tenant: { id: "group" },
    administrator: { membershipId: "member" },
    activationProgress: { complete: true },
    pedagogicalState: {},
    reward: { eligible: true, granted: false, days: 10, trialEnd: "2099-01-20T18:00:00Z" },
  };
});
it("waits for backend confirmation before announcing days", async () => {
  const view = render(<AdminGuideRewardNotice />);
  await waitFor(() => expect(update).toHaveBeenCalledWith({ action: "REWARD_CLAIM" }));
  expect(screen.queryByText("+10 DIAS DE FUT7PRO")).not.toBeInTheDocument();
  guide = { ...guide, reward: { ...guide.reward, granted: true, eligible: false } };
  view.rerender(<AdminGuideRewardNotice />);
  await screen.findByText("+10 DIAS DE FUT7PRO");
  expect(update).toHaveBeenCalledWith({ action: "REWARD_PRESENTED" });
  fireEvent.click(screen.getByRole("button", { name: "Continuar aproveitando o Fut7Pro" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("does not grant an incomplete journey or an ineligible group", () => {
  guide.activationProgress.complete = false;
  const view = render(<AdminGuideRewardNotice />);
  expect(update).not.toHaveBeenCalled();
  guide.activationProgress.complete = true;
  guide.reward.eligible = false;
  view.rerender(<AdminGuideRewardNotice />);
  expect(update).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("respects permanent dismissal and already presented rewards", async () => {
  guide.reward.granted = true;
  guide.pedagogicalState.rewardPresentedAt = "2026-11-18T12:00:00Z";
  const view = render(<AdminGuideRewardNotice />);
  expect(update).not.toHaveBeenCalled();
  guide.pedagogicalState.rewardPresentedAt = undefined;
  guide.pedagogicalState.dashboardInviteDismissedAt = "2026-11-18T12:00:00Z";
  view.rerender(<AdminGuideRewardNotice />);
  expect(update).not.toHaveBeenCalled();
});
it("offers safe recovery after a failed claim without announcing a fictitious reward", async () => {
  update.mockResolvedValue(false);
  render(<AdminGuideRewardNotice />);
  await screen.findByRole("alert");
  expect(screen.queryByText("+10 DIAS DE FUT7PRO")).not.toBeInTheDocument();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" })));
  await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
});
