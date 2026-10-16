import type { Metadata } from "next";
import AdminGuideClient from "./AdminGuideClient";

export const metadata: Metadata = {
  title: "Guia Fut7Pro | Painel administrativo",
  description: "Acompanhe a preparação e os primeiros passos da sua pelada.",
  robots: { index: false, follow: false },
};

export default function AdminGuidePage() {
  return <AdminGuideClient />;
}
