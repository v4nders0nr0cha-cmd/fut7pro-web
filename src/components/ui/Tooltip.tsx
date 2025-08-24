"use client";
import * as React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = React.useState(false);

  return (
    <span className="relative">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-block"
      >
        {children}
      </span>
      {show && (
        <span className="absolute left-1/2 z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-3 py-1 text-xs text-white shadow-xl">
          {content}
        </span>
      )}
    </span>
  );
}
