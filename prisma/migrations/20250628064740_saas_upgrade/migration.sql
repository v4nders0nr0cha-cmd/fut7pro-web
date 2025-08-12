-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'PRESIDENTE', 'ADMIN', 'VICEPRESIDENTE', 'DIRETORFUTEBOL', 'DIRETORFINANCEIRO', 'LEITOR', 'ATLETA');

-- CreateEnum
CREATE TYPE "RachaStatus" AS ENUM ('ATIVO', 'INATIVO', 'TRIAL', 'BLOQUEADO', 'INADIMPLENTE');

-- AlterTable
ALTER TABLE "Racha" ADD COLUMN     "financeiroVisivel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "planoId" TEXT,
ADD COLUMN     "status" "RachaStatus" NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ATLETA',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo';

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "features" TEXT,
    "maxAtletas" INTEGER NOT NULL,
    "maxAdmins" INTEGER NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    "rachaId" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketResposta" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "uso" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "rachaId" TEXT,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Racha" ADD CONSTRAINT "Racha_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResposta" ADD CONSTRAINT "TicketResposta_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResposta" ADD CONSTRAINT "TicketResposta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE SET NULL ON UPDATE CASCADE;
