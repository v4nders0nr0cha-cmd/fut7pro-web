import { redirect } from "next/navigation";

export default function EditarPerfilRachaPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  const target = slug ? `/${slug}/perfil?edit=1` : "/perfil?tab=rachas&edit=1";
  redirect(target);
}
