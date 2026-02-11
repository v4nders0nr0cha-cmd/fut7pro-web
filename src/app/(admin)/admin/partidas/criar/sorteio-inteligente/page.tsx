import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SorteioInteligenteLegacyPage() {
  redirect("/admin/partidas/sorteio-inteligente");
}
