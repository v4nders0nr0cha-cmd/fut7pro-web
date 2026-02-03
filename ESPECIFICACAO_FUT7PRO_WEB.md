# Fut7Pro Web - Especificação Funcional (recriada)

> Documento de referência do módulo `fut7pro-web` (app.fut7pro.com.br). Esta versão foi regenerada após perda do arquivo original. Estrutura alinhada ao `README_DEV_GUIDE.md` e aos contratos já implementados no backend Nest.

## Visão Geral

- App multi-tenant: painel admin do racha + site público por `/{slug}`.
- Arquitetura: Next.js App Router (14.x), NextAuth integrado ao backend (`/auth/*` do Nest), proxies server-side para todas as rotas admin/públicas.
- Público-alvo: presidente/vice/diretores (painel), atletas (acessos restritos) e visitantes (site público).

## Nota critica - Hub admin e tenant ativo

- O acesso admin inicia em `/{slug}/admin`; o middleware reescreve para `/admin` e grava o cookie `fut7pro_active_tenant` (racha ativo).
- Existe um Hub global em `/admin/selecionar-racha`. Pos-login: 1 racha -> `/{slug}/admin`; 2+ rachas -> Hub; 0 rachas -> estado vazio.
- O backend valida membership admin e ciclo do plano para qualquer rota admin por slug (nao confiar no front). Se bloqueado, permitir apenas `/admin/status-assinatura` (ou `/{slug}/admin/status-assinatura`).
- Resolver `tenantSlug`/`tenantId` pelo cookie ou `/api/admin/access` e setar no `RachaContext`; evitar fallback para `rachaConfig.slug` no admin ao chamar endpoints publicos.
- Se o slug ativo nao existir/expirar, redirecionar para o Hub e impedir acoes sensiveis.

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

Sua varredura para localizar mocks e resíduos no projeto (arquivos de mock, strings contendo "mock", dados estáticos em páginas públicas, componentes de personalização que só usam useState com valores fixos) e outras possíveis falhas que impedem o C:\Projetos\fut7pro-web (app) de ficar pronto para venda deve seguir esta ordem:

Primeiro diretório a analisar (site público dos rachas)

Caminho: C:\Projetos\fut7pro-web\src\app\(public)

Aqui ficam todas as páginas e subpáginas públicas do site de cada racha.

Segundo diretório a analisar (painel admin dos rachas)

Caminho: C:\Projetos\fut7pro-web\src\app\(admin)

Este é o painel administrativo usado pelos administradores de cada racha.

Terceiro diretório a analisar (painel superadmin do dono do Fut7Pro)

Caminho: C:\Projetos\fut7pro-web\src\app\(superadmin)

Este é o painel administrativo do dono do sistema Fut7Pro, que recebe e consolida os dados dos paineis administrativos dos rachas.

Em cada um desses diretórios, você deve:

Encontrar arquivos de mock e pastas com nomes como mock, mocks, fixtures ou semelhantes.

Encontrar qualquer uso de strings contendo "mock" em código, comentários ou textos.

Identificar dados estáticos “hardcoded” usados como se fossem respostas de API (arrays/objetos grandes diretamente nas páginas e componentes).

Identificar componentes que deveriam consumir o backend mas atualmente só usam useState com valores fixos para simular dados dinâmicos.

Objetivo: mapear tudo o que ainda está mockado ou estático nessas áreas e que precisa ser substituído por integração real com o backend multi-tenant, para deixar o app fut7pro-web totalmente dinâmico e pronto para venda como produto SaaS.

Recursos do cd C:\Projetos\fut7pro-web
Além de tudo já explicado no arquivo "README_DEV_GUIDE.md" tem que observar com bastante atenção este arquivo aqui, pois esta é a estrutura de como deve ficar o cd C:\Projetos\fut7pro-web (app.fut7pro.com.br), Todas estas ferramentas e estrutura o Fut7Pro tem que oferecer para o cliente poder gerenciar seu racha de futebol 7. E o sistema só pode ser considerado pronto para produção quando tudo isso estiver implementado para uso e interligado o painel admin(painel do presidente do racha) com o site público.

Módulos Principais
Cada módulo foi desenvolvido para resolver um problema específico dos rachas profissionais

Core
Sorteio Inteligente
Times equilibrados com balanceamento por ranking, posição, histórico e assiduidade.

7 modelos de ranking automáticos
Pesos por posição/partida
Anti-panelinha (evita repetições)
Ver Detalhes
Core
Rankings & Estatísticas
Métricas profissionais para gols, assistências, vitórias, % de vitórias/partida, MVPs.

Atualização em tempo real
Ranking por posição e por período
Tira-Teima (comparador de atletas)
Ver Detalhes
Engagement
Gamificação & Conquistas
Medalhas, troféus e feed de conquistas que motiva e retém jogadores.

Destaques do dia (Artilheiro/Maestro)
Metas e conquistas por assiduidade
Página pública do atleta
Ver Detalhes
Engagement
Notificações & Engajamento
Comunique jogos, prazos e conquistas de forma automática.

Lembretes e confirmações de presença
Alertas de ranking e prêmios
Mensagens configuráveis
Ver Detalhes
Monetização
Gestão de Patrocinadores
Organize planos e prove valor com visitas e cliques no painel.

Logos clicáveis (UTM) e página de patrocinadores
Registro de entregas (posts/destaques/banners)
Relatório 1 página para o patrocinador
Ver Detalhes
Core
Gestão Financeira
Transparência pública ou privada e relatórios por período.

Entradas/saídas por categoria
Comprovantes anexados
Exportação CSV/PDF
Ver Detalhes
Enterprise
Multi-Admin & Auditoria
Hierarquia e segurança de nível profissional.

Presidente, VP, Diretores com permissões
Logs de auditoria (quem fez o quê)
Controle de acesso granular
Ver Detalhes
Enterprise
Multi-Rachas & Multi-Local
Administre vários rachas ou unidades no mesmo painel.

Configurações por racha/local
Calendários independentes
Relatórios consolidados
Ver Detalhes
Core
Mobile-Ready & PWA
Acesse diretamente pelo link do site do racha, sem baixar app.

Site responsivo otimizado para mobile
Funcionalidades touch-friendly
Performance rápida em qualquer conexão
Ver Detalhes
Analytics
Relatórios & Exportações
Dados acessíveis para decisão e prestação de contas.

KPIs do racha e dos patrocinadores
Exportação para PDF/CSV
Filtros por período/evento
Ver Detalhes
Enterprise
Segurança & Confiabilidade
Infra e práticas de SaaS escalável.

Multi-tenant com isolamento lógico
TLS/HTTPS, backups automáticos
LGPD-ready: dados mínimos e transparência
Ver Detalhes
Developer
Integrações & APIs
Conecte com suas ferramentas favoritas e automatize fluxos.

Webhooks para notificações
API REST para desenvolvedores
Integração com WhatsApp Business
Ver Detalhes
Benefícios dos Recursos do Fut7Pro
Descubra como nossos recursos transformam a gestão do seu racha

Sistema Completo
Todas as ferramentas necessárias para gerenciar seu racha profissionalmente em um só lugar.

Para Todos os Tamanhos
Da quadra da esquina ao estádio profissional, escalável para qualquer porte de racha.

Crescimento Garantido
Ferramentas que ajudam seu racha a crescer, atrair mais jogadores e gerar receita.

Foco nos Resultados
Métricas claras e relatórios que mostram exatamente como seu racha está performando.

Monetização Inteligente
Estratégias comprovadas para transformar seu racha em uma fonte de renda sustentável.

Segurança Total
Seus dados protegidos com as melhores práticas de segurança e privacidade.

DETALHES DE CADA RECURSOS:

Sorteio Inteligente
O fim do problema "2 gols sai"
com tecnologia avançada
Nosso sistema de balanceamento usa coeficientes inteligentes e 6 tipos de rankings para criar times perfeitamente equilibrados. Cada partida é competitiva e todos os jogadores se divertem igual.

Começar teste grátis – 30 dias
6 modelos de ranking
Anti-panelinha
Balanceamento automático
Acesso exclusivo para administradores do racha
Atletas e visitantes visualizam apenas os resultados dos sorteios

Como funciona o balanceamento inteligente?
Entenda a tecnologia por trás dos times perfeitamente equilibrados

Coeficientes Inteligentes
O sistema utiliza um sistema de coeficientes calculados automaticamente, com base nos rankings, posição e estrelas atribuídas pelo administrador para cada jogador.

