# Logos opcionais e correção pontual dos dados legados

## Decisão de compatibilidade

Logo ausente (`null`, vazia ou não informada) mostra iniciais e cor. Uma URL válida já cadastrada continua sendo exibida, inclusive `/images/times/time_padrao_01.png`. A URL sozinha não comprova atribuição automática. Nenhum componente deve usar IDs de times ou grupos para decidir se esconde uma imagem.

Novos cadastros sem upload enviam `logoUrl: null`. Na edição, `null` remove a imagem; campo não informado preserva o valor no backend. `TeamBadge` e o banner do campeão preservam imagens existentes.

### Origem da imagem na vitrine

O backend define explicitamente `Leoes do Norte`, `#f97316` e `/images/times/time_padrao_01.png` em [`prisma/seed-vitrine.ts`](https://github.com/v4nders0nr0cha-cmd/fut7pro-backend/blob/b74d32dcbdf9ada620c17a59f0444e957052f98c/prisma/seed-vitrine.ts#L67). O laço de persistência desse arquivo grava `seed.logoUrl` tanto na criação quanto na atualização. O histórico do arquivo remonta aos commits `486fec50f563470b366189c74a06a7cbbebddb4e` e `a428c95e7658fb3bb33948f212454e329be20403`, de janeiro de 2026.

Isso documenta uma atribuição explícita na preparação da demonstração, compatível com o registro auditado. Não é um log de execução nem prova de uma escolha manual do administrador. A fixture pública do frontend também escolhe essas imagens explicitamente, com outra associação entre nomes e escudos. Preservar ambas evita alterar a identidade das demonstrações. O registro de `vitrine` fica fora da correção SQL.

## Registros identificados

Consulta anterior, somente de leitura, no projeto Neon `fut7pro-prodution`, tabela `public."Team"`, em 19/11/2026:

| Grupo        | ID do time                | Nome           | Cor     | URL atual                        |
| ------------ | ------------------------- | -------------- | ------- | -------------------------------- |
| quintasemlei | cmwnt03sd000jg33sg1azirli | Time amarelo   | #FFD700 | /images/times/time_padrao_01.png |
| quintasemlei | cmwnt0pgt000ng33s0a6kj7qz | time vermelho  | #ff0000 | /images/times/time_padrao_01.png |
| vitrine      | cmkfmjq520001i2owxe178xv0 | Leoes do Norte | #f97316 | /images/times/time_padrao_01.png |

Os dois times de `quintasemlei` foram cadastrados sem upload, conforme o relato do proprietário. Seus IDs precisam ser reconferidos no momento da execução. Nenhuma escrita foi realizada nesta revisão e os valores acima não substituem uma consulta atual.

Até a normalização autorizada, esses dois registros ainda exibem a imagem gravada. Após `logoUrl = NULL`, passam a mostrar TA e TV naturalmente. A implantação do código e a correção dos dados são etapas separadas.

## Procedimento futuro, somente após autorização

Usar uma sessão `psql` controlada, no banco confirmado como o mesmo utilizado pela API. Não executar este procedimento como migração automática. Os comandos abaixo não foram executados em produção.

1. Ativar `ON_ERROR_STOP`, iniciar a transação e bloquear os dois times e seu grupo.
2. Capturar as linhas completas e conferir IDs, nomes, cores, grupo e URL. Uma divergência aborta a transação.
3. Exportar o backup lógico para arquivo restrito, conferir sua existência e conteúdo antes de atualizar.
4. Atualizar somente os registros que ainda correspondem à captura; exigir exatamente duas alterações. Conferir o resultado e exportar a captura posterior.
5. Executar `COMMIT` manualmente somente após todas as conferências; em qualquer divergência, `ROLLBACK`. Não deixar a sessão aberta sem supervisão.

Preparação e backup, sem atualizar os times:

```sql
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout = '5s';

SELECT t.id, t.name, t.color, t."tenantId", a.slug, t."logoUrl"
FROM public."Team" AS t
JOIN public."Tenant" AS a ON a.id = t."tenantId"
WHERE t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
FOR UPDATE OF t FOR SHARE OF a;

CREATE TEMP TABLE team_logo_before ON COMMIT PRESERVE ROWS AS
SELECT t.*, t.xmin::text AS row_version
FROM public."Team" AS t
JOIN public."Tenant" AS a ON a.id = t."tenantId"
WHERE a.slug = 'quintasemlei'
  AND t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz');

DO $$
BEGIN
  IF (SELECT count(*) FROM team_logo_before) <> 2 OR EXISTS (
    SELECT 1 FROM team_logo_before
    WHERE "logoUrl" IS DISTINCT FROM '/images/times/time_padrao_01.png'
       OR "archivedAt" IS NOT NULL
       OR (id = 'cmwnt03sd000jg33sg1azirli'
           AND (name IS DISTINCT FROM 'Time amarelo' OR color IS DISTINCT FROM '#FFD700'))
       OR (id = 'cmwnt0pgt000ng33s0a6kj7qz'
           AND (name IS DISTINCT FROM 'time vermelho' OR color IS DISTINCT FROM '#ff0000'))
  ) THEN
    RAISE EXCEPTION 'Conferência divergente: nenhuma correção deve ser confirmada';
  END IF;
END $$;

TABLE team_logo_before;
\copy team_logo_before TO 'team-logo-before.csv' WITH (FORMAT csv, HEADER true)
```

Parar aqui para verificar o arquivo de backup e as duas linhas. Usar nomes de arquivos exclusivos por execução, sem sobrescrever backups anteriores. Depois, na mesma sessão e transação:

```sql
DO $$
DECLARE affected integer;
BEGIN
  UPDATE public."Team" AS t
  SET "logoUrl" = NULL
  FROM team_logo_before AS b, public."Tenant" AS a
  WHERE t.id = b.id
    AND t."tenantId" = b."tenantId"
    AND a.id = t."tenantId" AND a.slug = 'quintasemlei'
    AND t."logoUrl" = '/images/times/time_padrao_01.png'
    AND t.xmin::text = b.row_version
    AND to_jsonb(t) = to_jsonb(b) - 'row_version';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 2 THEN
    RAISE EXCEPTION 'Esperadas 2 alterações, recebidas %', affected;
  END IF;
END $$;

CREATE TEMP TABLE team_logo_after ON COMMIT PRESERVE ROWS AS
SELECT t.*, t.xmin::text AS row_version
FROM public."Team" AS t
JOIN team_logo_before AS b ON b.id = t.id;

TABLE team_logo_after;
\copy team_logo_after TO 'team-logo-after.csv' WITH (FORMAT csv, HEADER true)
-- Conferir exatamente os dois IDs, o mesmo tenantId e logoUrl NULL.
-- Conferir ambos os backups exportados; só então executar COMMIT manualmente.
-- Em caso de divergência ou falha na exportação: ROLLBACK;
```

Depois do commit, consultar novamente os dois IDs e conferir Gerenciar Times e site público. Não incluir `vitrine` na atualização.

## Reversão controlada

Antes do commit, usar `ROLLBACK`. Depois dele, a reversão abaixo depende das duas capturas preservadas na mesma sessão. Restaura somente a logo original do backup e exige que nenhuma escrita posterior tenha modificado as linhas, inclusive uma nova remoção de logo que resulte novamente em `NULL`. A comparação com `xmin` detecta essas escritas, pois `Team` não possui `updatedAt` no schema atual.

```sql
BEGIN;
SET LOCAL lock_timeout = '5s';
SELECT t.id FROM public."Team" AS t
JOIN team_logo_after AS s ON s.id = t.id
JOIN public."Tenant" AS a ON a.id = t."tenantId"
FOR UPDATE OF t FOR SHARE OF a;

DO $$
DECLARE affected integer;
BEGIN
  IF (SELECT count(*) FROM team_logo_before) <> 2
     OR (SELECT count(*) FROM team_logo_after) <> 2 THEN
    RAISE EXCEPTION 'Capturas incompletas: interromper reversão';
  END IF;
  UPDATE public."Team" AS t
  SET "logoUrl" = b."logoUrl"
  FROM team_logo_before AS b, team_logo_after AS s, public."Tenant" AS a
  WHERE t.id = b.id AND t.id = s.id
    AND t."tenantId" = b."tenantId" AND t."tenantId" = s."tenantId"
    AND a.id = t."tenantId" AND a.slug = 'quintasemlei'
    AND t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
    AND t."logoUrl" IS NULL
    AND b."logoUrl" = '/images/times/time_padrao_01.png'
    AND t.xmin::text = s.row_version
    AND to_jsonb(t) = to_jsonb(s) - 'row_version';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 2 THEN
    RAISE EXCEPTION 'Reversão interrompida: esperadas 2 linhas, recebidas %', affected;
  END IF;
END $$;

SELECT t.id, t."tenantId", t."logoUrl"
FROM public."Team" AS t JOIN team_logo_before AS b ON b.id = t.id;
-- Conferir os dois valores originais; só então COMMIT manualmente.
-- Qualquer divergência: ROLLBACK;
```

Se a sessão for perdida, os CSVs continuam sendo o backup, mas não executar uma restauração cega: revalidar ambiente, schema, capturas e alterações posteriores antes de preparar uma nova reversão. `xmin` é uma proteção de concorrência para essa janela controlada, não um identificador permanente para restauração futura.
