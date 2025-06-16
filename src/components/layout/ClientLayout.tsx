"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const exibirSidebar = pathname === "/"; // apenas na home

  return (
    <div className="flex flex-col min-h-screen bg-fundo text-white">
      <Header />

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 pt-[80px] pb-6">
        <main className={`flex-1 ${exibirSidebar ? "lg:pr-6" : ""}`}>{children}</main>

        {exibirSidebar && (
          <aside className="w-[320px] hidden lg:block">
            <Sidebar />
          </aside>
        )}
      </div>

      <Footer />
    </div>
  );
}
