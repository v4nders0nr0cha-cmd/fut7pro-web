// src/pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await compare(credentials.senha, user.senhaHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          apelido: user.apelido,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.apelido = token.apelido as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.apelido = (user as any).apelido;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt" as const,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