Esses coeficientes são usados para balancear os times de maneira justa e competitiva, levando em consideração o desempenho do jogador no sistema de rankings, sua posição de jogo (ex: atacante, meia, zagueiro, goleiro) e as estrelas que o administrador atribui, refletindo o nível de habilidade do atleta.

Com isso, o sorteio é feito de forma equilibrada, criando partidas mais justas e aumentando o engajamento dos jogadores, independentemente do nível de habilidade.

💡 Por que é melhor que "2 gols sai"?
Em campos pagos com tempo limitado, o sistema antigo fazia o time pior jogar menos. Nosso sistema garante que todos joguem o mesmo tempo e tenham chances iguais de vencer.

Processo de Balanceamento
1
Análise automática do histórico
2
Cálculo dos coeficientes
3
Distribuição equilibrada
4
Times competitivos
6 Tipos de Rankings Automáticos
Cada ranking é calculado automaticamente e usado para o balanceamento inteligente

Ranking Geral
Pontuação geral baseada em todos os critérios

Ranking por Posição
Especialização por posição (goleiro, defesa, meio, ataque)

Ranking de Gols
Eficiência ofensiva e finalização

Ranking de Assistências
Criatividade e visão de jogo

Ranking de Pontuação
Sistema de pontos por ações no jogo

Ranking de Frequência
Assiduidade e compromisso com o racha

Sistema de Estrelas do Administrador
Avaliação manual que complementa os rankings automáticos para um balanceamento perfeito

Como Funcionam as Estrelas?
O administrador pode atribuir de 1 a 5 estrelas para cada jogador, considerando não apenas a habilidade técnica, mas também o condicionamento físico e aspectos psicológicos.

Este sistema de avaliação manual é fundamental para o balanceamento inteligente, especialmente nos primeiros sorteios quando ainda não há histórico suficiente de rankings automáticos.

⭐ Sistema de 1 a 5 Estrelas
⭐
⭐
⭐
⭐
⭐
Interface intuitiva onde o admin clica nas estrelas para definir a avaliação de cada jogador

Avaliação manual e personalizada
Considera habilidade, condicionamento e psicologia
Pode ser ajustada a qualquer momento
Fundamental para primeiros sorteios
Impacto no Balanceamento
🎯 Primeiros Sorteios
Quando não há histórico de rankings, as estrelas são o critério principal para equilibrar os times. O admin define quem são os jogadores mais e menos experientes.

⚖️ Ajuste Fino
Mesmo com rankings estabelecidos, as estrelas continuam influenciando o balanceamento, permitindo ajustes manuais para situações específicas.

🔄 Evolução Contínua
As estrelas podem ser atualizadas sempre que o admin perceber evolução ou queda no desempenho de um jogador.

💡 Dica Importante
Não avalie apenas pelo futebol! Considere também o compromisso, assiduidade e como o jogador contribui para a harmonia do grupo.

Sistema Anti-Panelinha
Elimine a formação de "panelinhas" e garanta rotação justa de jogadores

Proteção Automática
Evita repetição de jogadores no mesmo time
Distribuição equilibrada de talentos
Rotação automática de combinações
Histórico de composições anteriores
Algoritmo de diversificação inteligente
Rotação Inteligente
O sistema analisa o histórico de composições de times e evita repetições excessivas, garantindo que todos os jogadores tenham a oportunidade de jogar com diferentes companheiros.

Isso não só torna o jogo mais justo, mas também melhora a integração do grupo e elimina a formação de "panelinhas" que podem prejudicar a experiência de todos.

🎯 Benefício para o grupo
Todos se conhecem melhor, eliminam-se as divisões e o racha fica mais unido e competitivo.

Ajustes Manuais Pós-Sorteio
Controle total para o administrador fazer os ajustes finais que considera mais justos

Controle Total do Administrador
Mesmo com o sistema de sorteio inteligente funcionando perfeitamente, o administrador mantém total controle sobre a composição final dos times.

Após o sorteio automático, é possível fazer ajustes manuais, trocar jogadores entre times e reequilibrar conforme a percepção pessoal do que seria mais justo para o grupo.

🎯 Por que permitir ajustes manuais?
O administrador conhece melhor o grupo, sabe de situações especiais e pode considerar fatores que o algoritmo não consegue capturar.

Troca de jogadores entre times
Reequilíbrio baseado em conhecimento pessoal
Consideração de situações especiais
Flexibilidade para casos específicos
Como Funciona o Ajuste Manual
️⃣ Sorteio Inteligente
O sistema gera automaticamente times equilibrados usando rankings, estrelas e posições. Este é o ponto de partida ideal.

️⃣ Análise do Administrador
O admin analisa os times gerados e identifica possíveis melhorias baseadas no conhecimento pessoal do grupo e situações específicas.

️⃣ Ajustes Manuais
Com interface intuitiva, o admin pode arrastar e soltar jogadores entre times, fazendo os ajustes que considera necessários.

️⃣ Validação Final
Após os ajustes, o sistema valida se os times continuam equilibrados e confirma a composição final.

💡 Benefício Duplo
Combina a precisão do algoritmo com a sabedoria humana. O sistema faz o trabalho pesado, o admin faz os ajustes finais.

Benefícios do Sorteio Inteligente
Transforme a experiência do seu racha com tecnologia avançada

Acesso exclusivo para administradores
Atletas e visitantes visualizam apenas os resultados dos sorteios

Times Perfeitamente Equilibrados
Coeficientes inteligentes combinam rankings automáticos, estrelas do admin e posições para criar times com chances iguais de vitória.

Fim do "2 Gols Sai"
Sistema anti-panelinha e balanceamento automático garantem que todos joguem igual, eliminando a injustiça do sistema antigo.

6 Rankings Automáticos
Sistema completo de avaliação que aprende com cada partida, tornando o sorteio cada vez mais preciso e justo.

Controle Total do Admin
Sorteio inteligente + ajustes manuais. O sistema faz o trabalho pesado, você faz os ajustes finais.

Tecnologia que Transforma
Combinação perfeita entre inteligência artificial e controle humano

6
Tipos de Ranking
Sistema completo de avaliação
1-5
Sistema de Estrelas
Avaliação manual do admin
100%
Anti-Panelinha
Rotação inteligente automática
∞
Jogadores
Funciona com qualquer tamanho de grupo

Rankings & Estatísticas
Transforme seu racha em dados profissionais
com 7 rankings automáticos
Sistema completo de métricas que valoriza todos os jogadores: classificação dos times, ranking geral, artilheiros, assistências, melhores por posição, tira-teima e assiduidade. Tudo atualizado automaticamente.

Testar Sistema de Rankings - 30 dias grátis
7 Tipos de Rankings Automáticos
Cada ranking oferece uma perspectiva diferente do desempenho dos jogadores e times

Público
🏆 Classificação dos Times
Ranking por pontos, vitórias, empates, derrotas, gols pró/contra e saldo de gols

Atualização automática por quadrimestre
Histórico completo de temporadas
Comparação de desempenho entre equipes
Público
📋 Ranking Geral
Pontuação acumulada de todos os jogadores durante a temporada ou quadrimestre

Filtros por período (quadrimestre/ano/histórico)
Busca por nome de atleta
Evolução ao longo do tempo
Público
🎯 Artilheiros
Ranking dos atletas com mais gols marcados nas partidas

Filtros por período e temporada
Contagem de gols e jogos
Histórico completo de artilharia
Público
🅰️ Assistências
Ranking dos principais maestros: veja quem mais distribuiu assistências

Filtros por período e temporada
Contagem de assistências e jogos
Reconhecimento da criatividade
Público
💪 Melhores por Posição
Destaques por posição: atacante, meia, zagueiro e goleiro

Ranking especializado por função
Comparação entre posições similares
Valorização de cada especialidade
Público
⚖️ Tira-teima (Comparador)
Compare dois jogadores lado a lado, com base em estatísticas oficiais

Comparação detalhada de performance
Estatísticas lado a lado
Ferramenta para debates saudáveis
Admin
📊 Ranking de Assiduidade
Presença, frequência e comprometimento dos jogadores (visível apenas para administradores)

Filtros por período (mês/quadrimestre/ano)
Identificação de mensalistas
Ferramenta para premiar comprometimento
Métricas que Valorizam Todos
Diferente dos rachas tradicionais, nosso sistema valoriza todas as posições e habilidades

Gols
Contagem automática de gols marcados por partida e total acumulado

Assistências
Passes que resultaram em gols, valorizando a criatividade

Presenças
Frequência e assiduidade nas partidas oficiais

Pontuação
Ranking geral de pontos acumulados por vitórias (3 pontos) e empates (1 ponto)

