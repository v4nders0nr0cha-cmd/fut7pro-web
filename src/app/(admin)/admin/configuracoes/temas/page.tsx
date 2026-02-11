import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ConfiguracoesTemasLegacyPage() {
  redirect("/admin/personalizacao/visual-temas");
}
