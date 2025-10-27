# README_DEV_GUIDE - Fut7Pro

> **Fonte única de verdade para desenvolvedores**  
> Versão: 2025 | Última atualização: 17/10/2025

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Estrutura de Pastas (C:\Projetos)](#2-estrutura-de-pastas-cprojetos)
3. [Como Rodar Cada Subprojeto](#3-como-rodar-cada-subprojeto)
4. [Regras e Padrões Obrigatórios (UI, Mobile, SEO)](#4-regras-e-padrões-obrigatórios-ui-mobile-seo)
5. [Fluxos de Negócio Principais](#5-fluxos-de-negócio-principais)
6. [Sistema de Pontuação, Rankings e Conquistas](#6-sistema-de-pontuação-rankings-e-conquistas)
7. [Sistema de Balanceamento (Sorteio Inteligente)](#7-sistema-de-balanceamento-sorteio-inteligente)
8. [Regras de Cadastro e Multi-tenant](#8-regras-de-cadastro-e-multi-tenant)
9. [Imagens e Identidade Visual](#9-imagens-e-identidade-visual)
10. [SEO — Estratégia, Tarefas e Checklist](#10-seo--estratégia-tarefas-e-checklist)
11. [Landing Pública — Estrutura de Páginas](#11-landing-pública--estrutura-de-páginas)
12. [Páginas Detalhadas](#12-páginas-detalhadas)
13. [Regras do Sorteio e Geração de Tabela de Jogos](#13-regras-do-sorteio-e-geração-de-tabela-de-jogos)
14. [Observações de Arquitetura e Segurança](#14-observações-de-arquitetura-e-segurança)
15. [Tarefas Recomendadas (Prioridade)](#15-tarefas-recomendadas-prioridade)
16. [Scripts Úteis (exemplos)](#16-scripts-úteis-exemplos)
17. [Contato / Anotações do Autor](#17-contato--anotações-do-autor)

---

## 1. Visão Geral

Fut7Pro é uma plataforma SaaS completa para gestão de **rachas de Futebol 7 entre amigos**, com foco em:

- 🏆 Gamificação (rankings, conquistas, ícones)
- 📊 Estatísticas automatizadas
- 🤖 Sorteio inteligente de times
- 🏢 Multi-tenant (cada racha isolado)
- 🛠️ Painéis administrativos independentes
- 🌐 Sites públicos personalizados por racha

> **Pasta raiz principal:** `C:\Projetos`

---

## 2. Estrutura de Pastas (C:\Projetos)

```
C:\Projetos
 ├─ fut7pro-web        # https://app.fut7pro.com.br (aplicação multi-tenant / painel do racha)
 ├─ fut7pro-site       # https://www.fut7pro.com.br (site institucional / vendas)
 ├─ fut7pro-backend    # API central (NestJS + Prisma + Postgres)
 ├─ fut7pro-api        # (versão antiga / referência)
 ├─ .github            # CI/CD workflows
 └─ .husky             # hooks de commit
```

### 2.1 fut7pro-web

- **Caminho:** `cd C:\Projetos\fut7pro-web`
- **URL pública:** https://app.fut7pro.com.br/
- **Finalidade:** site público individual por racha + painel admin multi-tenant.
- **Stack:** Next.js (App Router), React + TypeScript, Tailwind, shadcn/ui, Prisma, Context API, SSR/SEO otimizado.
- **Exemplos de URLs:**
  - `https://app.fut7pro.com.br/rachatop`
  - `https://app.fut7pro.com.br/admin/dashboard`

### 2.2 fut7pro-site

- **Caminho:** `cd C:\Projetos\fut7pro-site`
- **URL pública:** https://www.fut7pro.com.br/
- **Finalidade:** marketing, vendas, landing de novos admins, tutoriais.
- **Stack:** Next.js (SSG/ISR), SEO otimizado, design alinhado ao fut7pro-web.

### 2.3 fut7pro-backend

- **Caminho:** `cd C:\Projetos\fut7pro-backend`
- **Finalidade:** autenticação, multi-tenant, APIs REST + WebSocket, cronjobs, estatísticas.
- **Stack:** Node.js + NestJS, Prisma, PostgreSQL, JWT + refresh tokens.

---

## 3. Como Rodar Cada Subprojeto

### Pré-requisitos

- Node LTS
- pnpm (preferencial), compatível com yarn/npm
- Docker + Docker Compose (PostgreSQL local)
- Arquivos `.env` configurados

### Backend

```bash
cd C:/Projetos/fut7pro-backend
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm start:dev
```

### Web (aplicação multi-tenant)

```bash
cd C:/Projetos/fut7pro-web
cp .env.local.example .env.local
pnpm install
pnpm dev
```

### Site institucional

```bash
cd C:/Projetos/fut7pro-site
cp .env.local.example .env.local
pnpm install
pnpm dev
```

> Instruções de docker-compose, seeds, migrations adicionais: conferira o README de cada subprojeto.

---

## 4. Regras e Padrões Obrigatórios (UI, Mobile, SEO)

### Qualidade de entrega

- Sempre entregar versão **mobile-first e responsiva**.
- Toda nova página/componente sai com **estrutura SEO completa**: title, meta description, canonical, OG/Twitter, JSON-LD quando aplicável.
- URLs limpas, sem acentos (`/tira-teima`, `/gerador-de-times`).
- Titulação semântica (`<h1>` único, oculto com `sr-only` quando necessário).
- Performance: lazy load, divisão de chunks, imagens otimizadas (CDN + WebP), cache.
- IDs sempre como `string` (UUIDv4); status: `titular`, `substituto`, `ausente`.
- Usar `LayoutClient`; evitar duplicar layouts no cliente.

### Conteúdo & acessibilidade

- Logo não pode ser `<h1>`.
- Footer com `<p>`/`<small>`, nunca headings.
- Slugs, breadcrumbs e headings coerentes.
- Alt text descritivo, contraste, foco acessível.

### Lembrete geral

- **SEMPRE** me entregue versão mobile responsiva e com SEO pronto.
- Implementações críticas devem vir acompanhadas de testes (unit/E2E) quando houver lógica complexa.

---

## 5. Fluxos de Negócio Principais

### Cadastro do admin / criação do racha

- Admin informa: foto (opcional), nome (obrigatório e apenas primeiro nome), apelido (opcional), posição (obrigatória).
- Cadastro do racha: nome, cidade, estado (obrigatórios), logo (opcional).
- Conta do admin fica vinculada ao racha (1 racha por admin).
- Admin configura dias/horários em `/admin/rachas` e acompanha agenda em `/admin/partidas/proximos-rachas`.

### Cadastro de jogador

- Realizado no site público do racha.
- Campos: nome (primeiro nome), apelido (opcional), posição (obrigatória), foto (opcional).
- Acesso liberado após aprovação do admin.

### Operação diária

- Admin seleciona participantes, gera sorteio inteligente, publica Time Campeão do Dia.
- Publicação atualiza landing, rankings, conquistas e perfis.

---

## 6. Sistema de Pontuação, Rankings e Conquistas

### Pontuação “O Melhor”

| Resultado | Pontos |
| --------- | ------ |
| Vitória   | +3     |
| Empate    | +1     |
| Derrota   | 0      |

- Pontuação é somada somente com presença do atleta.
- Define “Melhor do Quadrimestre” e “Melhor do Ano”.

### Ranking de artilheiros

- Gol marcado: +1.
- Define artilheiro do dia/quadrimestre/ano.
- Desempate: número de jogos → média de gols/jogo.

### Ranking de assistências

- Apenas para posição “Meia”.
- Assistência: +1.

### Melhores por posição

- Posições: ATA, MEIA, ZAG, GOL.
- Critério: participações no Time Campeão do Dia ou pontuação filtrada por posição.

### Sistema de ícones e conquistas

- **Objetivo:** valorizar desempenho individual/coletivo ao longo do ano e registrar conquistas especiais.
- **TÍTULOS (Grandes Torneios)** 🏆 — mais raros (coletivos).
- **TÍTULOS ANUAIS** 🏆/⚽ — prestígio máximo individual.
- **TÍTULOS QUADRIMESTRAIS** 🥇/⚽ — recorrentes (3x ao ano).

#### Categorias

##### 1. Títulos Anuais (mais importantes)

| Conquista              | Critério                                         | Ícone             |
| ---------------------- | ------------------------------------------------ | ----------------- |
| Melhor jogador do ano  | Mais pontos somados no ano                       | 🏆 Troféu de ouro |
| Artilheiro do ano      | Mais gols no ano                                 | ⚽ Bola de ouro   |
| Melhor atacante do ano | Mais vezes no Time Campeão do Dia (posição ATA)  | 🏆 Troféu         |
| Melhor meia do ano     | Mais vezes no Time Campeão do Dia (posição MEIA) | 🏆 Troféu         |
| Melhor zagueiro do ano | Mais vezes no Time Campeão do Dia (posição ZAG)  | 🏆 Troféu         |
| Melhor goleiro do ano  | Mais vezes no Time Campeão do Dia (posição GOL)  | 🏆 Troféu         |

##### 2. Títulos Quadrimestrais (importância intermediária)

| Conquista                     | Critério                                 | Ícone              |
| ----------------------------- | ---------------------------------------- | ------------------ |
| Melhor do quadrimestre        | Mais pontos no período                   | 🥇 Medalha de ouro |
| Artilheiro do quadrimestre    | Mais gols no período                     | ⚽ Bola de prata   |
| Melhor por posição do período | Mais vezes no Time Campeão / mais pontos | 🥇 Medalha de ouro |

##### 3. Grandes Torneios (taças especiais)

| Conquista           | Critério                                            | Ícone                |
| ------------------- | --------------------------------------------------- | -------------------- |
| Campeão do torneio  | Selecionado manualmente entre os jogadores campeões | 🏆 Troféu exclusivo  |
| Destaques especiais | Ícones personalizados conforme natureza do torneio  | 🏆 Arte diferenciada |

- Ícones dos torneios precisam ter visual distinto dos troféus individuais.
- Dados técnicos: cada jogador possui campo/tabela de conquistas relacionando tipo, período (ano/quadrimestre) e ícone; frontend renderiza conforme essa estrutura.

#### Localização no perfil

```
🏅 MINHAS CONQUISTAS

01 – TÍTULOS (Grandes Torneios)
   🏆 Taça da Confraternização 2023

02 – TÍTULOS ANUAIS
   🏆 Melhor do Ano (2024)
   ⚽ Bola de Ouro (2024)
   🏆 Zagueiro do Ano (2023)

03 – TÍTULOS QUADRIMESTRAIS
   🥇 1º Quadrimestre 2024 – Melhor
   ⚽ 2º Quadrimestre 2024 – Artilheiro
   🥇 3º Quadrimestre 2023 – Goleiro
```

### Sistema de regras — Rankings e destaques

- Pontuação individual alimenta **Estatísticas**, **Os Campeões** e **Perfis**.
- Artilharia/assistências → atualizam rankings e ícones (Ouro = anual, Prata = quadrimestral).
- Participações no Time Campeão do Dia → rankings por posição.
- Time Campeão: vitórias → saldo → confronto direto → gols pró → sorteio (fallback).

### Atualização cruzada pós-partida

1. Estatísticas (pontos, vitórias, gols, assistências).
2. Landing/Partidas/Estatísticas/Os Campeões (dados públicos).
3. Perfil do atleta (ícones, rankings, histórico).
4. Painel admin (resumo da rodada, aprovações).

---

## 7. Sistema de Balanceamento (Sorteio Inteligente)

### Objetivo

- Formar times equilibrados considerando ranking, estrelas e posição.

### Critérios

- Ranking acumulado (pontos).
- Estrelas (1⭐ muito ruim → 5⭐ muito bom). Admin deve considerar técnica, condicionamento físico e psicológico; revisável a qualquer momento.
- Posição cadastrada (GOL, ZAG, MEIA, ATA).

### Funcionamento

1. Admin define participantes do dia.
2. Sistema classifica jogadores (ranking + estrelas + posição).
3. Sugere times equilibrados (semi-automático); admin pode ajustar.
4. Após publicar, times aparecem na página pública “Times do Dia”.

### Níveis de acesso

- **Painel Administrativo:** criar/editar/publicar, visualizar rankings, ajustar estrelas.
- **Página Pública (“Times do Dia”):** exibe composição final, horários, local, comentários.

### Integração com tabela de jogos

- Configurações: duração total (60/90/120/150), duração da partida (5–45), nº de times (2–6), jogadores por time (5/6/7).
- Sistema reserva 15 min para organização, calcula partidas máximas, gera confrontos equilibrados, evita jogos consecutivos.
- Exportação para PDF (súmula) com layout próprio.

---

## 8. Regras de Cadastro e Multi-tenant

- Admin cadastra dados pessoais + racha em `/admin/register`.
- Campos obrigatórios: nome do racha, cidade, estado; logo opcional (editar em `/admin/personalizacao/identidade-visual`).
- Cada admin pode criar apenas **1 racha**, mas pode configurar múltiplos horários/dias.
- Jogadores se cadastram no site do racha, aguardam aprovação.
- Multi-tenant preferencialmente com `tenantId` (row-level) para simplificar escalabilidade.
- Domínio do racha formado via `slug`: `https://app.fut7pro.com.br/{slug}`.

---

## 9. Imagens e Identidade Visual

- Logo personalizada substitui a padrão:
  - Sidebar do painel admin.
  - Header público do racha.
  - Sidebar público do racha.
- Estrutura sugerida (produção):
  - `public/images/jogadores/`
  - `public/images/logos/`
  - `public/images/patrocinadores/`
  - `public/images/times/`
- Uso obrigatório de CDN/Cloud Storage (S3 + CloudFront), com imagens responsivas (`srcset`, WebP).

---

## 10. SEO — Estratégia, Tarefas e Checklist

### Tabela SEO Fut7Pro

| Etapa  | Estratégia / Ação                                                           | Status / Aplicação                                                                                        |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **1**  | Foco 100% em **Futebol 7 (Fut7)** como palavra-chave principal              | ✅ Confirmado como posicionamento central                                                                 |
| **2**  | **Estrutura técnica genérica** para uso futuro em futsal e futebol de campo | ✅ Confirmado (sem impacto no SEO atual)                                                                  |
| **3**  | **Título da página (SEO)**                                                  | `Fut7Pro: Sistema para Racha, Fut7 e Futebol Amador` ✅                                                   |
| **4**  | **Meta Description otimizada**                                              | `"O Fut7Pro é o sistema mais completo do Brasil para organizar rachas de Futebol 7 entre amigos..."` ✅   |
| **5**  | Inserção de **`<h1>` oculto** com classe `sr-only`                          | 🔜 Próxima ação confirmada                                                                                |
| **6**  | Não usar `<h1>` na logo                                                     | ✅ Confirmado — logo é visual apenas                                                                      |
| **7**  | Footer sem heading tags (`<h2>`)                                            | ✅ Confirmado — usar `<p>` ou `<small>`                                                                   |
| **8**  | Criação de slugs limpos e sem acento                                        | ✅ Exemplos: `/tira-teima`, `/gerador-de-times`                                                           |
| **9**  | Uso de headings organizados (h1 → h2 → h3)                                  | 🔜 Em implementação                                                                                       |
| **10** | Palavras-chave a ranquear confirmadas                                       | `sistema para racha`, `fut7`, `futebol amador`, `gerador de times`, `aplicativo para sorteio de times` ✅ |
| **11** | Estrutura de landing com SEO técnico                                        | ✅ Estrutura com CTA + cards + sections                                                                   |
| **12** | Linkagem interna com slugs otimizados                                       | 🔜 Aplicar nas seções da landing                                                                          |
| **13** | Planejamento futuro de páginas para outras modalidades                      | 🔜 Pós-lançamento                                                                                         |
| **14** | Inserção futura de blog para conteúdo contínuo                              | 🔜 Etapa posterior                                                                                        |

### Plano de ação (especialista SEO)

1. **Análise da concorrência:** mapear players regionais/nacionais, identificar gaps, revisar SERP.
2. **Pesquisa de palavras-chave:** Google Trends, Keyword Planner, SERP analysis; priorizar long-tail (ex.: “sistema para racha fut7”, “aplicativo sorteio de times”).
3. **Otimização de conteúdo e estrutura:** headings coerentes, copy focada em benefícios, CTAs claros, interlinking relevante.
4. **Construção de links e divulgação:** parcerias (campos, lojas esportivas, blogs), backlinks, press releases, redes sociais.
5. **Monitoramento e análise:** GA4, Search Console, planilhas de ranking, Core Web Vitals contínuos.

### Checklist técnico por página

- Title único e descritivo.
- Meta description < 160 caracteres.
- Canonical definido.
- OpenGraph + Twitter card.
- JSON-LD (LocalBusiness, WebSite, BreadcrumbList, SoftwareApplication quando fizer sentido).
- Sitemap.xml e robots.txt atualizados.
- Performance (TTFB, LCP, CLS, FID/INP dentro das metas).
- Mobile-first obrigatório.
- Linkagem interna coerente, evitando orfandade de páginas.

### Resumo estratégico

📌 Toda página nova deve sair com:

- Título único.
- Meta description otimizada.
- URL limpa.
- Heading semântico.
- Performance otimizada (lazy load, imagens otimizadas, caching).

---

## 11. Landing Pública — Estrutura de Páginas

### Linhas principais

- **Linha 1 (Header fixo):** logo + nome do racha (esquerda); ícones Facebook/Instagram (centro, com links); botões Entrar/Cadastrar (direita).
- **Linha 2 (Menu):** PARTIDAS · ESTATÍSTICAS · OS CAMPEÕES · PERFIL DO ATLETA · GRANDES TORNEIOS · SOBRE NÓS.
- **Linha 3:** banner do TIME CAMPEÃO DO DIA + card lateral (“TIME CAMPEÃO DO DIA”) com data e jogadores (dados atualizados automaticamente após seleção em Partidas).
- **Linha 4:** MELHORES DO DIA (Atacante, Meia, Zagueiro, Goleiro).
- **Linha 5:** blocos simultâneos:
  - **JOGOS DO DIA:** últimas partidas com link para Partidas.
  - **OS MELHORES (Quadrimestre atual ex.: JAN/ABR):** ranking geral de pontuação.
  - **TABELA DOS TIMES:** gráfico dos times com mais vitórias no quadrimestre.
  - **ARTILHEIROS (Quadrimestre atual):** ranking de gols.
- **Linha 6:** carrossel de patrocinadores (até 9 logos, autoplay com controles acessíveis).

### Coluna direita (menu lateral)

- Logo + nome do racha.
- Card Artilheiro do Dia (foto, gols).
- Top 5 artilheiros do quadrimestre.
- Card Melhor do Ano (foto, pontos).
- Top 5 pontuadores do ano.
- Card Goleiro do Ano (foto, pontos).
- Top 5 goleiros do ano.

---

## 12. Páginas Detalhadas

### Partidas

- **Histórico:** calendário com marcações dos dias de jogo; lista com data, local, times, resultado, link de detalhes (modal).
- **Detalhes de uma partida:** escalações com fotos/nomes, destaques (gols, assistências), vencedor, link para Time Campeão do Dia.
- **Sorteio Inteligente (Times do Dia):** lista dos times sorteados/publicados, filtros por data/quadrimestre/jogador, estatísticas acumuladas, atualização automática após publicação.

### Estatísticas

- **Ranking Geral por Pontuação:** filtro por ano, quadrimestre, posição; destaque para top 3.
- **Artilheiros:** ranking anual/quadrimestral com ícones (⚽ dourada = anual, ⚽ prata = quadrimestral).
- **Assistências:** ranking de meias.
- **Melhores por Posição:** Atacante, Meia, Zagueiro, Goleiro (baseado em Time Campeão ou pontos).
- **Tira Teima:** comparação de dois atletas (stats, conquistas, histórico).
- **Classificação dos Times:** tabela com Pos, Time, Pts, J, V, E, D, GP, GC, SG; ordenar por pontos → vitórias → saldo → gols pró; 1º lugar em destaque verde + indicador de tendência (seta).
- **Filtros rápidos:** top 10, posição, período.

### Os Campeões

- **Seleção de ano:** define dados exibidos.
- **Cards superiores:**
  - 🏆 Melhor do Ano (pontos; link para ranking anual).
  - ⚽ Artilheiro do Ano (gols; link para ranking de gols).
  - 🏆 Campeão do Ano (time; link para tabela final).
- **Melhores por posição:** ATA/MEIA/ZAG/GOL (cartões com foto, nome, CTA para ranking filtrado).
- **Campeões por quadrimestre:** três blocos (Jan–Abr, Mai–Ago, Set–Dez) com:
  - 🥇 Melhor do Quadrimestre (pontos).
  - ⚽ Artilheiro do Quadrimestre (gols).
  - 🥇 Melhores por posição (ATA/MEIA/ZAG/GOL).
- Informações apresentadas em tabelas compactas (sem fotos, apenas nomes + ícones).

### Perfis dos Atletas

- **Card principal:** foto, primeiro nome + apelido, posição, status (Ativo, Inativo, Suspenso), badge MENSALISTA ATIVO (verde). Mensalistas aparecem primeiro; demais em ordem alfabética.
- **Estatísticas individuais:** jogos disputados, participações no Time Campeão do Dia, gols, assistências, pontuação anual, média de vitórias, posição no ranking atual.
- **Minhas Conquistas:** ícones organizados em abas:
  - [TÍTULOS (Grandes Torneios)] — nome do torneio, ano, time, jogadores.
  - [TÍTULOS ANUAIS] — Melhor do Ano, Artilheiro do Ano, melhores por posição (com descrição e ano).
  - [TÍTULOS QUADRIMESTRAIS] — Melhor do Quadrimestre, Artilheiro do Quadrimestre, melhores por posição.
- **Histórico de participações:** tabela com Data, Time, Resultado, Gols, Time Campeão, Pontuação, botão “Ver Detalhes”; filtros por ano/mês/período.
- **Comparação (Tira Teima):** seleção de outro atleta com apresentação lado a lado (estatísticas, conquistas, histórico).

### Grandes Torneios

- **Lista de torneios:** cards com nome, data/período, time campeão, foto, cards dos jogadores campeões.
- **Administração:** formulário restrito ao admin (nome, data, campeão, logo, foto, seleção de jogadores). Jogadores selecionados recebem ícone exclusivo no perfil (aba TÍTULOS — Grandes Torneios).
- **Filtros:** por ano, categoria (Interno, Confraternização, etc.), seção “Galeria dos Campeões”.

### Sobre Nós

- **Nossa História:** linha do tempo, fotos, curiosidades, depoimentos.
- **Estatuto:** regras oficiais (pontuação, comportamento, penalidades, mensalistas) — exibir em tópicos/FAQ/PDF.
- **Aniversariantes:** lista do mês (nome, foto, data) com gatilho para mensagem automática (“Feliz aniversário...”).
- **Nossos Parceiros:** cards com nome, logo, descrição, link, categoria; seção “Seja um parceiro” com formulário.
- **Contatos:** formulário (Nome, E-mail, Tipo de contato, Mensagem) + links (WhatsApp, redes sociais).

---

## 13. Regras do Sorteio e Geração de Tabela de Jogos

### Configurações automáticas

- Inputs: duração total (60/90/120/150), duração da partida (5–45), nº de times (2–6), jogadores por time (5/6/7).
- Reservar 15 minutos para organização → `tempo_util = tempo_total - 15`.
- `partidas_max = floor(tempo_util / tempo_partida)`.
- Gerar confrontos únicos (ida); se houver tempo, gerar ida e volta.
- Evitar jogos consecutivos para o mesmo time sempre que possível.
- Seleção de participantes limitada a `nº times × jogadores por time`.

### Exemplo (4 times, 7 jogadores, 1h30, partidas de 7 min)

- Times: A, B, C, D.
- Confrontos ida e volta (12 jogos).
- Ajuste de 6min15 por jogo para caber em 75 minutos.

| Jogo | Confronto | Tempo estimado |
| ---- | --------- | -------------- |
| 1    | A vs B    | 00:00 - 06:15  |
| 2    | C vs D    | 06:15 - 12:30  |
| 3    | A vs C    | 12:30 - 18:45  |
| 4    | B vs D    | 18:45 - 25:00  |
| 5    | A vs D    | 25:00 - 31:15  |
| 6    | B vs C    | 31:15 - 37:30  |
| 7    | B vs A    | 37:30 - 43:45  |
| 8    | D vs C    | 43:45 - 50:00  |
| 9    | C vs A    | 50:00 - 56:15  |
| 10   | D vs B    | 56:15 - 62:30  |
| 11   | D vs A    | 62:30 - 68:45  |
| 12   | C vs B    | 68:45 - 75:00  |

- Nenhum time joga duas vezes seguidas.
- Todos enfrentam todos duas vezes.
- Exportação para PDF (súmula para impressão/anotações) com layout distinto da web.

---

## 14. Observações de Arquitetura e Segurança

- Multi-tenant via `tenantId` (row-level) ou schemas; preferir row-level com índices.
- IDs como UUIDv4 (`string`) para garantir compatibilidade.
- Autenticação segura (JWT + refresh tokens ou cookies HttpOnly).
- Roles/permissions protegem rotas administrativas (guard/filter).
- Rate limiting em APIs públicas; auditoria de acesso.
- Validação consistente no backend (`class-validator`, DTOs).
- Imagens em S3 com políticas corretas de ACL e transformação via CDN.

---

## 15. Tarefas Recomendadas (Prioridade)

1. Criar/atualizar `README_DEV_GUIDE.md` na raiz (`C:\Projetos`) e replicar para todos os repositórios.
2. Garantir templates de página com `title`, `meta`, `<h1 class="sr-only">`, OG/Twitter, JSON-LD.
3. Implementar upload/uso da logo customizada (sidebar admin, header público, sidebar público).
4. Criar utilitário independente (TS) para gerar tabela de jogos, com testes unitários.
5. Criar endpoints reais de sorteio inteligente e persistência de times.
6. Integrar CDN para imagens com `srcset`/WebP e caching.

---

## 16. Scripts Úteis (exemplos)

```jsonc
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "test": "vitest",
  "prisma:migrate": "prisma migrate dev",
}
```

---

## 17. Contato / Anotações do Autor

Documento mestre para orientar Codex e novos desenvolvedores sobre visão do produto e decisões principais. Atualize sempre que houver mudanças relevantes.

**Lembrete final:**

- Sempre entregue versão mobile responsiva.
- Toda nova implementação sai com SEO completo.
- Atualize `AUDITORIA_COMPLETA_17_10_2025.md` conforme evolução dos itens críticos.

**Pasta raiz principal:** `C:\Projetos`  
**Documento mestre:** `C:\Projetos\README_DEV_GUIDE.md`

---

_Fim do documento._
