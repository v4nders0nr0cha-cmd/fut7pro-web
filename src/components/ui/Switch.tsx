"use client";
import * as React from "react";

interface SwitchProps extends React.HTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  className = "",
  ariaLabel,
  ...props
}: SwitchProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
        aria-label={ariaLabel}
        {...props}
      />
      <div
        className={`peer-checked:bg-amarelo relative h-6 w-11 rounded-full bg-zinc-700 transition-colors duration-200`}
      >
        <div
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? "bg-amarelo translate-x-5" : ""
          }`}
        />
      </div>
    </label>
  );
}
