# PR Tecnico - Padronizacao do Prisma

## Objetivo

Garantir que todos os handlers do Next usem @/server/prisma (instancia preparada para producao) e aposentar implementacoes antigas baseadas em src/lib/prisma.

## Escopo

- Revisar rotas de API criadas nas fases anteriores para confirmar o uso de @/server/prisma.
- Manter src/server/prisma.ts como unica fonte e remover utilitarios obsoletos.
- Atualizar scripts de seed e jobs que ainda importam PrismaClient direto de caminhos antigos.

## Status

- [x] Novas APIs publicas (/api/partidas, estatisticas, superadmin) usam @/server/prisma.
- [x] Arquivo src/lib/prisma.ts removido.
- [ ] Rotas legadas em src/pages/api/admin/\*\* ainda precisam ser migradas linha a linha.
- [ ] Scripts de seed (pasta scripts/) revisados para garantir consistencia.

## Proximos Passos

1. Fazer um
   g "new PrismaClient" para localizar usos fora de src/server/prisma.ts.
2. Atualizar rotas restantes em src/pages/api/admin/ para importar de @/server/prisma.
3. Rodar
   pm run type-check e smoke dos endpoints apos ajuste.
