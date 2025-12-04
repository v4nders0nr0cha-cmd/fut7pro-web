# Fut7Pro Web - Especificação Funcional (recriada)

> Documento de referência do módulo `fut7pro-web` (app.fut7pro.com.br). Esta versão foi regenerada após perda do arquivo original. Estrutura alinhada ao `README_DEV_GUIDE.md` e aos contratos já implementados no backend Nest.

## Visão Geral

- App multi-tenant: painel admin do racha + site público por `/{slug}`.
- Arquitetura: Next.js App Router (14.x), NextAuth integrado ao backend (`/auth/*` do Nest), proxies server-side para todas as rotas admin/públicas.
- Público-alvo: presidente/vice/diretores (painel), atletas (acessos restritos) e visitantes (site público).

## Ambiente & Integração

- Deploy: Vercel (`https://app.fut7pro.com.br`).
- Backend: Render (`https://api.fut7pro.com.br`).
- API base: `NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br` (server: `BACKEND_URL`/`API_URL`).
- Auth paths (Nest): `AUTH_LOGIN_PATH=/auth/login`, `AUTH_REFRESH_PATH=/auth/refresh`, `AUTH_ME_PATH=/auth/me`.
- Supabase Storage: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, buckets `sponsors`, `public-media`, `private-media`, `temp-uploads`.
- Produção: `DISABLE_WEB_DIRECT_DB=true` (proíbe Prisma direto no Next).
- Revalidate: rota `/api/revalidate/public` protegida por `PUBLIC_REVALIDATE_TOKEN`.

## Módulos Principais (painel + público)

- Sorteio inteligente e partidas (admin) com times equilibrados e destaques do dia.
- Rankings & estatísticas (público/admin) com filtros por período.
- Financeiro (admin/público opcional): lançamentos, prestação de contas, export e revalidate multi-tenant.
- Patrocinadores: CRUD admin, exibição pública e carrossel no footer.
- Conquistas: campeões, títulos e Grandes Torneios.
- Superadmin: visão global, métricas e integrações (backend exposição recente).

## Contrato de Grandes Torneios (atual)

### Entidade `Torneio`

| Campo              | Tipo                    | Observações                     |
| ------------------ | ----------------------- | ------------------------------- |
| id                 | string                  | UUID                            |
| tenantId           | string                  | herdado do slug                 |
| nome               | string                  | ex.: "Copa dos Campeões"        |
| slug               | string                  | único por tenant                |
| ano                | number                  | YYYY                            |
| descricao          | string?                 | detalhada                       |
| descricaoResumida  | string?                 | card                            |
| campeao            | string?                 | time campeão                    |
| bannerUrl          | string?                 | hero                            |
| logoUrl            | string?                 | escudo                          |
| dataInicio/dataFim | string? (ISO)           | opcional                        |
| status             | rascunho/publicado      | mostra no site quando publicado |
| destacarNoSite     | boolean                 | destaque único                  |
| publicadoEm        | string?                 | auto quando publicado           |
| jogadoresCampeoes  | TorneioJogadorCampeao[] | lista ordenada                  |

`TorneioJogadorCampeao`: `{ athleteId?: string; athleteSlug: string; nome: string; posicao: "Goleiro"|"Zagueiro"|"Meia"|"Atacante"; fotoUrl?: string|null }`

### Endpoints admin (web → backend)

- `GET /api/admin/torneios?slug={tenant}` (lista)
- `POST /api/admin/torneios` (cria; dispara revalidate)
- `GET /api/admin/torneios/{id}` (detalhe completo)
- `PUT /api/admin/torneios/{id}` (atualiza; revalidate se publicar)
- `PATCH /api/admin/torneios/{id}/destaque` (marcar/desmarcar destaque único)
- `DELETE /api/admin/torneios/{id}` (remove; revalidate)
- Upload: `/api/admin/torneios/upload` (Supabase Storage, usa SERVICE_ROLE e `SUPABASE_BUCKET_PUBLIC`)

### Endpoints públicos

- `GET /api/public/{slug}/torneios` → `{ slug, total, results: TorneioPublico[] }`
- `GET /api/public/{slug}/torneios/{torneioSlug}` → torneio publicado + jogadores campeões
- Cache: `Cache-Control: no-store`; usa backend Nest como fonte única.

### Revalidate

- Rota `/api/revalidate/public` com token; revalida `/{slug}` e paths extras (ex.: `/{slug}/grandes-torneios`, `/{slug}/grandes-torneios/{torneioSlug}`).

## RBAC (resumido)

- Presidente: acesso total (transferir racha, gerir admins, financeiro).
- Vice/Diretores: perfis específicos (futebol/financeiro/comunicação).
- Atletas: perfil próprio e presença/estatísticas limitadas.
- Visitante: páginas públicas.
- Superadmin: gestão global de tenants/integrações (backend).

## Pronto para produção (checklist chave)

- App Router em uso; rotas Pages/Prisma direto removidas.
- Todas as chamadas passam pelo backend Nest multi-tenant.
- Variáveis de produção configuradas (NextAuth, API base, Supabase, revalidate token).
- Revalidate disponível para invalidar páginas públicas por tenant.
- Módulo Grandes Torneios ligado ao backend (admin + público) e upload via Supabase.

## Observações

- Este arquivo foi recriado em 21/11/2025 com base nos contratos vigentes e no README_DEV_GUIDE. Refinar se novas regras forem adicionadas ao backend.
