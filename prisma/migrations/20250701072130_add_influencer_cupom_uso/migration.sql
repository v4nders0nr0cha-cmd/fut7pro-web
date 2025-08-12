-- CreateTable
CREATE TABLE "InfluencerCupomUso" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'trial',

    CONSTRAINT "InfluencerCupomUso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
