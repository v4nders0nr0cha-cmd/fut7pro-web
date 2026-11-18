import { act, renderHook, waitFor } from "@testing-library/react";
import { useSubscription } from "../useSubscription";
import BillingAPI from "@/lib/api/billing";
import { notifyBillingChanged } from "@/lib/billing-events";
jest.mock("@/lib/api/billing", () => ({
  __esModule: true,
  BillingApiError: class extends Error {},
  default: {
    getPlans: jest.fn(),
    getSubscriptionByTenant: jest.fn(),
    getSubscriptionStatus: jest.fn(),
  },
}));

it("refreshes the displayed subscription after a confirmed reward for the current group only", async () => {
  const read = BillingAPI.getSubscriptionByTenant as jest.Mock;
  (BillingAPI.getPlans as jest.Mock).mockResolvedValue({ plans: [], meta: null });
  (BillingAPI.getSubscriptionStatus as jest.Mock).mockResolvedValue({ active: false });
  read
    .mockResolvedValueOnce({ id: "sub", tenantId: "group", trialEnd: "2099-01-20T00:00:00Z" })
    .mockResolvedValue({ id: "sub", tenantId: "group", trialEnd: "2099-01-30T00:00:00Z" });
  const { result } = renderHook(() => useSubscription("group"));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.subscription?.trialEnd).toBe("2099-01-20T00:00:00Z");
  act(() => notifyBillingChanged({ tenantId: "another-group", slug: "other" }));
  expect(read).toHaveBeenCalledTimes(1);
  act(() => notifyBillingChanged({ tenantId: "group", slug: "our-group" }));
  await waitFor(() => expect(result.current.subscription?.trialEnd).toBe("2099-01-30T00:00:00Z"));
  expect(read).toHaveBeenCalledTimes(2);
});
