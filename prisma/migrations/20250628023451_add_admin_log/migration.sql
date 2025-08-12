-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
