// src/app/comunicacao/enquetes/EnqueteClient.tsx
"use client";
import { useState } from "react";

export default function EnqueteClient() {
  const [votou, setVotou] = useState(false);
  return !votou ? (
    <div className="bg-zinc-800 rounded-lg p-4 text-zinc-100 mb-4 border-l-4 border-yellow-400">
      <strong>🗳️ Qual horário prefere para o próximo racha?</strong>
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => setVotou(true)}
          className="bg-yellow-400 text-zinc-900 rounded px-3 py-1 font-semibold hover:bg-yellow-500 transition"
        >
          14h
        </button>
        <button
          onClick={() => setVotou(true)}
          className="bg-yellow-400 text-zinc-900 rounded px-3 py-1 font-semibold hover:bg-yellow-500 transition"
        >
          16h
        </button>
        <button
          onClick={() => setVotou(true)}
          className="bg-yellow-400 text-zinc-900 rounded px-3 py-1 font-semibold hover:bg-yellow-500 transition"
        >
          Outro
        </button>
      </div>
    </div>
  ) : (
    <div className="bg-green-700 rounded-lg p-4 text-white font-semibold text-center">
      ✅ Seu voto foi registrado! Obrigado pela participação.
    </div>
  );
}
