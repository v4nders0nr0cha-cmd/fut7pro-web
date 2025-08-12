-- CreateTable
CREATE TABLE "Patrocinador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "prioridade" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "descricao" TEXT,
    "rachaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patrocinador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Patrocinador" ADD CONSTRAINT "Patrocinador_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
