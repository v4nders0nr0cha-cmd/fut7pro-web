// src/components/admin/RestrictAccess.tsx
import React from "react";

export default function RestrictAccess({
  msg = "Você não tem permissão para acessar esta página.",
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <div className="mb-4 text-4xl">🚫</div>
      <div className="mb-2 text-lg font-bold text-red-400">{msg}</div>
      <div className="text-sm text-zinc-400">
        Fale com o presidente do racha para solicitar acesso.
      </div>
    </div>
  );
}
