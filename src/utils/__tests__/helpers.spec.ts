import catchAsync from "@/utils/catchAsync";
import { cn } from "@/utils/cn";

describe("cn util", () => {
  it("une classes removendo duplicadas", () => {
    expect(cn("text-sm", "font-bold", "text-sm")).toBe("font-bold text-sm");
  });
});

describe("catchAsync util", () => {
  it("encapsula erros e envia para next", async () => {
    const next = jest.fn();
    const handler = catchAsync(async () => {
      throw new Error("boom");
    });

    handler({} as any, {} as any, next);
    await Promise.resolve();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("nao chama next quando resolve", async () => {
    const next = jest.fn();
    const handler = catchAsync(async () => "ok");

    handler({} as any, {} as any, next);
    await Promise.resolve();
    expect(next).not.toHaveBeenCalled();
  });
});
