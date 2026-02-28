import type { Metadata } from "next";
import NewsletterLeadsClient from "./NewsletterLeadsClient";

export const metadata: Metadata = {
  title: "SuperAdmin | Leads Newsletter",
  description:
    "Gestao dos leads capturados pela newsletter institucional do Fut7Pro, com filtros, duplicidades e status de notificacao.",
  robots: { index: false, follow: false },
};

export default function SuperAdminNewsletterPage() {
  return <NewsletterLeadsClient />;
}
