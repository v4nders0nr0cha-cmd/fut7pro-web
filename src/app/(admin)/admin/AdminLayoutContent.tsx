"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuAdmin from "@/components/layout/BottomMenuAdmin";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastGlobal from "@/components/ui/ToastGlobal";

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#181818] to-[#232323]">
        <ToastGlobal />
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Backdrop para mobile */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Fechar menu"
          />
        )}

        <div className="flex flex-1 relative">
          <Sidebar />
          <Sidebar mobile isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <main className="flex-1 w-full px-4 sm:px-6 pt-20 md:pt-15 pb-24">{children}</main>
        </div>
        <BottomMenuAdmin />
      </div>
    </NotificationProvider>
  );
}
