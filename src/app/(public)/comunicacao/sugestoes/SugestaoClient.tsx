// src/app/comunicacao/sugestoes/SugestaoClient.tsx
"use client";
import { useState } from "react";

export default function SugestaoClient() {
  const [enviado, setEnviado] = useState(false);
  const [valor, setValor] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor.trim()) return;
    setEnviado(true);
    setValor("");
  }

  return !enviado ? (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border-l-4 border-yellow-400 bg-zinc-800 p-4"
    >
      <label htmlFor="sugestao" className="font-semibold text-zinc-200">
        Envie sua sugestão para os administradores:
      </label>
      <textarea
        id="sugestao"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="min-h-[80px] resize-none rounded border border-zinc-700 bg-zinc-900 p-2 text-zinc-100"
        maxLength={400}
        required
        placeholder="Digite aqui sua sugestão..."
      />
      <button
        type="submit"
        className="mt-2 rounded bg-yellow-400 px-4 py-1 font-semibold text-zinc-900 transition hover:bg-yellow-500"
      >
        Enviar
      </button>
    </form>
  ) : (
    <div className="rounded-lg bg-green-700 p-4 text-center font-semibold text-white">
      ✅ Obrigado pela sugestão! Ela foi enviada para os administradores.
    </div>
  );
}
