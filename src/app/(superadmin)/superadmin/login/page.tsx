import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { superAdminAuthOptions } from "@/server/auth/superadmin-options";
import SuperAdminLoginClient from "./SuperAdminLoginClient";

type SuperAdminSession = {
  user?: {
    role?: string | null;
  } | null;
} | null;

export default async function SuperAdminLoginPage() {
  const session = (await getServerSession(superAdminAuthOptions as any)) as SuperAdminSession;
  const role = String(session?.user?.role || "").toUpperCase();

  if (session?.user && role === "SUPERADMIN") {
    redirect("/superadmin/dashboard");
  }

  return <SuperAdminLoginClient />;
}
