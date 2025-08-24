"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  restricted?: boolean;
  isAdmin?: boolean;
};

export default function Card({
  title,
  description,
  icon,
  restricted = false,
  isAdmin = false,
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const isRestricted = restricted && !isAdmin;

  return (
    <div
      className={`relative overflow-visible rounded-2xl border border-[#3A3A3A] bg-[#1B1B1B] p-6 shadow-lg transition-all hover:bg-[#2D2D2D] ${isRestricted && hovered ? "cursor-not-allowed" : "cursor-pointer"} `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-disabled={isRestricted}
    >
      {/* Título com ícone alinhado */}
      <div className="mb-2 flex items-center justify-center gap-2">
        {icon}
        <h3 className="text-xl font-semibold text-[#FFCC00]">{title}</h3>
      </div>
      <p className="text-center text-gray-300">{description}</p>

      {/* Overlay de restrição */}
      {isRestricted && hovered && (
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 shadow-lg">
          <span
            className="text-lg text-red-600"
            role="img"
            aria-label="Proibido"
          >
            🚫
          </span>
          <span className="text-base text-gray-900">
            Apenas administradores podem acessar esta área
          </span>
        </div>
      )}
    </div>
  );
}
