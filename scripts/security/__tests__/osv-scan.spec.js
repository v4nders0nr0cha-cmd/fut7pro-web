const { collectPackages, scan } = require("../osv-scan");

describe("additional free OSV analysis", () => {
  beforeAll(() => {
    if (typeof AbortSignal.timeout !== "function")
      Object.defineProperty(AbortSignal, "timeout", {
        configurable: true,
        value: () => new AbortController().signal,
      });
  });
  it("deduplicates package versions while retaining transitive dependencies", () => {
    const tree = [
      {
        dependencies: {
          a: { version: "1.0.0", dependencies: { b: { version: "2.0.0" } } },
          b: { version: "2.0.0" },
        },
        devDependencies: { c: { version: "3.0.0" } },
      },
    ];
    expect(collectPackages(tree).map((q) => q.package.name)).toEqual(["a", "b"]);
  });
  it("does not report a clean result for an empty or unsupported tree", () => {
    expect(() => collectPackages([])).toThrow();
    expect(() => collectPackages([{ dependencies: {} }])).toThrow();
    expect(() => collectPackages([{ dependencies: { a: { version: "link:../a" } } }])).toThrow();
  });
  it("queries exact package versions without code, tokens or tenant data", async () => {
    const request = jest.fn(async () => ({
      ok: true,
      json: async () => ({ results: [{ vulns: [{ id: "GHSA-example" }] }] }),
    }));
    const result = await scan(
      [{ package: { name: "a", ecosystem: "npm" }, version: "1.0.0" }],
      request
    );
    expect(result.status).toBe("completed");
    expect(result.findings[0].id).toBe("GHSA-example");
    expect(JSON.parse(request.mock.calls[0][1].body).queries[0].version).toBe("1.0.0");
  });
  it("marks unavailable and incomplete external responses as errors", async () => {
    const queries = [{ package: { name: "a", ecosystem: "npm" }, version: "1.0.0" }];
    await expect(scan(queries, async () => ({ ok: false, status: 503 }))).rejects.toThrow();
    await expect(
      scan(queries, async () => ({ ok: true, json: async () => ({ results: [] }) }))
    ).rejects.toThrow();
  });
});
