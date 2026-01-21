"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuSuperAdmin from "@/components/layout/BottomMenuSuperAdmin";

export default function SuperAdminLayoutContent({ children }: { children: ReactNode }) {
  // Se quiser Sidebar mobile futuramente, só adicionar estado e lógica aqui
  // const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#181818] to-[#232323] text-white">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        {/* Sidebar mobile opcional (adicione depois se quiser) */}
        {/* <Sidebar
                    mobile
                    isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                /> */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pt-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomMenuSuperAdmin />
    </div>
  );
}
