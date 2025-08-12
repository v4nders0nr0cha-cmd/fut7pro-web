-- CreateTable
CREATE TABLE "InfluencerPagamento" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "InfluencerPagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InfluencerPagamento" ADD CONSTRAINT "InfluencerPagamento_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerPagamento" ADD CONSTRAINT "InfluencerPagamento_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
