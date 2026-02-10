import { PrismaClient, Role } from "@prisma/client";

// ATENÇÃO: Este seed é para desenvolvimento local do frontend apenas.
// Em produção, utilize os seeds do backend e variáveis de ambiente.

async function main() {
  const prisma = new PrismaClient();
  try {
    // Planos (exemplo)
    await prisma.plano.createMany({
      data: [
        {
          nome: "Trial",
          valor: 0,
          features: "Limite de atletas: 15",
          maxAtletas: 15,
          maxAdmins: 2,
        },
        {
          nome: "Mensal",
          valor: 69.9,
          features: "Todos os recursos",
          maxAtletas: 40,
          maxAdmins: 5,
        },
        { nome: "Anual", valor: 699, features: "Recursos premium", maxAtletas: 60, maxAdmins: 8 },
      ],
      skipDuplicates: true,
    });

    const email = process.env.SEED_SUPERADMIN_EMAIL;
    const passwordHash = process.env.SEED_SUPERADMIN_PASSWORD_HASH;
    if (!email || !passwordHash) {
      throw new Error(
        "Defina SEED_SUPERADMIN_EMAIL e SEED_SUPERADMIN_PASSWORD_HASH no ambiente para rodar o seed."
      );
    }

    await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        nome: "Super Admin",
        apelido: "SuperAdmin",
        email,
        senhaHash: passwordHash,
        role: Role.SUPERADMIN,
        status: "ativo",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
