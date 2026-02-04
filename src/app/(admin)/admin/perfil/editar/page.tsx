import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

export default function AdminPerfilEditarRedirect() {
  const slug = cookies().get(ACTIVE_TENANT_COOKIE)?.value;
  const target = slug ? `/${slug}/perfil?edit=1` : "/perfil?tab=rachas&edit=1";
  redirect(target);
}
