import type { Metadata } from "next";
import AdminGuideClient from "./AdminGuideClient";

export const metadata: Metadata = {
  title: "Guia Fut7Pro | Painel administrativo",
  description: "Acompanhe a preparação e os primeiros passos do seu grupo.",
  robots: { index: false, follow: false },
};

export default function AdminGuidePage() {
  return <AdminGuideClient />;
}
