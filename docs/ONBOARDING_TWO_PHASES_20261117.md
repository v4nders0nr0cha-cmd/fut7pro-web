# Guia Interativo v3 — auditoria e critérios

## Estrutura e conclusão

| Fase              | Etapa                          | Evidência persistida                                                                                                         |
| ----------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Prepare seu grupo | Conta criada e site no ar      | Critério existente: vínculo aprovado, grupo e endereço público válidos.                                                      |
| Prepare seu grupo | Traga seus primeiros jogadores | Convite copiado com sucesso ou outro atleta válido, conforme regra anterior. Não exige dez.                                  |
| Prepare seu grupo | Defina os dias e horários      | Uma agenda persistida com dia 0–6 e horário HH:mm válido. Rota canônica /admin/rachas.                                       |
| Prepare seu grupo | Cadastre os times              | Dois times oficiais ativos.                                                                                                  |
| Entre em campo    | Avalie o nível dos atletas     | Dez elegíveis e 100% deles com habilidade, físico e nota final salvos. Não basta visitar.                                    |
| Entre em campo    | Prepare a primeira rodada      | Partida válida registrada pelo fluxo existente. Entrada /admin/partidas/criar mantém Sorteio Inteligente e Partida Clássica. |
| Entre em campo    | Registre os resultados         | Resultado válido persistido segundo o resumo operacional existente.                                                          |
| Entre em campo    | Publique o Time Campeão do Dia | Publicação válida vinculada aos resultados, segundo critério existente.                                                      |

A Parte 2 exige as quatro conquistas da Parte 1 e dez atletas atualmente elegíveis. Dez libera o aprendizado: a criação real continua validando participantes conforme times e vagas escolhidos. Rotas esportivas e regras financeiras não foram alteradas.

## Contagem e permissões

O backend consulta apenas atletas do grupo, ativos, não arquivados e não bots. Perfis manuais sem usuário contam; perfis vinculados exigem associação aprovada. Perfis administrativos exigem presença esportiva TITULAR/SUBSTITUTO com time em partida válida, não apagada, não cancelada ou rascunho. A criação automática da conta não basta.

Identidades são reunidas por usuário e e-mail normalizado; não se compara nome. Limite do domínio: dois perfis manuais sem e-mail nem conta não possuem identidade confiável para provar que são a mesma pessoa. Não se apagam nem se fundem dados por suposição.

Disponibilidade das ações vem do backend e respeita permissões, etapas anteriores, dez elegíveis e condições operacionais atuais. Todas as explicações permanecem consultáveis. Pular não concede conquista nem permissão. As funcionalidades administrativas mantêm seus próprios controles.

## Persistência e compatibilidade

Versão 3 no JSON já existente do vínculo administrador/grupo, sem migração de esquema, reset ou alteração de dados esportivos. IDs anteriores, convites copiados, preferências, adiamentos e histórico são preservados. O backend incorpora as conquistas comprovadas em completedTaskIds, sob bloqueio transacional e revisão. Novos atletas não apagam a avaliação já conquistada. Na versão 2, a avaliação obrigatória do caminho inteligente é preservada quando sua cobertura anterior está comprovada.

Limite histórico: a versão anterior recalculava conclusões; evidência que já deixou de existir antes da atualização não pode ser reconstruída. Não se inventam conclusões de agenda ou avaliações novas.

Comemoração e convite de desbloqueio possuem marcações persistentes por vínculo e aquisição atômica, evitando repetição entre dispositivos. Aceitar/iniciar encerra o convite. X/Agora não adia; uma nova oferta fica para o próximo login, respeitando a política existente. Dispensa permanente não é removida ao abrir manualmente. Atingir dez durante a sessão atualiza o estado sem interromper a operação.

## Erro ao pular

Auditoria identificou seleção remota desnecessária e instâncias independentes disputando a mesma revisão. Testes reproduzem HTTP 409 e verificam serialização por usuário/grupo, revalidação e uma única repetição segura do adiamento. Ver próxima etapa é navegação local sem PATCH. Pular por enquanto grava STEP_SKIPPED sem concluir a tarefa. Falha de leitura após PATCH confirmado não é apresentada como falha de gravação.

O código HTTP do incidente original em produção não foi capturado; a reprodução de 409 não prova que aquele incidente específico teve essa causa. Autorização e expectedRevision continuam ativos.

## Interface e atualização

Ajuda acessível localizada no guia, usando icon do Fut7DialogBase sem alterar o comportamento dos demais modais. Boas-vindas compactas no celular, desktop preservado; opções de convite horizontais, ações hierarquizadas e prévias contidas com ampliação da imagem original. Agenda usa rótulos, controle de horário com fonte de 16px, feedback e cartões móveis, mantendo os dados de recorrência e feriados fornecidos pelo serviço.

Sem polling novo. Revalidação após cadastro/aprovação/arquivamento, agenda e avaliações; leitura com SWR e isolamento por usuário/grupo.

## Validação e revisão

Testes direcionados cobrem fases, fronteira 9/10, filtros e deduplicação, conquistas estáveis, transições, permissões, compatibilidade v2, navegação sem gravação, concorrência/409, ajuda e agenda. TypeScript, lint e verificações de formatação acompanham os PRs.

Pendente de validação humana: Safari em iPhone físico, comparação autenticada com fotos/escudos reais e confirmação do erro original em produção. O ajuste do campo de horário é verificável em código/testes, mas não comprova sozinho o comportamento do teclado/zoom de um iPhone real. Nenhuma configuração de Turnstile foi alterada.

Publicação coordenada: backend v3 antes do frontend v3. Manter PRs em rascunho até revisão e validação visual. Nenhum merge nem deploy de produção foi realizado.

### Evidências de CI

Backend #189: segurança, testes e política de changelog aprovados. Testes locais direcionados: 53 do guia e 21 do changelog. Frontend #257: suíte completa com 718 testes em 157 suítes aprovada, além de lint, TypeScript e Prettier. O build inicialmente excedeu o heap de 2 GB do Node; o workflow passa a reservar até 4 GB apenas na compilação, sem alteração de infraestrutura ou configuração de produção.

Ao iniciar o servidor local, os tipos gerados do Next também revelaram duas incompatibilidades preexistentes de parâmetros assíncronos nas rotas /api/jogadores/[id]/archive e /restore. Essas rotas não fazem parte do diff. A checagem de tipos limpa do CI passou; a divergência local fica registrada para revisão separada.
