"use client";
import { useState } from "react";
export default function useCursor(key: string) {
  const [stored, set] = useState<{ key: string; pages: Array<string | null> }>({
    key,
    pages: [null],
  });
  const pages = stored.key === key ? stored.pages : [null];
  return {
    cursor: pages[pages.length - 1],
    number: pages.length,
    next: (cursor: string | null) => {
      if (cursor) set({ key, pages: [...pages, cursor] });
    },
    previous: () => set({ key, pages: pages.length > 1 ? pages.slice(0, -1) : [null] }),
  };
}
