# Conferência e correção pontual das logos Hawks legadas

Consulta de leitura no projeto Neon `fut7pro-prodution`, tabela `public."Team"`, em 19/11/2026:

| Grupo | ID do time | Nome | Cor | URL atual |
| --- | --- | --- | --- | --- |
| quintasemlei | cmwnt03sd000jg33sg1azirli | Time amarelo | #FFD700 | /images/times/time_padrao_01.png |
| quintasemlei | cmwnt0pgt000ng33s0a6kj7qz | time vermelho | #ff0000 | /images/times/time_padrao_01.png |
| vitrine | cmkfmjq520001i2owxe178xv0 | Leoes do Norte | #f97316 | /images/times/time_padrao_01.png |

Os dois times de `quintasemlei` foram cadastrados sem upload. O registro `vitrine` permanece fora do escopo até comprovação da origem da imagem. Nenhuma escrita foi executada durante a análise.

## Procedimento futuro, após revisão

1. Confirmar o ambiente e a tabela efetivamente usados pela API de produção. Executar novamente a consulta abaixo e conferir os dois IDs, o slug, o nome e o valor exato da URL. Interromper se houver qualquer divergência.
2. Exportar as duas linhas completas (incluindo `id`, `tenantId`, `logoUrl`, `name`, `color`) como backup lógico, em local restrito, antes de abrir a transação.
3. Em uma sessão de banco controlada, executar a atualização condicional abaixo. Conferir que o `RETURNING` contém exatamente os dois IDs esperados e `logoUrl = null`. Se a contagem for diferente, usar `ROLLBACK`; caso contrário, `COMMIT`.
4. Consultar novamente os dois registros e conferir as telas de Gerenciar Times e site público. Manter o backup até concluir a verificação.

Consulta de conferência:

```sql
SELECT t.id, t.name, t.color, t."tenantId", a.slug, t."logoUrl"
FROM public."Team" AS t
JOIN public."Tenant" AS a ON a.id = t."tenantId"
WHERE t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
ORDER BY t.id;
```

Atualização preparada, **não executada**:

```sql
BEGIN;
SELECT t.id, t.name, t.color, t."tenantId", a.slug, t."logoUrl"
FROM public."Team" AS t
JOIN public."Tenant" AS a ON a.id = t."tenantId"
WHERE t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
FOR UPDATE OF t;

UPDATE public."Team" AS t
SET "logoUrl" = NULL
FROM public."Tenant" AS a
WHERE a.id = t."tenantId"
  AND a.slug = 'quintasemlei'
  AND t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
  AND t."logoUrl" = '/images/times/time_padrao_01.png'
RETURNING t.id, t.name, t."tenantId", t."logoUrl";
-- Conferir exatamente 2 linhas e os IDs esperados antes de COMMIT.
-- Se houver divergência: ROLLBACK;
```

Reversão a partir do backup, apenas se nenhuma alteração posterior tiver substituído a logo:

```sql
BEGIN;
UPDATE public."Team" AS t
SET "logoUrl" = '/images/times/time_padrao_01.png'
FROM public."Tenant" AS a
WHERE a.id = t."tenantId"
  AND a.slug = 'quintasemlei'
  AND t.id IN ('cmwnt03sd000jg33sg1azirli', 'cmwnt0pgt000ng33s0a6kj7qz')
  AND t."logoUrl" IS NULL
RETURNING t.id, t."logoUrl";
-- Conferir 2 linhas; só então COMMIT. Em caso de divergência: ROLLBACK.
```
