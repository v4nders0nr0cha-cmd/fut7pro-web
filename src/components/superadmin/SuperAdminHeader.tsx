import { useBranding } from "@/hooks/useBranding";

export default function SuperAdminHeader() {
  const { nome } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";

  return (
    <header className="w-full bg-[#181f2a] shadow px-6 py-4 flex flex-col md:flex-row items-center md:justify-between rounded-t-xl mb-4">
      <div className="font-bold text-xl md:text-2xl text-yellow-400 drop-shadow-sm text-center md:text-left">
        Painel {brandName} - SuperAdmin
      </div>
      <div className="text-sm text-white/80 mt-2 md:mt-0 text-center md:text-right">
        Olá, Dono do Sistema
      </div>
    </header>
  );
}
