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
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only peer"
        aria-label={ariaLabel}
        {...props}
      />
      <div
        className={`w-11 h-6 bg-zinc-700 peer-checked:bg-amarelo rounded-full transition-colors duration-200 relative`}
      >
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all duration-200 ${
            checked ? "translate-x-5 bg-amarelo" : ""
          }`}
        />
      </div>
    </label>
  );
}
