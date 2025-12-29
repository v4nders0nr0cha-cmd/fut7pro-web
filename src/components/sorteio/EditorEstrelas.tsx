"use client";

import { FaStar } from "react-icons/fa";

interface Props {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  max?: number;
  size?: number;
}

export default function EditorEstrelas({
  value,
  onChange,
  disabled = false,
  max = 5,
  size = 18,
}: Props) {
  return (
    <div className="flex items-center space-x-1 editor-estrelas">
      {Array.from({ length: max }).map((_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={`star-${star}`}
            type="button"
            className={`transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              active ? "text-yellow-400" : "text-gray-400"
            } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-110"}`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) onChange(star);
            }}
            aria-label={`Dar ${star} estrela${star > 1 ? "s" : ""}`}
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
          >
            <FaStar size={size} />
          </button>
        );
      })}
    </div>
  );
}
