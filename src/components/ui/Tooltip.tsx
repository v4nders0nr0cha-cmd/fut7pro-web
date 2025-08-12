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
        <span className="absolute z-30 left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-zinc-900 text-xs text-white rounded shadow-xl whitespace-nowrap">
          {content}
        </span>
      )}
    </span>
  );
}
