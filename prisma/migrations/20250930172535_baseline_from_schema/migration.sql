-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPERADMIN', 'PRESIDENTE', 'ADMIN', 'VICEPRESIDENTE', 'DIRETORFUTEBOL', 'DIRETORFINANCEIRO', 'LEITOR', 'ATLETA');

-- CreateEnum
CREATE TYPE "public"."RachaStatus" AS ENUM ('ATIVO', 'INATIVO', 'TRIAL', 'BLOQUEADO', 'INADIMPLENTE');

-- CreateTable
CREATE TABLE "public"."Racha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "logoUrl" TEXT,
    "tema" TEXT,
    "regras" TEXT,
    "ownerId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "financeiroVisivel" BOOLEAN NOT NULL DEFAULT false,
    "planoId" TEXT,
    "status" "public"."RachaStatus" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "Racha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Time" (
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

-- CreateTable
CREATE TABLE "public"."RachaAdmin" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RachaAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patrocinador" (
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

-- CreateTable
CREATE TABLE "public"."Campeao" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "jogadores" TEXT,
    "imagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campeao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partida" (
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

-- CreateTable
CREATE TABLE "public"."RachaJogador" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,

    CONSTRAINT "RachaJogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'ATLETA',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jogador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "foto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "mensalista" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminLog" (
    "id" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Financeiro" (
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

-- CreateTable
CREATE TABLE "public"."Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "features" TEXT,
    "maxAtletas" INTEGER NOT NULL,
    "maxAdmins" INTEGER NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ticket" (
    "id" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    "rachaId" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TicketResposta" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campanha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "uso" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "rachaId" TEXT,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Influencer" (
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
CREATE TABLE "public"."InfluencerVenda" (
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

-- CreateTable
CREATE TABLE "public"."InfluencerPagamento" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "InfluencerPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InfluencerCupomUso" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rachaId" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'trial',

    CONSTRAINT "InfluencerCupomUso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Racha_slug_key" ON "public"."Racha"("slug");

-- CreateIndex
CREATE INDEX "Racha_ownerId_idx" ON "public"."Racha"("ownerId");

-- CreateIndex
CREATE INDEX "Racha_status_idx" ON "public"."Racha"("status");

-- CreateIndex
CREATE INDEX "Racha_ativo_idx" ON "public"."Racha"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Time_slug_key" ON "public"."Time"("slug");

-- CreateIndex
CREATE INDEX "Time_rachaId_idx" ON "public"."Time"("rachaId");

-- CreateIndex
CREATE INDEX "RachaAdmin_rachaId_idx" ON "public"."RachaAdmin"("rachaId");

-- CreateIndex
CREATE INDEX "RachaAdmin_usuarioId_idx" ON "public"."RachaAdmin"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "RachaAdmin_rachaId_usuarioId_key" ON "public"."RachaAdmin"("rachaId", "usuarioId");

-- CreateIndex
CREATE INDEX "Patrocinador_rachaId_idx" ON "public"."Patrocinador"("rachaId");

-- CreateIndex
CREATE INDEX "Patrocinador_status_idx" ON "public"."Patrocinador"("status");

-- CreateIndex
CREATE INDEX "Campeao_rachaId_idx" ON "public"."Campeao"("rachaId");

-- CreateIndex
CREATE INDEX "Campeao_data_idx" ON "public"."Campeao"("data");

-- CreateIndex
CREATE INDEX "Campeao_categoria_idx" ON "public"."Campeao"("categoria");

-- CreateIndex
CREATE INDEX "Partida_rachaId_data_idx" ON "public"."Partida"("rachaId", "data");

-- CreateIndex
CREATE INDEX "Partida_finalizada_idx" ON "public"."Partida"("finalizada");

-- CreateIndex
CREATE INDEX "RachaJogador_rachaId_idx" ON "public"."RachaJogador"("rachaId");

-- CreateIndex
CREATE INDEX "RachaJogador_jogadorId_idx" ON "public"."RachaJogador"("jogadorId");

-- CreateIndex
CREATE UNIQUE INDEX "RachaJogador_rachaId_jogadorId_key" ON "public"."RachaJogador"("rachaId", "jogadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "public"."Usuario"("role");

-- CreateIndex
CREATE INDEX "Usuario_status_idx" ON "public"."Usuario"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_email_key" ON "public"."Jogador"("email");

-- CreateIndex
CREATE INDEX "Jogador_status_idx" ON "public"."Jogador"("status");

-- CreateIndex
CREATE INDEX "AdminLog_rachaId_idx" ON "public"."AdminLog"("rachaId");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_idx" ON "public"."AdminLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminLog_acao_idx" ON "public"."AdminLog"("acao");

-- CreateIndex
CREATE INDEX "Financeiro_rachaId_idx" ON "public"."Financeiro"("rachaId");

-- CreateIndex
CREATE INDEX "Financeiro_adminId_idx" ON "public"."Financeiro"("adminId");

-- CreateIndex
CREATE INDEX "Financeiro_data_idx" ON "public"."Financeiro"("data");

-- CreateIndex
CREATE INDEX "Financeiro_categoria_idx" ON "public"."Financeiro"("categoria");

-- CreateIndex
CREATE INDEX "Financeiro_tipo_idx" ON "public"."Financeiro"("tipo");

-- CreateIndex
CREATE INDEX "Ticket_usuarioId_idx" ON "public"."Ticket"("usuarioId");

-- CreateIndex
CREATE INDEX "Ticket_rachaId_idx" ON "public"."Ticket"("rachaId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "public"."Ticket"("status");

-- CreateIndex
CREATE INDEX "TicketResposta_ticketId_idx" ON "public"."TicketResposta"("ticketId");

-- CreateIndex
CREATE INDEX "TicketResposta_usuarioId_idx" ON "public"."TicketResposta"("usuarioId");

-- CreateIndex
CREATE INDEX "Campanha_rachaId_idx" ON "public"."Campanha"("rachaId");

-- CreateIndex
CREATE INDEX "Campanha_codigo_idx" ON "public"."Campanha"("codigo");

-- CreateIndex
CREATE INDEX "Campanha_status_idx" ON "public"."Campanha"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_cpf_key" ON "public"."Influencer"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_cupom_key" ON "public"."Influencer"("cupom");

-- CreateIndex
CREATE INDEX "Influencer_status_idx" ON "public"."Influencer"("status");

-- CreateIndex
CREATE INDEX "InfluencerVenda_influencerId_idx" ON "public"."InfluencerVenda"("influencerId");

-- CreateIndex
CREATE INDEX "InfluencerVenda_usuarioId_idx" ON "public"."InfluencerVenda"("usuarioId");

-- CreateIndex
CREATE INDEX "InfluencerVenda_status_idx" ON "public"."InfluencerVenda"("status");

-- CreateIndex
CREATE INDEX "InfluencerPagamento_influencerId_idx" ON "public"."InfluencerPagamento"("influencerId");

-- CreateIndex
CREATE INDEX "InfluencerPagamento_adminId_idx" ON "public"."InfluencerPagamento"("adminId");

-- CreateIndex
CREATE INDEX "InfluencerCupomUso_influencerId_idx" ON "public"."InfluencerCupomUso"("influencerId");

-- CreateIndex
CREATE INDEX "InfluencerCupomUso_usuarioId_idx" ON "public"."InfluencerCupomUso"("usuarioId");

-- CreateIndex
CREATE INDEX "InfluencerCupomUso_rachaId_idx" ON "public"."InfluencerCupomUso"("rachaId");

-- CreateIndex
CREATE INDEX "InfluencerCupomUso_status_idx" ON "public"."InfluencerCupomUso"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerCupomUso_influencerId_usuarioId_rachaId_key" ON "public"."InfluencerCupomUso"("influencerId", "usuarioId", "rachaId");

-- AddForeignKey
ALTER TABLE "public"."Racha" ADD CONSTRAINT "Racha_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Racha" ADD CONSTRAINT "Racha_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "public"."Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Time" ADD CONSTRAINT "Time_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RachaAdmin" ADD CONSTRAINT "RachaAdmin_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RachaAdmin" ADD CONSTRAINT "RachaAdmin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patrocinador" ADD CONSTRAINT "Patrocinador_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campeao" ADD CONSTRAINT "Campeao_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Partida" ADD CONSTRAINT "Partida_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RachaJogador" ADD CONSTRAINT "RachaJogador_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RachaJogador" ADD CONSTRAINT "RachaJogador_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "public"."Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminLog" ADD CONSTRAINT "AdminLog_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Financeiro" ADD CONSTRAINT "Financeiro_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Financeiro" ADD CONSTRAINT "Financeiro_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketResposta" ADD CONSTRAINT "TicketResposta_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketResposta" ADD CONSTRAINT "TicketResposta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campanha" ADD CONSTRAINT "Campanha_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerVenda" ADD CONSTRAINT "InfluencerVenda_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerVenda" ADD CONSTRAINT "InfluencerVenda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerPagamento" ADD CONSTRAINT "InfluencerPagamento_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerPagamento" ADD CONSTRAINT "InfluencerPagamento_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InfluencerCupomUso" ADD CONSTRAINT "InfluencerCupomUso_rachaId_fkey" FOREIGN KEY ("rachaId") REFERENCES "public"."Racha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