MVP
Jogador destaque de cada partida, escolhido pelos companheiros

Performance
Avaliação baseada em múltiplos critérios objetivos

Como funcionam os rankings?
Entenda o sistema inteligente que calcula automaticamente todas as métricas

Cálculo Automático
Após cada partida, o administrador apenas preenche os resultados básicos: gols, assistências e presenças. O sistema calcula automaticamente todos os rankings e estatísticas.

Cada jogador recebe pontos baseados no resultado da partida e sua posição, criando um sistema justo que valoriza diferentes tipos de contribuição para o time.

💡 Por que valorizar todos?
Em rachas tradicionais, apenas atacantes são reconhecidos. Nosso sistema valoriza goleiros, defensores e meio-campistas, criando uma competição mais equilibrada.

Sistema de Pontuação Real
Vitória do Time
+3 pontos
Empate
+1 ponto
Derrota
0 pontos
Importante: Gols e assistências não geram pontos extras no ranking geral, mas são contabilizados para rankings específicos de artilharia e assistência.

Rankings por Posição
Cada posição tem seu próprio ranking, valorizando o desempenho específico de cada função

Atacantes
Ranking baseado nos pontos acumulados por vitórias (3 pontos) e empates (1 ponto) dos times em que atuaram. Como já existe o ranking de artilheiro, este ranking valoriza a contribuição geral para o sucesso da equipe.

Meias
Ranking baseado nos pontos acumulados por vitórias e empates dos times em que atuaram. Como já existe o ranking de assistências, este ranking reconhece o meio-campista que mais contribuiu para o sucesso coletivo.

Zagueiros
Ranking baseado nos pontos acumulados por vitórias e empates dos times em que atuaram. Como é difícil contabilizar desarmes e defesas, este ranking valoriza a contribuição defensiva para o sucesso da equipe.

🧤
Goleiros
Ranking baseado nos pontos acumulados por vitórias e empates dos times em que atuaram. Como é praticamente impossível contabilizar defesas em rachas, este ranking reconhece o goleiro que mais contribuiu para o sucesso defensivo.

Como Funcionam os Rankings por Posição?
🏆 Competição Especializada
•
Cada posição tem seu próprio ranking independente
•
Jogadores competem apenas com outros da mesma função
•
Valorização específica para cada especialidade
📊 Filtros Disponíveis
•
1º, 2º e 3º Quadrimestre
•
Temporada Atual
•
Histórico Completo
🎯 Objetivo dos Rankings por Posição
Criar uma competição justa onde cada jogador pode se destacar em sua especialidade, independentemente de ser atacante, meia, zagueiro ou goleiro. Isso motiva todos os tipos de jogadores e cria uma disputa saudável por posições.

Como Funcionam na Prática?
⚽ Baseados em Pontuação
Como é praticamente impossível anotar defesas de goleiros, desarmes de zagueiros e outras estatísticas específicas em rachas, todos os rankings por posição são baseados nos pontos de vitórias (3 pontos) e empates (1 ponto).

Isso garante que todos os jogadores tenham a mesma oportunidade de pontuar, independentemente da posição que ocupam.

🎯 Democratização do Sistema
Com rankings específicos por posição, evitamos que apenas um jogador se destaque em tudo. Cada posição tem sua própria competição, valorizando diferentes tipos de contribuição para o time.

Atacantes, meias, zagueiros e goleiros podem se destacar em suas especialidades sem competir diretamente entre si.

💡 Vantagens para Administração
Menos trabalho: Não é necessário anotar estatísticas complexas como defesas ou desarmes. Registre o essencial (gols, assistências e resultado) e o sistema calcula automaticamente tudo baseado apenas nos resultados das partidas.

Mais justiça: Todos os jogadores são valorizados igualmente, criando um ambiente mais competitivo e motivador para o racha.

Benefícios dos Rankings
Transforme a experiência do seu racha com dados profissionais

Evolução Constante
Jogadores veem seu progresso e se motivam a melhorar a cada partida

Competitividade Saudável
Rankings criam disputa saudável por posições e reconhecimento

Reconhecimento Justo
Cada jogador é valorizado por suas qualidades e contribuições

Engajamento Alto
Aumenta a participação e assiduidade através da gamificação

Histórico Completo
Acompanhe a evolução do racha ao longo de todas as temporadas

Transparência Total
Todos os dados são públicos e atualizados automaticamente

Gamificação & Conquistas
Transforme seu racha em uma competição épica
com medalhas e troféus
Quando existe algo em jogo, mesmo que seja um ícone no perfil, o atleta entra diferente. Troféus 🏆, medalhas 🥇, bolas de ouro ⚽ e outros dão meta clara, progressão visível e status social.

Testar Sistema de Conquistas - 30 dias grátis
Por que a Gamificação Funciona?
Psicologicamente, o sistema ativa mecanismos poderosos de motivação

Reforço Imediato
Cada vitória gera recompensa e o atleta busca repetir

Pertencimento
Reconhecimento público sustenta o hábito

Aversão à Perda
Ninguém quer cair no ranking nem perder a sequência

Colecionabilidade
Novos ícones viram objetivos constantes

Comparação Saudável
Perfis melhores viram referência e motivação

Resultado Prático
A assiduidade sobe e a galera evita faltar

🏆 Conquistas Anuais
As maiores honrarias concedidas ao final de cada temporada

🏆 Melhor do Ano
Maior pontuação geral acumulada na temporada

Anual
⚽ Artilheiro do Ano
Maior número de gols marcados na temporada

Anual
🥇 Maestro do Ano
Maior número de assistências na temporada

Anual
🏆 Campeão do Ano
Time com maior pontuação na classificação

Anual
🥇 Conquistas por Posição
Cada posição tem sua própria competição, valorizando diferentes tipos de contribuição

🏆 Atacante do Ano
Melhor atacante baseado em pontuação geral

Anual
🏆 Meia do Ano
Melhor meio-campista baseado em pontuação geral

Anual
🏆 Zagueiro do Ano
Melhor defensor baseado em pontuação geral

Anual
🏆 Goleiro do Ano
Melhor goleiro baseado em pontuação geral

Anual
📅 Conquistas Quadrimestrais
Premiações a cada 4 meses mantendo a motivação constante

🏆 Melhor do Quadrimestre
Maior pontuação no período de 4 meses

Quadrimestral
⚽ Artilheiro
Maior número de gols no quadrimestre

Quadrimestral
🥇 Maestro
Maior número de assistências no quadrimestre

Quadrimestral
🏆 Campeão do Quadrimestre
Time com maior pontuação no período

Quadrimestral
🔁 Níveis de Assiduidade
Evolua de Novato a Lenda através da frequência nas partidas

🎓
Novato
3-9 jogos

3-9 jogos
🔄
Juvenil
10-19 jogos

10-19 jogos
🧢
Titular
20-49 jogos

20-49 jogos
✨
Destaque
50-99 jogos

50-99 jogos
🦾
Veterano
100-199 jogos

100-199 jogos
🐐
Lenda
200+ jogos

200+ jogos
Como Funciona no Fut7Pro
Sistema simples e automático que funciona com o que você já registra

Registro Simples
Você registra apenas gols, assistências e o resultado da partida. O sistema calcula automaticamente todos os rankings e conquistas baseado nos pontos de vitória (3 pontos), empate (1 ponto) e derrota (0 pontos).

Gols e assistências alimentam seus próprios rankings específicos, enquanto a pontuação geral determina as conquistas de melhor jogador e por posição.

💡 Sistema Automático
Ao fechar quadrimestres e a temporada, o sistema aplica automaticamente 🏆 campeões, 🥇 melhores e ⚽ artilheiros nos perfis dos jogadores.

Feed de Conquistas
Cada conquista aparece para todos
Notificações automáticas
Reforça o prestígio
Evolução por presença
Perfil do Jogador com Conquistas
Cada jogador tem um perfil único com toda sua história de conquistas e evolução

Histórico Completo
O perfil de cada jogador mostra todas as conquistas, medalhas e troféus conquistados ao longo do tempo. É uma verdadeira história de dedicação e superação.

Além das conquistas, o perfil inclui estatísticas detalhadas, evolução ao longo do tempo e comparação com outros jogadores através do sistema "Tira-teima".

🏆 Sistema Tira-teima
Compare estatísticas entre jogadores e acabe com as discussões de quem é melhor. Os números não mentem!

