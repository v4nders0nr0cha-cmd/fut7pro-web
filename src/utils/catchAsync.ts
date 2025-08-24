// src/utils/catchAsync.ts
import type { NextApiRequest, NextApiResponse } from "next";

type AsyncFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (error?: unknown) => void,
) => Promise<unknown>;

export default function catchAsync(fn: AsyncFunction) {
  return function (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (error?: unknown) => void,
  ) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
