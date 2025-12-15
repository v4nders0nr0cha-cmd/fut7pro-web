const { PrismaClient } = require("@prisma/client");

async function checkUser() {
  const prisma = new PrismaClient();

  try {
    // Buscar usuário pelo e-mail
    const user = await prisma.usuario.findUnique({
      where: {
        email: "vanderson_r0cha@hotmail.com",
      },
    });

    if (user) {
      console.log("✅ Usuário encontrado:");
      console.log(`ID: ${user.id}`);
      console.log(`Nome: ${user.nome}`);
      console.log(`Apelido: ${user.apelido}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
      console.log(`Criado em: ${user.createdAt}`);
    } else {
      console.log("❌ Usuário não encontrado com o e-mail vanderson_r0cha@hotmail.com");
    }

    // Listar todos os usuários Super Admin
    console.log("\n📋 Todos os usuários Super Admin:");
    const superAdmins = await prisma.usuario.findMany({
      where: {
        role: "SUPERADMIN",
      },
    });

    if (superAdmins.length > 0) {
      superAdmins.forEach((admin) => {
        console.log(`- ${admin.nome} (${admin.email}) - ${admin.role}`);
      });
    } else {
      console.log("Nenhum usuário Super Admin encontrado");
    }
  } catch (error) {
    console.error("Erro ao consultar usuário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
