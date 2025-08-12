import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import AdminLayoutContent from "./SuperAdminLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} bg-gradient-to-br from-[#181818] to-[#232323] text-white min-h-screen`}
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </div>
  );
}
