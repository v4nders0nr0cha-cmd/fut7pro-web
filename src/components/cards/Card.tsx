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
      className={`
        bg-[#1B1B1B] hover:bg-[#2D2D2D] rounded-2xl shadow-lg p-6 transition-all border border-[#3A3A3A] relative overflow-visible
        ${isRestricted && hovered ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-disabled={isRestricted}
    >
      {/* Título com ícone alinhado */}
      <div className="flex items-center justify-center mb-2 gap-2">
        {icon}
        <h3 className="text-xl font-semibold text-brand">{title}</h3>
      </div>
      <p className="text-gray-300 text-center">{description}</p>

      {/* Overlay de restrição */}
      {isRestricted && hovered && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2
            bg-white px-4 py-2 rounded-lg shadow-lg border border-red-300"
        >
          <span className="text-red-600 text-lg" role="img" aria-label="Proibido">
            🚫
          </span>
          <span className="text-gray-900 text-base">
            Apenas administradores podem acessar esta área
          </span>
        </div>
      )}
    </div>
  );
}
