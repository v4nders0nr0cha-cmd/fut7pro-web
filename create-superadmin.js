const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function createSuperAdmin() {
  const prisma = new PrismaClient();

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.usuario.findUnique({
      where: {
        email: "vanderson_r0cha@hotmail.com",
      },
    });

    if (existingUser) {
      console.log("✅ Usuário já existe:");
      console.log(`ID: ${existingUser.id}`);
      console.log(`Nome: ${existingUser.nome}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Role: ${existingUser.role}`);
      console.log(`Status: ${existingUser.status}`);

      // Atualizar para SUPERADMIN se não for
      if (existingUser.role !== "SUPERADMIN") {
        await prisma.usuario.update({
          where: { id: existingUser.id },
          data: { role: Role.SUPERADMIN },
        });
        console.log("🔄 Role atualizado para SUPERADMIN");
      }
    } else {
      // Criar novo usuário Super Admin
      const passwordHash = await bcrypt.hash("123456", 10);

      const superAdmin = await prisma.usuario.create({
        data: {
          nome: "Vanderson Rocha",
          apelido: "Vanderson",
          email: "vanderson_r0cha@hotmail.com",
          senhaHash: passwordHash,
          role: Role.SUPERADMIN,
          status: "ativo",
        },
      });

      console.log("✅ Usuário Super Admin criado:");
      console.log(`ID: ${superAdmin.id}`);
      console.log(`Nome: ${superAdmin.nome}`);
      console.log(`Email: ${superAdmin.email}`);
      console.log(`Role: ${superAdmin.role}`);
      console.log(`Senha: 123456`);
    }

    // Listar todos os Super Admins
    console.log("\n📋 Todos os usuários Super Admin:");
    const superAdmins = await prisma.usuario.findMany({
      where: {
        role: "SUPERADMIN",
      },
    });

    superAdmins.forEach((admin) => {
      console.log(`- ${admin.nome} (${admin.email}) - ${admin.role}`);
    });
  } catch (error) {
    console.error("Erro ao criar/verificar usuário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
