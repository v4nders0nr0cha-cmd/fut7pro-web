import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function SuperAdminRootLayout({ children }: { children: ReactNode }) {
  return <div className={`${inter.className} min-h-screen bg-zinc-950 text-white`}>{children}</div>;
}
