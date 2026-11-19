import { notifyAdminGuideChanged, subscribeGuideChanges } from "../admin-guide-events";
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
it("coalesces a burst, serializes reads, and checks again for a save during a read", async () => {
  let resolve!: () => void;
  const retry = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        })
    )
    .mockResolvedValue(undefined);
  const cleanup = subscribeGuideChanges(retry);
  notifyAdminGuideChanged();
  notifyAdminGuideChanged();
  await flush();
  expect(retry).toHaveBeenCalledTimes(1);
  notifyAdminGuideChanged();
  notifyAdminGuideChanged();
  await flush();
  expect(retry).toHaveBeenCalledTimes(1);
  resolve();
  await flush();
  await flush();
  expect(retry).toHaveBeenCalledTimes(2);
  cleanup();
  notifyAdminGuideChanged();
  await flush();
  expect(retry).toHaveBeenCalledTimes(2);
});
it("does not follow up an abandoned scope and recovers after a failed read", async () => {
  const retry = jest.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
  const cleanup = subscribeGuideChanges(retry);
  notifyAdminGuideChanged();
  await flush();
  await flush();
  notifyAdminGuideChanged();
  await flush();
  await flush();
  expect(retry).toHaveBeenCalledTimes(2);
  cleanup();
  notifyAdminGuideChanged();
  await flush();
  expect(retry).toHaveBeenCalledTimes(2);
});

it("drops a queued follow-up when the administrator or group leaves during a read", async () => {
  let resolve!: () => void;
  const retry = jest.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      })
  );
  const cleanup = subscribeGuideChanges(retry);
  notifyAdminGuideChanged();
  await flush();
  notifyAdminGuideChanged();
  cleanup();
  resolve();
  await flush();
  await flush();
  expect(retry).toHaveBeenCalledTimes(1);
});