O que o perfil inclui:
Histórico completo de conquistas e medalhas
Nível de assiduidade com emblemas visuais
Estatísticas detalhadas por temporada
Evolução ao longo do tempo
Comparação com outros jogadores
Sistema Tira-teima automático
Rankings específicos por posição
Conquistas quadrimestrais e anuais
Benefícios da Gamificação
Transforme a experiência do seu racha com elementos de jogo

Motivação Constante
Jogadores se esforçam para conquistar medalhas e subir de nível

Engajamento
Aumenta a participação e assiduidade nas partidas

Reconhecimento
Cada conquista é uma história para contar e compartilhar

Competitividade
Cria disputas saudáveis por posições e rankings

Status Social
Perfis com mais conquistas ganham prestígio no racha

Progressão Visível
Evolução clara através de níveis e medalhas

Comunique jogos, prazos e conquistas(de forma automática)

Sistema completo de notificações, comunicados e sugestões que mantém seu racha sempre informado e engajado. Lembretes automáticos, confirmações de presença e comunicação em tempo real.

Testar Sistema de Notificações - 30 dias grátis
Sistema Completo de Notificações
6 tipos de notificações para cobrir todas as necessidades de comunicação do seu racha

Sistema
Notificações automáticas do sistema

Manutenção programada
Atualizações do sistema
Alertas de segurança
SuperAdmin
Comunicados de nível global

Manutenções globais
Novas funcionalidades
Alertas importantes
Mensagem
Comunicação direta entre usuários

Chat entre jogadores
Mensagens privadas
Comentários
Pendência
Alertas sobre tarefas pendentes

Confirmação de presença
Pagamento pendente
Documentos vencidos
Financeiro
Notificações relacionadas a pagamentos

Boleto disponível
Pagamento confirmado
Vencimento próximo
Novidade
Informações sobre atualizações

Nova funcionalidade
Melhorias no sistema
Dicas de uso
Controle Total de Solicitações
Sistema de aprovação manual que garante que apenas atletas aprovados entrem no seu racha

Solicitações de Atletas
Controle total sobre quem entra no racha

Cadastro de novos atletas
Aprovação manual obrigatória
Notificações automáticas para admin
Sistema de Aprovação
Segurança e controle de qualidade

Admin recebe notificação imediata
Botões de aprovar/rejeitar
Histórico de solicitações
Notificações Inteligentes
Nunca perca uma solicitação

Alertas em tempo real
Dashboard de pendências
Lembretes automáticos
Como Funciona o Sistema de Aprovação
Cadastro de Atletas
Quando um novo atleta se cadastra no sistema, ele NÃO é automaticamente adicionado ao racha. Em vez disso, o sistema gera uma notificação para o administrador.

Aprovação Manual
O administrador recebe uma notificação com os dados do atleta e pode escolher entre aprovar ou rejeitar a solicitação.

🚨 Notificação Automática para o Administrador
Assunto: "Nova solicitação de atleta para o racha"
Conteúdo: Nome, email e informações do atleta solicitante
Ações: Botões para "Aprovar" ou "Rejeitar" diretamente na notificação
Dashboard: Lista de todas as solicitações pendentes para aprovação
Sistema de Comunicados
Organize e distribua informações importantes de forma estruturada

Comunicados Gerais
Anúncios para todos os usuários do tenant

Atualizações do sistema
Regras e regulamentos
Informações importantes
Comunicados por Racha
Mensagens específicas para um racha

Regras do racha
Eventos especiais
Mudanças de horário
Gestão de Eventos
Comunicação sobre eventos e partidas

Lembretes de jogos
Confirmações de presença
Mudanças de local
Sistema de Sugestões
Permita que seus jogadores contribuam para a melhoria do racha

Sistema de Sugestões
Permite que jogadores enviem ideias

Formulário de sugestão
Status de acompanhamento
Resposta da administração
Workflow de Aprovação
Processo estruturado para análise

Status: Pendente, Respondida, Recusada
Resposta detalhada
Histórico de sugestões
Analytics de Engajamento
Métricas sobre participação

Quantidade de sugestões
Taxa de resposta
Tempo médio de resposta
Benefícios Reais
Resultados mensuráveis que transformam a comunicação do seu racha

Redução de 80%
no tempo gasto com comunicação manual

3x mais engajamento
dos jogadores com notificações automáticas

95% de confirmações
de presença com lembretes automáticos

100% de cobertura
todos os jogadores recebem as informações

Melhoria contínua
através do sistema de sugestões

Comunicação transparente
com comunicados organizados

Controle total
sobre quem entra no seu racha

Qualidade garantida
apenas atletas aprovados

Sistema de Patrocínios
Gerencie até 10 patrocinadores
e transforme seu racha em negócio
Sistema completo para gerenciar patrocínios com diferentes níveis de investimento, benefícios personalizados e controle financeiro. Transforme seu racha em uma marca lucrativa.

Testar Sistema de Patrocínios - 30 dias grátis
Planos de Patrocínio (Modelo Sugerido)
Valores mínimos praticados em cidades menores. Em capitais e grandes centros, ajuste para cima conforme alcance, organização do racha e mercado local.

Básico
R$ 30/mês
R$ 250/ano
Logo no rodapé do site do racha (carrossel de até 10 patrocinadores)

Logo na página exclusiva de patrocinadores

Link clicável do logo para rede social/WhatsApp do patrocinador

Divulgação garantida para X pessoas das redes do racha

Extras sugeridos: menção mensal nos stories; cupom de desconto exclusivo para atletas
Plus
R$ 60/mês
R$ 550/ano
Tudo do Básico, mais:

Logo do patrocinador nos Destaques do Instagram do racha

Marca no pré-jogo: logotipo no banner oficial das fotos dos times

Logo nas fotos do "melhor time" (stories e feed)

Logo nas fotos de jogadores destaques (stories e feed)

Extras sugeridos: 1 sorteio bimestral de brinde do patrocinador; QR Code do patrocinador nos banners digitais
Pro
R$ 80/mês
R$ 750/ano
PLANO LIMITADO A X PATROCINADORES
Tudo dos planos anteriores, mais:

🥇 Uniforme/Colete com logo exclusiva do patrocinador na parte da frente

🥇 Logo nas costas de todos os uniformes/coletes do racha

🥇 Destaque de posição na página de patrocinadores (entre os primeiros)

🥇 Brindes personalizados com a marca do patrocinador para eventos/ações com atletas

Extras sugeridos: "Patrocinador do Jogador do Dia/Artilheiro do Dia"; naming de torneio/quadrimestre (ex.: Copa [Marca])
Observações importantes
Valores e benefícios são 100% opcionais e sugestivos. Ajuste conforme o porte do racha, tamanho da cidade, alcance real das redes e demanda local.

Ao adquirir o Fut7Pro, no painel administrativo (card Monetização) estará disponível para download um arquivo PSD editável com estes planos. É prático e rápido: basta adicionar/remover benefícios e alterar os valores se desejar.

Funcionalidades do Sistema
Tudo que você precisa para gerenciar patrocínios profissionalmente

Gestão de Patrocinadores
Controle até 10 patrocinadores simultaneamente

Cadastro completo com logo, descrição e link
Controle de visibilidade no site público
Status ativo/inativo/encerrado
Histórico de alterações
Controle Financeiro
Acompanhe pagamentos e receitas dos patrocínios

Valor mensal/anual configurável
Período de vigência (início e fim)
Comprovantes de pagamento anexados
Observações e notas
Visibilidade Pública
Controle total sobre exibição no site

Toggle para mostrar/ocultar patrocinador
Rodapé do site com carrossel de logos
Página exclusiva de patrocinadores
Links clicáveis para redes sociais
Métricas e ROI
Demonstre o retorno do investimento

Visitas ao site do racha
Cliques nos logos dos patrocinadores
Relatórios mensais automáticos
Exportação para PDF
Relatórios Automáticos
Prestação de contas profissional

Relatório mensal para patrocinadores
Métricas de engajamento
Ações entregues no período
Próximos passos e sugestões
Gestão de Períodos
Controle de vigência e renovação

Data de início e fim configurável
Alertas de vencimento próximo
Renovação automática opcional
Histórico de períodos
Caso Real de Sucesso
Do Racha para o Negócio: A Jornada do Real Matismo Fut7
Conheça como Rennan Melo transformou seu racha em uma marca reconhecida e lucrativa aplicando exatamente as estratégias que você acabou de ver

Rennan Melo - Administrador do Real Matismo Fut7
Rennan Melo
Administrador do Real Matismo Fut7

@@renanmelo96
"Comecei como qualquer administrador: organizando jogos entre amigos. Mas quando conheci o Fut7Pro, vi uma oportunidade de transformar nosso racha em algo profissional."

