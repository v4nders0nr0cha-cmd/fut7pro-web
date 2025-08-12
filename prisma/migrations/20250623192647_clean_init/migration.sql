-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(10) NOT NULL,
    "apelido" VARCHAR(10) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Racha" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "Racha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogador" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "posicao" VARCHAR(10) NOT NULL,
    "foto" TEXT,
    "rachaId" TEXT NOT NULL,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoEstrela" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,
    "estrelas" INTEGER NOT NULL,
    "atualizadoPor" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoEstrela_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoEstrela_rachaId_jogadorId_key" ON "AvaliacaoEstrela"("rachaId", "jogadorId");

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoEstrela" ADD CONSTRAINT "AvaliacaoEstrela_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoEstrela" ADD CONSTRAINT "AvaliacaoEstrela_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
