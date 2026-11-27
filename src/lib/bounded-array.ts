import { z } from "zod";

// Zod 3 checks .max() after validating every item. Preserve the existing limit,
// but reject oversized collections before accumulating per-item errors.
export function boundedArray<T extends z.ZodTypeAny>(item: T, maximum: number, message: string) {
  return z.preprocess(
    (value, context) => {
      if (Array.isArray(value) && value.length > maximum) {
        context.addIssue({
          code: z.ZodIssueCode.too_big,
          fatal: true,
          type: "array",
          maximum,
          inclusive: true,
          exact: false,
          message,
        });
        return z.NEVER;
      }
      return value;
    },
    z.array(item).max(maximum, message)
  );
}