Resultados em 7 meses com o Fut7Pro
• 10 patrocinadores ativos: 4 Pro, 5 Plus e 1 Básico
• Receita recorrente: R$ 650/mês só com patrocínios
• Racha valorizado e mais organizado (padrões, calendário, prestação de contas)
• Uniformes e coletes com logos (frente e costas) em uso contínuo
• Jogadores satisfeitos e engajados (disputa, estatísticas e histórico salvo)
"Dicas rápidas para escalar: Limite de vagas no Pro, Contrato simples de 12 meses, Relatório mensal ao patrocinador, Mídia kit com números e Cupons exclusivos para atletas, Naming de quadrimestre/torneio, QR Code nos banners."

@@realmatismoracha
Siga o racha no Instagram
Aplicação Prática dos Planos Premium:
Logo exclusiva na frente do colete
Logo exclusiva na frente do colete

Logo nas costas dos uniformes
Logo nas costas dos uniformes

Time com uniformes personalizados
Time com uniformes personalizados

Detalhe da aplicação do logo
Detalhe da aplicação do logo

ROI e Estratégias de Venda
Aprenda como vender patrocínios e demonstrar o retorno do investimento

Estratégias de Venda
1
Apresente como "estilo Kings League": racha moderno, organizado, com estatísticas e vitrine para marcas

2
Teste gratuito de 30 dias: mostre valor antes de qualquer ajuste de preço

3
Métricas do painel Fut7Pro: prove alcance com visitas às páginas, cliques nos logos e engajamento

4
Transparência: a plataforma é financiada por patrocínios, não pelos jogadores

5
Planos (Básico/Plus/Pro) com vagas limitadas no Pro e benefícios claros por canal

6
Prova social no site: rodapé + página de patrocinadores com logos clicáveis

7
Combo de mídia: site (métricas) + Instagram (destaques/feed/stories) + QR Code em banners

8
Negocie com o campo: desconto/mensalidade em troca de divulgação permanente

9
Relatório mensal ao patrocinador: exporte PDF com visitas, cliques e ações entregues

10
Ativações que convertem: "Patrocinador do Jogador do Dia" e naming de torneios

Exemplo de ROI
Empresa local com 10.000 seguidores
Racha com 50 jogadores ativos
50 partidas por mês = 50 menções
Visibilidade para 2.500 pessoas/mês
Custo por visualização: R$ 0,012
ROI superior a qualquer mídia tradicional
💡 ROI superior a qualquer mídia tradicional!

Benefícios dos Patrocínios
Transforme seu racha em uma fonte de receita sustentável

Receita Recorrente
Gere receita mensal estável com patrocínios

Jogadores Não Pagam
O sistema se paga sozinho através dos patrocinadores

Valorização do Racha
Transforme seu racha em uma marca reconhecida

Crescimento Sustentável
Expanda seu racha com recursos dos patrocinadores

Controle Total
Decida valores, prazos e condições dos patrocínios

Qualidade Garantida
Apenas patrocinadores aprovados e ativos

Gestão Financeira
Controle total das finanças do racha
com prestação de contas profissional
Sistema completo de gestão financeira com controle de receitas, gestão de jogadores, relatórios detalhados e prestação de contas transparente ou privada, conforme sua preferência.

Testar Gestão Financeira - 30 dias grátis
Funcionalidades do Sistema
Controle completo e profissional das finanças do seu racha

Controle de Receitas e Despesas
Registro completo de todas as movimentações financeiras

Receitas: mensalidades, patrocínios, eventos
Despesas: campo, material, premiações, multas
Valores positivos e negativos automáticos
Data, categoria e descrição detalhada
Categorização Automática
Organize transações por tipos específicos

Campo: aluguel, manutenção, equipamentos
Material: bolas, redes, coletes, uniformes
Diárias: arbitragem, organização
Multa: atrasos, faltas, indisciplina
Premiação: troféus, medalhas, brindes
Evento: torneios, festas, confraternizações
Outros: despesas diversas
Filtros Avançados por Período
Visualize dados por diferentes intervalos de tempo

Filtro por mês específico (Janeiro a Dezembro)
Filtro por quadrimestre (1º, 2º, 3º)
Filtro por ano completo (2023, 2024, 2025)
Opção "Todos os Anos" para histórico completo
Combinação de filtros para análises precisas
Resumo Financeiro em Tempo Real
Visão instantânea da situação financeira

Receitas totais do período selecionado
Despesas totais do período selecionado
Saldo atual (receitas - despesas)
Atualização automática com filtros
Cálculos precisos e confiáveis
Gráfico de Evolução Financeira
Acompanhe a evolução do saldo ao longo do tempo

Gráfico de linha com saldo acumulado
Eixo X: meses do período selecionado
Eixo Y: valores em reais
Visualização clara da tendência financeira
Identificação de padrões e sazonalidades
Controle de Visibilidade Pública
Decida o que os jogadores podem ver

Toggle para mostrar/ocultar no site público
Transparência total ou privada
Controle granular de acesso
Segurança para informações sensíveis
Flexibilidade conforme necessidade do racha
Categorias Financeiras
Organização automática e inteligente de todas as transações

Receitas
Mensalidade dos jogadores
Patrocínios de empresas
Inscrições em torneios
Venda de uniformes/coletes
Doações e contribuições
Despesas
Aluguel do campo
Compra de material esportivo
Arbitragem das partidas
Premiações e troféus
Manutenção de equipamentos
Filtros e Análise por Período
Visualize dados financeiros com precisão temporal

Filtro por Mês
Selecione um mês específico para análise detalhada

Janeiro a Dezembro
Análise mensal precisa
Comparação entre meses
Filtro por Quadrimestre
Agrupe dados em períodos de 4 meses

1º, 2º e 3º quadrimestres
Análise sazonal
Planejamento trimestral
Filtro por Ano
Visão anual completa com histórico

2023, 2024, 2025
Evolução anual
Comparação entre anos
Todos os Anos
Ative esta opção para visualizar todo o histórico financeiro do racha desde o início

Histórico Completo Disponível
Controle de Visibilidade Pública
Escolha o nível de transparência que melhor se adapta ao seu racha

Transparente
Todos os jogadores veem todas as movimentações

Confiança total
Elimina desconfianças
Transparência completa
Privada
Apenas administradores veem as movimentações

Controle interno
Flexibilidade
Gestão estratégica
Seletiva
Algumas informações são públicas, outras privadas

Equilíbrio entre transparência e controle
Personalização
Segurança
Recursos Avançados
Funcionalidades que tornam a gestão financeira ainda mais profissional

Exportação de Dados
Relatórios em PDF para prestação de contas

Histórico Completo
Todas as movimentações desde o início

Análise por Categoria
Distribuição de receitas e despesas

Tendências Financeiras
Identificação de padrões ao longo do tempo

Benefícios da Prestação de Contas
Transforme a administração financeira do seu racha

Transparência Total
Jogadores veem exatamente onde o dinheiro é gasto

Controle Profissional
Gestão financeira como em grandes organizações

Confiança dos Jogadores
Elimina desconfianças sobre uso do dinheiro

Eficiência Operacional
Reduz trabalho manual e organiza processos

Tomada de Decisão
Base sólida para planejamento financeiro

Prestação de Contas
Relatórios profissionais para transparência

Hierarquia e segurança de nível profissional
Controle total com auditoria completa
Sistema de controle de acesso empresarial com 4 níveis de hierarquia, logs de auditoria completos e segurança de nível corporativo.

Testar Multi-Admin - 30 dias grátis
Níveis de Acesso
Hierarquia profissional com permissões específicas para cada função

Presidente
Acesso total ao sistema com controle de todos os módulos.

Criar e gerenciar administradores
Configurações do sistema
Relatórios financeiros completos
Gestão de patrocinadores
Transferir propriedade do racha
Acesso a todos os logs e auditoria
Vice-Presidente
Acesso amplo com algumas restrições de segurança.

Gestão de jogadores e times
Configurações de partidas
Relatórios de performance
Gestão de rankings
Acesso a logs de sistema
Sem transferência de propriedade
Diretor de Futebol
Foco em operações esportivas e competitivas.

Gestão de partidas e torneios
Configurações de sorteio
Estatísticas e rankings
Gestão de presenças
Acesso a logs de sistema
Sem gestão de administradores
Diretor Financeiro
Controle total sobre finanças e prestação de contas.

Gestão financeira completa
Relatórios e exportações
Controle de receitas/despesas
Prestação de contas
Acesso a logs financeiros
Sem gestão de partidas
Sistema de Permissões
Controle granular por funcionalidade e módulo

