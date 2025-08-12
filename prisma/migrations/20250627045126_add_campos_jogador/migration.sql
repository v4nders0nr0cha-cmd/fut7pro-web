/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Jogador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apelido` to the `Jogador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Jogador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Jogador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Jogador" ADD COLUMN     "apelido" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "mensalista" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "nome" SET DATA TYPE TEXT,
ALTER COLUMN "posicao" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Racha" ALTER COLUMN "nome" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "nome" SET DATA TYPE TEXT,
ALTER COLUMN "apelido" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "senhaHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_email_key" ON "Jogador"("email");
