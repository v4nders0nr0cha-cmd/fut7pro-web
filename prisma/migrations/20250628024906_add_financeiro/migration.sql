-- CreateTable
CREATE TABLE "Financeiro" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