Gestão de Rachas
RACHA_CREATE - Criar novos rachas
RACHA_READ - Visualizar rachas
RACHA_UPDATE - Editar configurações
RACHA_DELETE - Excluir rachas
RACHA_MANAGE_ADMINS - Gerenciar administradores
Gestão de Usuários
USER_CREATE - Criar usuários
USER_READ - Visualizar usuários
USER_UPDATE - Editar usuários
USER_DELETE - Excluir usuários
USER_MANAGE_ROLES - Gerenciar roles
Gestão Financeira
FINANCE_READ - Visualizar finanças
FINANCE_CREATE - Criar lançamentos
FINANCE_UPDATE - Editar lançamentos
FINANCE_DELETE - Excluir lançamentos
FINANCE_APPROVE - Aprovar transações
Analytics e Relatórios
ANALYTICS_READ - Visualizar analytics
REPORTS_GENERATE - Gerar relatórios
AUDIT_READ - Visualizar auditoria
AUDIT_CREATE - Criar logs de auditoria
AUDIT_EXPORT - Exportar logs
Recursos de Auditoria
Sistema completo de auditoria e compliance para seu racha

Logs de Auditoria
Registro completo de todas as ações realizadas no sistema.

Quem fez o quê e quando
IP de origem e dispositivo
Dados antes e depois das mudanças
Histórico completo de ações
Controle de Acesso
Permissões granulares por módulo e funcionalidade.

Permissões por módulo específico
Controle de acesso por cargo
Hierarquia de permissões
Restrições por funcionalidade
Sistema de Logs
Rastreamento completo de todas as atividades administrativas.

Logs de criação de partidas
Logs de exclusão de rankings
Logs de transferência de propriedade
Logs de gestão de atletas
Relatórios de Segurança
Métricas e alertas de segurança em tempo real.

Atividades administrativas
Mudanças críticas no sistema
Relatórios de auditoria
Histórico de ações
Exemplo de Logs de Auditoria
Veja como o sistema registra todas as ações administrativas

Criou nova partida
15/06/2025 14:22
Admin: João Silva (Presidente)
Detalhes: Partida #123 - Time A vs Time B
Removeu ranking
14/06/2025 10:03
Admin: Maria Santos (Vice-Presidente)
Detalhes: Ranking de artilheiros - período inválido
Transferiu propriedade
13/06/2025 19:41
Admin: Carlos Lima (Presidente)
Detalhes: Racha transferido para Pedro Costa
Adicionou administrador
13/06/2025 08:09
Admin: Ana Oliveira (Presidente)
Detalhes: Novo admin: Roberto Silva como Diretor Financeiro
Benefícios da Segurança
Proteção e controle de nível empresarial para seu racha

100% de Rastreabilidade
Todas as ações são registradas e auditáveis

4 Níveis de Acesso
Hierarquia profissional e organizada

Segurança Empresarial
Padrões de segurança de nível corporativo

Controle Granular
Permissões específicas por funcionalidade

Controle Total e Segurança do Cargo
Como presidente, você terá a "chave na mão" do seu racha

Poder Absoluto do Presidente
Apenas você, como presidente, tem acesso total ao sistema, incluindo:

Transferir ou excluir o racha - controle total sobre a propriedade
Excluir outros administradores - gestão completa da equipe
Configurações do sistema - personalização total
Logs de auditoria - visibilidade completa de todas as ações
Segurança do Cargo Principal
Com um site bem organizado e dados que dependem de você para continuar existindo, você terá a "chave na mão".

🛡️ Isso garante que muitos evitem tentar derrubá-lo do cargo principal, como acontece em vários rachas tradicionais.

Resultado: Seu cargo fica protegido pela dependência do sistema e pela organização profissional que você implementou.

Controle Total = Cargo Seguro

Multi‑Horários do Racha
Cadastre todos os dias e horários em que o seu racha acontece. Uma conta pode administrar multiplos rachas, mas cada racha tem cadastro, assinatura e agenda proprios. Para outro racha, crie um novo cadastro de racha usando a mesma conta.

Testar Multi‑Horários
Ver Demonstração
Casos de uso
Situações comuns de rachas com múltiplos dias e horários

Vários dias na semana
Cadastre todos os dias em que o racha acontece.

Sábado, quarta, sexta… você escolhe
Cálculo automático dos próximos jogos
Ajuste rápido a qualquer momento
Sem limite de dias
Múltiplos horários por dia
Suporte a mais de um horário no mesmo dia.

Manhã, tarde e noite
Partidas consecutivas
Separação por quadra/campo
Sem confusão no calendário
Temporadas e pausas
Organize períodos específicos e pausas programadas.

Pausas de férias
Retomada automática
Datas especiais
Histórico preservado
Vinculo por racha (conta global)
Cada racha tem seu proprio cadastro e assinatura, mesmo com um unico usuario admin.

Evita revenda de acessos
Identidade (nome e logo) por racha
Gestão financeira independente
Para outro racha, crie novo cadastro de racha (mesma conta)
Funcionalidades principais
Tudo que você precisa para organizar dias e horários no mesmo racha

Configurações do racha
Tudo em um só cadastro: nome, logo e horários.

Vários dias e horários
Regras do sorteio
Preferências de ranking
Notificações e lembretes
Próximos rachas automáticos
A lista de próximos jogos é calculada a partir dos dias fixos.

Sem planilhas
Atualiza ao editar horários
Visualização clara para o time
Integra com presença
Alertas de feriados
O sistema avisa quando um jogo cai em feriado para você decidir.

Feriados nacionais/estaduais/municipais
Indicador na página de horários
Opção de remarcar
Histórico do ajuste
Gestão simples e correta
Cobrança e bloqueio sao por racha; o acesso admin e sempre escopado ao racha ativo.

Cada racha tem seu próprio acesso
Assinatura independente
Relatórios por racha
Evita compartilhamento indevido
Benefícios
Cresça seu racha mantendo controle e clareza de agenda

Gestão unificada
Todos os horários do racha em um só lugar.

Menos erros
Agenda clara reduz conflitos e confusões.

Mais previsibilidade
Comunicação e presença melhoram com calendário consistente.

Operação correta
Cobrança por racha evita revenda e separa finanças, sem misturar dados entre rachas.

Acesse diretamente pelo link do seu racha
Sem baixar app
sem complicações
O Fut7Pro funciona perfeitamente no celular através do navegador. Site responsivo, funcionalidades touch-friendly e performance otimizada para qualquer conexão.

Testar Sistema Mobile - 30 dias grátis
Como Funciona no Mobile
Acesse diretamente pelo link do seu racha, sem complicações

Acesso Direto pelo Site
Não precisa baixar app - acesse diretamente pelo link do seu racha.

URL direta do site do racha
Funciona em qualquer navegador
Sem instalação ou atualizações
Acesso instantâneo
Design Responsivo Completo
Interface adaptada para todos os tamanhos de tela.

Mobile-first design
Breakpoints otimizados (320px - 768px)
Layout adaptativo automático
Navegação touch-friendly
Performance Otimizada
Carregamento rápido mesmo em conexões lentas.

Lazy loading de imagens
Cache inteligente
Compressão automática
Core Web Vitals otimizados
Funcionalidades Touch
Todas as funcionalidades adaptadas para dispositivos móveis.

Botões otimizados para toque
Gestos de navegação
Inputs mobile-friendly
Scroll suave e responsivo
Funcionalidades Mobile
Tudo que você precisa para gerenciar seu racha pelo celular

Registro de Partidas
Registre resultados e fotos diretamente do celular durante o jogo

Upload de fotos em tempo real
Registro de placar na hora
Estatísticas instantâneas
Compartilhamento imediato
Consulta de Rankings
Acompanhe estatísticas e posições em qualquer lugar

Rankings em tempo real
Estatísticas por jogador
Histórico de partidas
Comparações lado a lado
Gestão Administrativa
Gerencie seu racha de qualquer lugar

Painel admin responsivo
Gestão de jogadores
Configurações do sistema
Relatórios mobile-friendly
Comunicação
Mantenha todos informados via mobile

Notificações push
Comunicados em tempo real
Confirmações de presença
Chat integrado
Tecnologia Mobile-First
Desenvolvido com as melhores práticas para dispositivos móveis

Mobile-First Design
Desenvolvido pensando primeiro na experiência mobile

Breakpoints: 320px - 768px - 1024px+
Grid responsivo adaptativo
Typography escalável
Spacing adaptativo
Performance Otimizada
Carregamento rápido e eficiência energética

