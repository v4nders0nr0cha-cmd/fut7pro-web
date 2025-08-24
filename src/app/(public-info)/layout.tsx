import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fut7Pro - Informações",
  description: "Termos, políticas, regras e documentos institucionais Fut7Pro.",
};

export default function PublicInfoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-fundo text-white`}>
      {children}
    </div>
  );
}
