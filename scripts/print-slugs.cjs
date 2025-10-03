const { PrismaClient } = require("@prisma/client");
(async () => {
  const p = new PrismaClient();
  try {
    let r;
    try {
      r = await p.racha.findMany({
        select: { id: true, slug: true, ativo: true, status: true },
        orderBy: { criadoEm: "desc" },
        take: 10
      });
    } catch {
      r = await p.racha.findMany({
        select: { id: true, slug: true, ativo: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 10
      });
    }
    for (const x of r) console.log(`${x.slug}  id=${x.id}  ativo=${x.ativo}  status=${x.status}`);
  } finally {
    await p.$disconnect();
  }
})();