Lazy loading inteligente
Cache estratégico
Bundle splitting
Core Web Vitals otimizados
Touch-Friendly
Interface otimizada para dispositivos touch

Botões com tamanho adequado (44px+)
Gestos de navegação
Scroll suave
Feedback visual imediato
Vantagens do Acesso Mobile
Por que acessar pelo site é melhor que baixar um app

Sem Instalação
Acesse instantaneamente pelo navegador

Universal
Funciona em qualquer dispositivo

Sempre Atualizado
Versão mais recente automaticamente

Responsivo
Adapta-se a qualquer tela

Como Acessar no Mobile
É simples: apenas acesse o link do seu racha no celular

1
Abra o navegador do seu celular
2
Digite o link do seu racha (ex: meuracha.fut7pro.com)
3
Pronto! Use todas as funcionalidades
💡 Dica: Salve o link na tela inicial para acesso rápido!

Em breve: app iOS e Android
O Fut7Pro continuara 100% acessivel pelo navegador (mobile-ready) e, no futuro, tambem contara com aplicativo nativo para iOS e Android. Quando o app chegar, o comprador e os membros do racha poderao acessar por onde preferirem: web ou app.

Dados acessíveis para decisão e prestação de contas
KPIs do racha e dos patrocinadores, exportação para PDF/CSV, filtros por período/evento. Transforme dados em decisões estratégicas para seu racha.

Testar Sistema de Relatórios - 30 dias grátis
Tipos de Relatórios
Relatórios especializados para cada área do seu racha

Relatórios de Engajamento
Métricas de acessos, jogadores e tempo de sessão.

Acessos ao sistema por período
Jogadores únicos ativos
Tempo médio de sessão
Engajamento por funcionalidade
PDF
CSV
Relatórios de Performance
Estatísticas de jogadores, rankings e conquistas.

Rankings por posição e período
Estatísticas de gols e assistências
Histórico de presenças
Evolução de performance
PDF
CSV
XLSX
Relatórios Financeiros
Controle de receitas, despesas e patrocínios.

Receitas e despesas por categoria
Relatórios de patrocínios
Prestação de contas
Análise de fluxo de caixa
PDF
CSV
XLSX
Relatórios de Patrocínios
Métricas de visitas, cliques e ROI para patrocinadores.

Visitas à página do racha
Cliques nos logos dos patrocinadores
Alcance de posts e destaques
ROI por patrocinador
PDF
CSV
Funcionalidades de Exportação
Múltiplos formatos para diferentes necessidades

Exportação PDF Profissional
Relatórios formatados para apresentação e impressão.

Layout profissional com logo do racha
Gráficos e tabelas em alta qualidade
Cabeçalho e rodapé personalizados
Pronto para apresentar a patrocinadores
Exportação CSV
Dados estruturados para análise em planilhas.

Formato compatível com Excel/Google Sheets
Dados organizados em colunas
Filtros e análises avançadas
Importação direta em sistemas
Exportação XLSX
Planilhas Excel com formatação e gráficos.

Arquivos .xlsx nativos
Gráficos interativos incluídos
Formatação condicional
Múltiplas abas organizadas
Compartilhamento Direto
Envie relatórios por email ou WhatsApp.

Compartilhamento via API nativa
Envio automático por email
Integração com WhatsApp Business
Links de acesso direto
KPIs e Métricas Disponíveis
Dados estratégicos para análise e tomada de decisão

Engajamento do Racha
Acessos ao sistema
Jogadores únicos ativos
Tempo médio de sessão
Funcionalidades mais usadas
Performance Esportiva
Total de partidas
Jogadores com melhor performance
Rankings atualizados
Conquistas alcançadas
Métricas Financeiras
Receitas vs despesas
Patrocínios ativos
Ticket médio por jogador
ROI dos investimentos
Analytics de Patrocínios
Visitas à página do racha
Cliques nos logos
Alcance de posts
Conversões por patrocinador
Filtros e Personalização
Personalize seus relatórios conforme suas necessidades

Filtros por Período
Hoje
Esta semana
Este mês
Este ano
Período personalizado
Filtros por Evento
Por partida específica
Por torneio/campeonato
Por jogador individual
Por categoria de ranking
Filtros por Categoria
Esportivo
Financeiro
Engajamento
Patrocínios
Casos de Uso
Como os relatórios do Fut7Pro ajudam seu racha

Apresentação para Patrocinadores
Demonstre o valor do seu racha com métricas profissionais

Visitas ao site
Engajamento dos jogadores
Alcance das publicações
Prestação de Contas
Transparência total sobre finanças e atividades

Receitas e despesas
Patrocínios recebidos
Investimentos realizados
Análise de Performance
Identifique pontos de melhoria e oportunidades

Rankings dos jogadores
Estatísticas de partidas
Evolução temporal
Relatórios para Federações
Documentação oficial para competições e eventos

Histórico de partidas
Estatísticas agregadas
Certificados de participação
Benefícios dos Relatórios
Transforme dados em decisões estratégicas

Decisões Baseadas em Dados
Analise tendências e tome decisões informadas

Exportação Flexível
Múltiplos formatos para diferentes necessidades

Filtros Avançados
Personalize relatórios conforme suas necessidades

Compartilhamento Fácil
Envie relatórios para stakeholders e patrocinadores

Infra e práticas de SaaS escalávelcom segurança de nível empresarial
Multi-tenant com isolamento lógico, TLS/HTTPS, backups automáticos, LGPD-ready. Dados mínimos e transparência total para seu racha.

Testar Segurança do Fut7Pro - 30 dias grátis
Camadas de Segurança
Múltiplas camadas de proteção para garantir a segurança total do seu racha

Multi-Tenant com Isolamento Lógico
Cada racha tem seu ambiente isolado e seguro.

Separação completa de dados por tenant
Isolamento de usuários e permissões
Configurações independentes por racha
Acesso restrito por domínio
TLS/HTTPS e Headers de Segurança
Criptografia de ponta a ponta e proteção avançada.

TLS 1.3 com certificados SSL válidos
Headers de segurança (Helmet)
Content Security Policy (CSP)
HSTS para forçar HTTPS
Backups Automáticos e Redundância
Seus dados sempre seguros e disponíveis.

Backups automáticos diários
Redundância em múltiplas regiões
Recuperação rápida de desastres
Retenção configurável de dados
LGPD-Ready e Privacidade
Conformidade total com a legislação brasileira.

Coleta mínima de dados necessários
Transparência no uso de informações
Direito de exclusão e portabilidade
Consentimento explícito do usuário
Arquitetura de Segurança
Sistema robusto de proteção em múltiplas camadas

Segurança de Infraestrutura
Proteção em nível de servidor e rede.

Firewalls de aplicação (WAF)
Proteção contra DDoS
Isolamento de rede por tenant
Monitoramento 24/7 de segurança
Controle de Acesso e Autenticação
Sistema robusto de permissões e identidade.

JWT com expiração configurável
Role-based Access Control (RBAC)
Multi-factor Authentication (MFA)
Sessões seguras com refresh tokens
Auditoria e Logs de Segurança
Rastreamento completo de todas as ações.

Logs de auditoria em tempo real
Rastreamento de IPs e user agents
Alertas automáticos de segurança
Relatórios de compliance
Monitoramento e Observabilidade
Visibilidade total sobre a segurança do sistema.

Health checks automáticos
Métricas de performance e segurança
Alertas proativos de incidentes
Dashboard de status em tempo real
Conformidade e Certificações
Atende aos mais altos padrões de segurança e privacidade

Conformidade LGPD
Totalmente alinhado com a Lei Geral de Proteção de Dados

Base legal para coleta de dados
Direitos dos titulares dos dados
Relatório de impacto à proteção de dados
Oficial de proteção de dados (DPO)
Certificações de Segurança
Padrões internacionais de segurança implementados

ISO 27001 (Gestão de Segurança da Informação)
SOC 2 Type II (Controles de Segurança)
PCI DSS (Pagamentos seguros)
GDPR (Proteção de dados europeia)
Criptografia e Proteção
Tecnologias de criptografia de última geração

Criptografia AES-256 para dados em repouso
TLS 1.3 para dados em trânsito
Hashing seguro de senhas (bcrypt)
Chaves de criptografia rotativas
Backup e Recuperação
Estratégia robusta de proteção de dados

Backups incrementais a cada 6 horas
Backups completos diários
Retenção de 30 dias para backups incrementais
Retenção de 1 ano para backups completos
Monitoramento e Observabilidade
Visibilidade total sobre a segurança e performance do sistema

