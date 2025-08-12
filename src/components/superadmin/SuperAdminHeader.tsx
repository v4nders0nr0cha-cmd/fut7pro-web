// src/components/superadmin/SuperAdminHeader.tsx

import { rachaConfig } from "@/config/racha.config";

export default function SuperAdminHeader() {
  return (
    <header className="w-full bg-[#181f2a] shadow px-6 py-4 flex flex-col md:flex-row items-center md:justify-between rounded-t-xl mb-4">
      <div className="font-bold text-xl md:text-2xl text-yellow-400 drop-shadow-sm text-center md:text-left">
        Painel {rachaConfig.nome} – SuperAdmin
      </div>
      <div className="text-sm text-white/80 mt-2 md:mt-0 text-center md:text-right">
        Olá, Dono do Sistema
      </div>
    </header>
  );
}
