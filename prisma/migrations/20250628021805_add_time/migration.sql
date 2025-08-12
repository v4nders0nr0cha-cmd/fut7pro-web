-- CreateTable
CREATE TABLE "Time" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "escudoUrl" TEXT,
    "corPrincipal" TEXT,
    "corSecundaria" TEXT,
    "rachaId" TEXT NOT NULL,
    "jogadores" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Time_slug_key" ON "Time"("slug");

-- AddForeignKey
ALTER TABLE "Time" ADD CONSTRAINT "Time_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
