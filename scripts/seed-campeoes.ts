import { PrismaClient, Role, RachaStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const cliArgs = process.argv.slice(2);
let argSlug: string | null = null;
for (let index = 0; index < cliArgs.length; index += 1) {
  const value = cliArgs[index];
  if (!value) continue;
  if (value.startsWith("--slug=")) {
    argSlug = value.split("=", 2)[1] ?? null;
    continue;
  }
  if (value === "--slug") {
    argSlug = cliArgs[index + 1] ?? null;
  }
}

const presidenteEmail = process.env.SEED_PRESIDENTE_EMAIL ?? "presidente.demo@fut7pro.local";
const presidenteSenha = process.env.SEED_PRESIDENTE_PASSWORD ?? "DemoFut7Pro!2025";
const rachaSlug =
  (argSlug && argSlug.length ? argSlug : null) ?? process.env.SEED_RACHA_SLUG ?? "demo-rachao";
const rachaNome = process.env.SEED_RACHA_NOME ?? "Demo Fut7Pro";

async function ensurePresidente() {
  const senhaHash = await bcrypt.hash(presidenteSenha, 10);
  const usuario = await prisma.usuario.upsert({
    where: { email: presidenteEmail },
    update: {},
    create: {
      nome: "Presidente Demo",
      apelido: "Presi",
      email: presidenteEmail,
      senhaHash,
      role: Role.PRESIDENTE,
      status: "ativo",
    },
  });

  return usuario;
}

async function ensureRacha(ownerId: string) {
  const racha = await prisma.racha.upsert({
    where: { slug: rachaSlug },
    update: {
      ownerId,
      ativo: true,
      status: RachaStatus.ATIVO,
    },
    create: {
      nome: rachaNome,
      slug: rachaSlug,
      ownerId,
      descricao: "Racha demo gerenciado pelo seed local",
      ativo: true,
      status: RachaStatus.ATIVO,
    },
  });

  return racha;
}

async function ensureRachaAdmin(rachaId: string, usuarioId: string) {
  const existente = await prisma.rachaAdmin.findFirst({
    where: {
      rachaId,
      usuarioId,
    },
  });

  if (existente) {
    return existente;
  }

  return prisma.rachaAdmin.create({
    data: {
      rachaId,
      usuarioId,
      role: "PRESIDENTE",
      status: "ativo",
    },
  });
}

async function ensureCampeoes(rachaId: string) {
  const campeoesExistentes = await prisma.campeao.findMany({ where: { rachaId } });
  if (campeoesExistentes.length > 0) {
    return campeoesExistentes;
  }

  const hoje = new Date();
  const campeoes = await prisma.campeao.createMany({
    data: [
      {
        rachaId,
        nome: "Time Ouro",
        categoria: "Quadrimestre 1",
        data: hoje,
        descricao: "Campanha invicta do primeiro quadrimestre",
        jogadores: JSON.stringify(["Joao Camisa 10", "Marcos Zagueiro", "Pedro Goleiro"]),
      },
      {
        rachaId,
        nome: "Guerreiros FC",
        categoria: "Temporada 2025",
        data: new Date(hoje.getFullYear(), 5, 30),
        descricao: "Titulo da temporada com goleada na final",
        jogadores: JSON.stringify(["Carlos Atacante", "Rafael Meia", "Andre Ala"]),
      },
    ],
    skipDuplicates: false,
  });

  console.log(`Seed inseriu ${campeoes.count} campeoes demo.`);

  return prisma.campeao.findMany({ where: { rachaId } });
}

async function main() {
  const usuario = await ensurePresidente();
  const racha = await ensureRacha(usuario.id);
  await ensureRachaAdmin(racha.id, usuario.id);
  const campeoes = await ensureCampeoes(racha.id);

  console.log("Seed de campeoes concluido.");
  console.table(
    campeoes.map((item) => ({
      id: item.id,
      nome: item.nome,
      categoria: item.categoria,
      data: item.data.toISOString().slice(0, 10),
    }))
  );

  console.log("Slug utilizado:", rachaSlug);
}

main()
  .catch((error) => {
    console.error("Falha ao executar seed de campeoes:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
