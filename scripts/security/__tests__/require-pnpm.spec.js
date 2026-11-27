const { isSupportedAgent } = require("../require-pnpm");
describe("canonical dependency installation", () => {
  it("accepts the declared resolver and compatible pnpm 10 hosts", () => {
    expect(isSupportedAgent("pnpm/10.19.0 npm/? node/v20.19.0 linux x64")).toBe(true);
    expect(isSupportedAgent("pnpm/10.20.0 node/v20 linux x64")).toBe(true);
  });
  it("rejects another manager or resolver major", () => {
    for (const agent of [
      undefined,
      "npm/10.8.2 node/v20",
      "yarn/1.22",
      "pnpm/11.0.0",
      "pnpm/10.19.01",
    ])
      expect(isSupportedAgent(agent)).toBe(false);
  });
});
