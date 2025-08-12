-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "instagram" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "outros" TEXT,
    "cupom" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "saldoAcumulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerVenda" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "desconto" DOUBLE PRECISION NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "pagoEm" TIMESTAMP(3),

    CONSTRAINT "InfluencerVenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_cpf_key" ON "Influencer"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_cupom_key" ON "Influencer"("cupom");

-- AddForeignKey
ALTER TABLE "InfluencerVenda" ADD CONSTRAINT "InfluencerVenda_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerVenda" ADD CONSTRAINT "InfluencerVenda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
