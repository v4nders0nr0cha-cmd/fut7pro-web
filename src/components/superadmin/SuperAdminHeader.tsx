// src/components/superadmin/SuperAdminHeader.tsx

import { rachaConfig } from "@/config/racha.config";

export default function SuperAdminHeader() {
  return (
    <header className="mb-4 flex w-full flex-col items-center rounded-t-xl bg-[#181f2a] px-6 py-4 shadow md:flex-row md:justify-between">
      <div className="text-center text-xl font-bold text-yellow-400 drop-shadow-sm md:text-left md:text-2xl">
        Painel {rachaConfig.nome} – SuperAdmin
      </div>
      <div className="mt-2 text-center text-sm text-white/80 md:mt-0 md:text-right">
        Olá, Dono do Sistema
      </div>
    </header>
  );
}
