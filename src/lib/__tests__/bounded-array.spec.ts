import { z } from "zod";
import { boundedArray } from "../bounded-array";
import { nossaHistoriaSchema } from "@/utils/schemas/nossaHistoria.schema";

describe("bounded array validation", () => {
  it("rejects an oversized collection before touching any element", () => {
    const input = new Array(100000);
    const read = jest.fn(() => {
      throw new Error("Element must not be read");
    });
    Object.defineProperty(input, 0, { get: read });
    const result = nossaHistoriaSchema.safeParse({ categoriasFotos: input });
    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected gallery size rejection");
    expect(result.error.issues).toHaveLength(1);
    expect(result.error.issues[0]).toMatchObject({
      code: "too_big",
      path: ["categoriasFotos"],
      maximum: 6,
    });
    expect(read).not.toHaveBeenCalled();
  });

  it("preserves the six-photo limit, valid content and optional field", () => {
    const photo = { src: "/foto.png", titulo: "Foto", descricao: "Descricao" };
    expect(nossaHistoriaSchema.safeParse({ categoriasFotos: Array(6).fill(photo) }).success).toBe(
      true
    );
    expect(nossaHistoriaSchema.safeParse({ categoriasFotos: Array(7).fill(photo) }).success).toBe(
      false
    );
    expect(nossaHistoriaSchema.safeParse({}).success).toBe(true);
    expect(nossaHistoriaSchema.safeParse({ categoriasFotos: [{ src: 1 }] }).success).toBe(false);
  });

  it("still validates items and rejects non-arrays without changing valid values", () => {
    const schema = boundedArray(z.string(), 2, "Too many items");
    expect(schema.parse(["a", "b"])).toEqual(["a", "b"]);
    expect(schema.safeParse([1]).success).toBe(false);
    expect(schema.safeParse("ab").success).toBe(false);
  });
});
