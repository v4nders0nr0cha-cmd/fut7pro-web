"use client";

import type { MouseEvent } from "react";

interface Props {
  publicado: boolean;
  onClick: () => void;
  loading?: boolean; // opcional: loading para requisição futura
}

export default function BotaoPublicarTimes({
  publicado,
  onClick,
  loading = false,
}: Props) {
  // Handler seguro: só dispara onClick se permitido
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (publicado || loading) {
      e.preventDefault();
      return;
    }
    onClick();
  }

  return (
    <button
      className={`mt-4 w-full rounded py-3 text-lg font-bold transition-all ${
        publicado
          ? "cursor-default bg-green-500 text-white"
          : loading
            ? "cursor-wait bg-yellow-200 text-gray-500"
            : "bg-yellow-400 text-black hover:bg-yellow-500"
      }`}
      onClick={handleClick}
      disabled={publicado || loading}
      type="button"
    >
      {loading
        ? "Publicando..."
        : publicado
          ? "Times Publicados!"
          : "Publicar Times do Dia"}
    </button>
  );
}