Health Checks Automáticos
Monitoramento contínuo da saúde do sistema

Verificação de conectividade do banco
Status dos serviços Redis e cache
Latência de resposta da API
Uso de recursos do servidor
Alertas de Segurança
Notificações imediatas de eventos suspeitos

Tentativas de login maliciosas
Acesso não autorizado a recursos
Padrões de uso anômalos
Falhas de autenticação múltiplas
Monitoramento de Performance
Acompanhamento em tempo real da performance

Tempo de resposta das APIs
Taxa de sucesso das requisições
Uso de memória e CPU
Latência de rede e banco de dados
Logs Estruturados
Sistema completo de logging para auditoria

Logs de aplicação com Winston
Logs de auditoria estruturados
Logs de segurança com níveis de criticidade
Rotação automática de arquivos de log
Métricas de Segurança
Números que comprovam nossa excelência em segurança

99.9%
Uptime Garantido
Disponibilidade do sistema

< 4h
Tempo de Recuperação
RTO (Recovery Time Objective)

< 1h
Perda de Dados Máxima
RPO (Recovery Point Objective)

24/7
Backups Automáticos
Proteção contínua

Resposta a Incidentes
Processo estruturado para lidar com qualquer situação de segurança

1
Detecção
Identificação automática de incidentes de segurança

Monitoramento 24/7
Alertas em tempo real
Análise de padrões anômalos
Notificações automáticas
2
Análise
Investigação detalhada do incidente

Coleta de evidências
Análise de logs de segurança
Identificação da causa raiz
Avaliação do impacto
3
Contenção
Isolamento e neutralização da ameaça

Bloqueio de IPs maliciosos
Suspensão de contas comprometidas
Isolamento de sistemas afetados
Implementação de medidas de proteção
4
Recuperação
Restauração dos sistemas e dados

Restauração de backups
Verificação de integridade
Testes de funcionalidade
Monitoramento pós-incidente

Conecte seu racha a todo o ecossistema digital com webhooks, APIs e automações
Webhooks, APIs REST, integrações de pagamento, notificações e automações. Conecte o Fut7Pro ao seu fluxo de trabalho e ferramentas favoritas.

Testar Integrações do Fut7Pro - 30 dias grátis
Categorias de Integração
Conecte o Fut7Pro a todo o ecossistema digital do seu racha

Webhooks & APIs
Integrações programáticas para desenvolvedores e sistemas.

Webhook de Pagamento
disponivel
Receba notificações automáticas de pagamentos

URL configurável
Chave secreta
Retry automático
Logs detalhados
API Pública Fut7Pro
disponivel
Acesso programático aos dados do racha

Autenticação JWT
Rate limiting
Documentação Swagger
Exemplos de código
Webhook de Eventos
disponivel
Notificações em tempo real de ações importantes

Novos jogadores
Partidas criadas
Rankings atualizados
Pagamentos
Pagamentos & Faturamento
Integrações com gateways de pagamento e sistemas financeiros.

Mercado Pago
disponivel
PIX, cartão e boleto totalmente integrados

Access Token
Webhooks automáticos
Retry de pagamentos
Relatórios
Faturamento Automático
disponivel
Cobrança recorrente para presidentes e admins

Planos configuráveis
Cobrança automática
Notificações
Histórico completo
Webhook de Status
disponivel
Atualizações automáticas de status de pagamento

Aprovado
Pendente
Cancelado
Reembolso
Notificações & Comunicação
Sistemas de envio de mensagens e notificações automáticas.

SendGrid (E-mail)
disponivel
E-mails transacionais automáticos e templates

API Key
Templates personalizados
Relatórios de entrega
Listas de contato
Twilio (SMS)
disponivel
Envio de SMS para comunicações críticas

Account SID
Auth Token
Números configuráveis
Relatórios de entrega
WhatsApp Business API
disponivel
Alertas rápidos para admins e atletas

Phone Number ID
Access Token
Templates aprovados
Webhook de status
OneSignal (Push)
disponivel
Notificações push web e mobile

App ID
REST API Key
Segmentação
Analytics
Marketing, SEO & Analytics
Ferramentas para análise de performance e marketing digital.

Google Analytics
disponivel
Rastreamento completo de visitantes e comportamento

Measurement ID
Eventos customizados
Conversões
Relatórios avançados
Meta Pixel + Conversion API
disponivel
Rastreamento de conversões Facebook/Instagram

Pixel ID
Access Token
Eventos personalizados
Retargeting
Hotjar
disponivel
Mapa de calor, gravação de sessões e análise UX

Site ID
Heatmaps
Session recordings
Feedback tools
Google My Business
disponivel
Apareça em buscas locais, reviews e mapas

Place ID
Reviews automáticos
Insights
Posts
Integrações Avançadas
Ferramentas especializadas para necessidades específicas

Zapier
Automação e integração com centenas de aplicações

Webhook URL configurável
Triggers automáticos
Actions personalizadas
Logs de execução
disponivel
Google Calendar
Sincronização automática de partidas e eventos

Calendar ID
API Key
Sincronização bidirecional
Notificações automáticas
disponivel
SSL & Segurança
Certificados SSL e verificação de reputação

Certificado SSL válido
Google Safe Browsing
Verificação de domínio
Headers de segurança
disponivel
Reputação & Confiança
Selos de reputação para aumentar a confiança

Ebit | Nielsen
ReclameAqui
Trustvox/Yotpo
Reviews verificados
disponivel
Recursos da API
API robusta e segura para integrações profissionais

Documentação Completa
Swagger UI com exemplos práticos e códigos de resposta

Endpoints documentados
Exemplos de requisição
Códigos de status HTTP
Autenticação JWT
Segurança Robusta
Autenticação e autorização de nível empresarial

JWT com expiração configurável
Rate limiting por IP
Validação de entrada
Logs de auditoria
Performance Otimizada
Cache inteligente e resposta rápida

Cache Redis configurável
Compressão de resposta
Paginamento automático
Métricas de performance
Multi-Tenant
Isolamento completo de dados por racha

Separação por tenant
Filtros automáticos
Permissões granulares
Auditoria por tenant
Eventos de Webhook
Receba notificações em tempo real de todas as ações importantes

jogador.novo
Novo jogador cadastrado no racha

Payload:
{
"id": "string",
"nome": "string",
"email": "string",
"rachaId": "string",
"timestamp": "ISO 8601"
}
partida.criada
Nova partida criada

Payload:
{
"id": "string",
"data": "ISO 8601",
"local": "string",
"rachaId": "string",
"status": "AGENDADA"
}
pagamento.recebido
Pagamento confirmado

Payload:
{
"id": "string",
"valor": "number",
"status": "APROVADO",
"metodo": "PIX|CARTAO|BOLETO",
"rachaId": "string"
}
ranking.atualizado
Ranking atualizado após partida

Payload:
{
"rachaId": "string",
"tipo": "GERAL|ARTILHEIROS|ASSISTENCIAS",
"timestamp": "ISO 8601"
}
Casos de Uso Reais
Como outros rachas estão usando as integrações do Fut7Pro

Automação de Comunicação
Envie notificações automáticas para WhatsApp quando novos jogadores se cadastrarem

Ferramentas utilizadas:
WhatsApp Business API
Webhook de eventos
Zapier
Redução de 80% no tempo de comunicação
Engajamento automático
Processo padronizado
Sincronização de Calendário
Partidas criadas no Fut7Pro aparecem automaticamente no Google Calendar

Ferramentas utilizadas:
Google Calendar API
Webhook de partidas
Automação nativa
Zero conflitos de agenda
Lembretes automáticos
Integração com outros apps
Análise de Performance
Dados do racha enviados automaticamente para Google Analytics e Meta Pixel

Ferramentas utilizadas:
Google Analytics
Meta Pixel
Webhook de eventos
API REST
ROI mensurável
Segmentação avançada
Otimização contínua
Gestão Financeira
Pagamentos processados automaticamente e sincronizados com sistemas contábeis

Ferramentas utilizadas:
Mercado Pago
Webhook de pagamentos
API de faturamento
Reconciliação automática
Relatórios em tempo real
Compliance fiscal
Benefícios das Integrações
Por que integrar o Fut7Pro ao seu ecossistema digital

Automação Total
Elimine tarefas manuais e processos repetitivos

Conectividade Universal
Integre com qualquer ferramenta ou sistema

Dados em Tempo Real
Acesso instantâneo a informações do racha

Segurança Garantida
APIs protegidas e webhooks seguros
