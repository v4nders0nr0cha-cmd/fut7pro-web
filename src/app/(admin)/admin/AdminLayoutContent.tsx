"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuAdmin from "@/components/layout/BottomMenuAdmin";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastGlobal from "@/components/ui/ToastGlobal";

export default function AdminLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#181818] to-[#232323]">
        <ToastGlobal />
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar />
          <Sidebar
            mobile
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
          <main className="md:pt-15 w-full flex-1 px-4 pb-24 pt-20 sm:px-6">
            {children}
          </main>
        </div>
        <BottomMenuAdmin />
      </div>
    </NotificationProvider>
  );
}
