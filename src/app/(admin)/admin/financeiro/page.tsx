import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminFinanceiroLegacyPage() {
  redirect("/admin/financeiro/prestacao-de-contas");
}
