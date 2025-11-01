import { NextAuthOptions } from "next-auth";

// Configuração simplificada para evitar erros de build
export const authOptions: NextAuthOptions = {
  providers: [
    // Configure providers here
  ],
  callbacks: {
    session: ({ session, token }) => {
      const tokenRecord = token as Record<string, unknown>;

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: (tokenRecord.role as any) ?? session.user?.role,
          tenantId:
            typeof tokenRecord.tenantId === "string"
              ? (tokenRecord.tenantId as string)
              : (session.user?.tenantId ?? ""),
          tenantSlug:
            typeof tokenRecord.tenantSlug === "string"
              ? (tokenRecord.tenantSlug as string)
              : (session.user?.tenantSlug ?? null),
          accessToken:
            typeof tokenRecord.accessToken === "string"
              ? (tokenRecord.accessToken as string)
              : (session.user?.accessToken ?? ""),
          refreshToken:
            typeof tokenRecord.refreshToken === "string"
              ? (tokenRecord.refreshToken as string)
              : (session.user?.refreshToken ?? ""),
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  // Configurações para evitar erros de build
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build",
  debug: false,
};
