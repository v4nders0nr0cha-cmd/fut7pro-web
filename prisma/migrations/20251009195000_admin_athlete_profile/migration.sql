-- Torna idempotente para bases que já possuem parte da estrutura

-- nickname só se não existir
ALTER TABLE "Athlete"
ADD COLUMN IF NOT EXISTS "nickname" TEXT;

-- slug: crie a coluna apenas se estiver faltando
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Athlete'
      AND column_name = 'slug'
  ) THEN
    ALTER TABLE "Athlete" ADD COLUMN "slug" TEXT;
  END IF;
END $$;

-- índice/unique de slug apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND indexname = 'Athlete_slug_key'
  ) THEN
    CREATE UNIQUE INDEX "Athlete_slug_key" ON "Athlete" ("slug");
  END IF;
END $$;

-- updatedAt só se não existir
ALTER TABLE "Athlete"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Se a sua migração original tinha outras ALTER TABLE/CREATE INDEX,
-- siga o mesmo padrão: IF NOT EXISTS para colunas e índices,
-- e DO $$ BEGIN ... EXCEPTION WHEN ... END $$ para constraints que não suportem IF NOT EXISTS.
