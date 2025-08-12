/*
  Warnings:

  - You are about to drop the column `rachaId` on the `Jogador` table. All the data in the column will be lost.
  - You are about to drop the `AvaliacaoEstrela` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Racha` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `atualizadoEm` to the `Racha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Racha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Racha` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AvaliacaoEstrela" DROP CONSTRAINT "AvaliacaoEstrela_jogadorId_fkey";

-- DropForeignKey
ALTER TABLE "AvaliacaoEstrela" DROP CONSTRAINT "AvaliacaoEstrela_rachaId_fkey";

-- DropForeignKey
ALTER TABLE "Jogador" DROP CONSTRAINT "Jogador_rachaId_fkey";

-- AlterTable
ALTER TABLE "Jogador" DROP COLUMN "rachaId";

-- AlterTable
ALTER TABLE "Racha" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "regras" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tema" TEXT;

-- DropTable
DROP TABLE "AvaliacaoEstrela";

-- CreateTable
CREATE TABLE "RachaAdmin" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "RachaAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RachaJogador" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,

    CONSTRAINT "RachaJogador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Racha_slug_key" ON "Racha"("slug");

-- AddForeignKey
ALTER TABLE "Racha" ADD CONSTRAINT "Racha_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaAdmin" ADD CONSTRAINT "RachaAdmin_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaAdmin" ADD CONSTRAINT "RachaAdmin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaJogador" ADD CONSTRAINT "RachaJogador_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RachaJogador" ADD CONSTRAINT "RachaJogador_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
