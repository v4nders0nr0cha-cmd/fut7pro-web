import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import AdminLayoutContent from "./AdminLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] text-white`}
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </div>
  );
}
