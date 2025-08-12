// src/components/admin/RestrictAccess.tsx
import React from "react";

export default function RestrictAccess({
  msg = "Você não tem permissão para acessar esta página.",
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-4xl mb-4">🚫</div>
      <div className="text-lg font-bold text-red-400 mb-2">{msg}</div>
      <div className="text-sm text-zinc-400">
        Fale com o presidente do racha para solicitar acesso.
      </div>
    </div>
  );
}
