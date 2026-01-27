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
      className="bg-zinc-800 rounded-lg p-4 flex flex-col gap-3 border-l-4 border-brand"
    >
      <label htmlFor="sugestao" className="text-zinc-200 font-semibold">
        Envie sua sugestão para os administradores:
      </label>
      <textarea
        id="sugestao"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="rounded p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 resize-none min-h-[80px]"
        maxLength={400}
        required
        placeholder="Digite aqui sua sugestão..."
      />
      <button
        type="submit"
        className="bg-brand text-zinc-900 rounded px-4 py-1 font-semibold hover:bg-brand-strong transition mt-2"
      >
        Enviar
      </button>
    </form>
  ) : (
    <div className="bg-green-700 rounded-lg p-4 text-white font-semibold text-center">
      ✅ Obrigado pela sugestão! Ela foi enviada para os administradores.
    </div>
  );
}
