// src/app/comunicacao/enquetes/EnqueteClient.tsx
"use client";
import { useState } from "react";

export default function EnqueteClient() {
  const [votou, setVotou] = useState(false);
  return !votou ? (
    <div className="mb-4 rounded-lg border-l-4 border-yellow-400 bg-zinc-800 p-4 text-zinc-100">
      <strong>🗳️ Qual horário prefere para o próximo racha?</strong>
      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={() => setVotou(true)}
          className="rounded bg-yellow-400 px-3 py-1 font-semibold text-zinc-900 transition hover:bg-yellow-500"
        >
          14h
        </button>
        <button
          onClick={() => setVotou(true)}
          className="rounded bg-yellow-400 px-3 py-1 font-semibold text-zinc-900 transition hover:bg-yellow-500"
        >
          16h
        </button>
        <button
          onClick={() => setVotou(true)}
          className="rounded bg-yellow-400 px-3 py-1 font-semibold text-zinc-900 transition hover:bg-yellow-500"
        >
          Outro
        </button>
      </div>
    </div>
  ) : (
    <div className="rounded-lg bg-green-700 p-4 text-center font-semibold text-white">
      ✅ Seu voto foi registrado! Obrigado pela participação.
    </div>
  );
}
