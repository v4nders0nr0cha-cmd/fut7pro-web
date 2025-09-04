import { NextAuthOptions } from "next-auth";

// Configuração simplificada para evitar erros de build
export const authOptions: NextAuthOptions = {
  providers: [
    // Configure providers here
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
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
