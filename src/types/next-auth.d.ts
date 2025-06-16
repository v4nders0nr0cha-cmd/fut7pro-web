import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      apelido: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    apelido: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    apelido: string;
  }
}
