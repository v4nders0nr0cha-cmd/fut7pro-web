"use client";

import type { MouseEvent } from "react";

interface Props {
  publicado: boolean;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string | null;
}

export default function BotaoPublicarTimes({ publicado, onClick, loading = false, disabled = false, errorMessage }: Props) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (publicado || loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick();
  }

  const buttonStateClass = publicado
    ? "bg-green-500 text-white cursor-default"
    : loading
      ? "bg-yellow-200 text-gray-500 cursor-wait"
      : disabled
        ? "bg-zinc-600 text-gray-400 cursor-not-allowed"
        : "bg-yellow-400 text-black hover:bg-yellow-500";

  return (
    <div className="w-full">
      <button
        className={`w-full py-3 mt-4 rounded font-bold text-lg transition-all ${buttonStateClass}`}
        onClick={handleClick}
        disabled={publicado || loading || disabled}
        type="button"
      >
        {loading ? "Publicando..." : publicado ? "Times publicados!" : "Publicar Times do Dia"}
      </button>
      {errorMessage && !loading && !publicado && (
        <p className="mt-2 text-sm text-red-400 text-center">{errorMessage}</p>
      )}
    </div>
  );
}
