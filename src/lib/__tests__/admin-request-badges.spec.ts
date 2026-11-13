import { mutate } from "swr";
import {
  ENTRY_REQUEST_COUNT_URL,
  MONTHLY_REQUEST_COUNT_URL,
  revalidateAdminRequestBadges,
} from "../admin-request-badges";

jest.mock("swr", () => ({ mutate: jest.fn() }));

it("revalida as duas contagens após resolver uma solicitação", async () => {
  await revalidateAdminRequestBadges();

  expect(mutate).toHaveBeenCalledWith(expect.any(Function), undefined, { revalidate: true });
  const matches = (mutate as jest.Mock).mock.calls[0][0] as (key: unknown) => boolean;
  expect(matches([ENTRY_REQUEST_COUNT_URL, "grupo-a"])).toBe(true);
  expect(matches([MONTHLY_REQUEST_COUNT_URL, "grupo-a"])).toBe(true);
  expect(matches(["/api/admin/analytics", "grupo-a"])).toBe(false);
});
