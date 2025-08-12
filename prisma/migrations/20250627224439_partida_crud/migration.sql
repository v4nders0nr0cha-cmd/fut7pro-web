-- CreateTable
CREATE TABLE "Partida" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "local" TEXT,
    "timeA" TEXT NOT NULL,
    "timeB" TEXT NOT NULL,
    "golsTimeA" INTEGER NOT NULL DEFAULT 0,
    "golsTimeB" INTEGER NOT NULL DEFAULT 0,
    "jogadoresA" TEXT NOT NULL,
    "jogadoresB" TEXT NOT NULL,
    "destaquesA" TEXT,
    "destaquesB" TEXT,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partida_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
