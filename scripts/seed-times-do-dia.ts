import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const slug = process.argv[2] ?? "demo-racha";
const nomeRacha = process.argv[3] ?? "Racha Demonstracao";
const dataReferenciaInput = process.argv[4];

const dataReferencia = dataReferenciaInput ? new Date(dataReferenciaInput) : new Date();
if (Number.isNaN(dataReferencia.getTime())) {
  console.error("Data inválida fornecida. Use o formato YYYY-MM-DD.");
  process.exit(1);
}

dataReferencia.setHours(0, 0, 0, 0);

const jogadoresPorTime = 6;

const jogadoresBase = [
  { nome: "Goleiro", posicao: "GOL" },
  { nome: "Zagueiro 1", posicao: "ZAG" },
  { nome: "Zagueiro 2", posicao: "ZAG" },
  { nome: "Meia 1", posicao: "MEI" },
  { nome: "Meia 2", posicao: "MEI" },
  { nome: "Atacante", posicao: "ATA" },
];

function montarElenco(timeSlug: string) {
  return jogadoresBase.map((jogador, index) => ({
    id: `${timeSlug}-jogador-${index + 1}`,
    nome: `${jogador.nome} ${index + 1}`,
    apelido: `${jogador.posicao}${index + 1}`,
    foto: `/images/jogadores/jogador_padrao_${String(index + 1).padStart(2, "0")}.jpg`,
    posicao: jogador.posicao,
    status: "titular",
  }));
}

async function main() {
  console.log("➡️  Iniciando seed de partidas para", slug);

  const ownerEmail = `owner+${slug}@fut7pro.com`;

  const owner = await prisma.usuario.upsert({
    where: { email: ownerEmail },
    update: {
      nome: `Administrador ${nomeRacha}`,
      role: Role.PRESIDENTE,
    },
    create: {
      nome: `Administrador ${nomeRacha}`,
      apelido: "Admin",
      email: ownerEmail,
      role: Role.PRESIDENTE,
      senhaHash: "$2a$10$y0Z8B0N1q3i0rZB0demo1O2R8DP5Xg1QnzuDemoHashPEY3kQp7S8.",
    },
  });

  const racha = await prisma.racha.upsert({
    where: { slug },
    update: {
      nome: nomeRacha,
      descricao: `Racha gerado automaticamente em ${new Date().toISOString()}`,
      ownerId: owner.id,
      ativo: true,
    },
    create: {
      nome: nomeRacha,
      slug,
      descricao: "Racha criado via seed local",
      ownerId: owner.id,
      ativo: true,
    },
  });

  const timesSeed = [
    { nome: "Leões", slug: `${slug}-leoes`, cor: "#facc15" },
    { nome: "Tigres", slug: `${slug}-tigres`, cor: "#f97316" },
    { nome: "Águias", slug: `${slug}-aguias`, cor: "#38bdf8" },
    { nome: "Furacão", slug: `${slug}-furacao`, cor: "#ef4444" },
  ];

  const times = await Promise.all(
    timesSeed.map((time) =>
      prisma.time.upsert({
        where: { slug: time.slug },
        update: {
          nome: time.nome,
          corPrincipal: time.cor,
        },
        create: {
          nome: time.nome,
          slug: time.slug,
          corPrincipal: time.cor,
          rachaId: racha.id,
        },
      })
    )
  );

  const rosters: Record<string, string> = {};
  times.forEach((time) => {
    rosters[time.nome] = JSON.stringify(montarElenco(time.slug));
  });

  const confrontos = [
    { timeA: times[0].nome, timeB: times[1].nome, horario: "19:30" },
    { timeA: times[2].nome, timeB: times[3].nome, horario: "19:50" },
    { timeA: times[0].nome, timeB: times[2].nome, horario: "20:10" },
    { timeA: times[1].nome, timeB: times[3].nome, horario: "20:30" },
  ];

  const inicioDia = new Date(dataReferencia);
  const fimDia = new Date(dataReferencia);
  fimDia.setHours(23, 59, 59, 999);

  await prisma.partida.deleteMany({
    where: {
      rachaId: racha.id,
      data: {
        gte: inicioDia,
        lte: fimDia,
      },
    },
  });

  const partidasCriadas = await Promise.all(
    confrontos.map((partida, index) => {
      const dataPartida = new Date(dataReferencia);
      const [hora, minuto] = partida.horario.split(":").map(Number);
      dataPartida.setHours(hora, minuto, 0, 0);

      return prisma.partida.create({
        data: {
          rachaId: racha.id,
          data: dataPartida,
          horario: partida.horario,
          local: "Arena Fut7",
          timeA: partida.timeA,
          timeB: partida.timeB,
          golsTimeA: 0,
          golsTimeB: 0,
          jogadoresA: rosters[partida.timeA],
          jogadoresB: rosters[partida.timeB],
          destaquesA: null,
          destaquesB: null,
          finalizada: index < 2,
        },
      });
    })
  );

  console.log(
    `✅ ${partidasCriadas.length} partidas geradas para o dia ${dataReferencia.toISOString().slice(0, 10)}`
  );
}

main()
  .catch((error) => {
    console.error("Erro ao popular partidas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
