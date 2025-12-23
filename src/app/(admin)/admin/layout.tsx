import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import AdminLayoutContent from "./AdminLayoutContent";
import ToasterProvider from "@/components/ToasterProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} bg-gradient-to-br from-[#181818] to-[#232323] text-white min-h-screen`}
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <ToasterProvider />
    </div>
  );
}
