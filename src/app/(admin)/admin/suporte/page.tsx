import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminSuporteLegacyPage() {
  redirect("/admin/comunicacao/suporte");
}
