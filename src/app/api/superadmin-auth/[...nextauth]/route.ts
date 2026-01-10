import NextAuth from "next-auth/next";
import { superAdminAuthOptions } from "@/server/auth/superadmin-options";

const handler = NextAuth(superAdminAuthOptions as any);

export { handler as GET, handler as POST };
