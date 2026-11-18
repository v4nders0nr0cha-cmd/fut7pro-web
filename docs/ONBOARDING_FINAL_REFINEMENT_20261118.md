# Refinamento final do Guia e recompensa de ativação — 18/11/2026

## Entrega coordenada

Atualiza as branches existentes de backend #189 e frontend #257. Site #132 complementa a visualização do Creator, que pertence a outro repositório. Sem merge, deploy, alteração de configuração de produção ou execução da migração em produção.

## Interface e apresentação

Superfície grafite neutra, escudo com object-contain e imagem original sem tratamento de pixels. Transparência do PNG existente logo_fut7pro.png verificada: RGBA com alfa 0–255 e canto totalmente transparente. Testes visuais usam esse arquivo, escudo circular e logo retangular com fundo colorido. Um preto gravado no arquivo original não é apagado automaticamente; sem o arquivo específico não se afirma que um quadrado preto observado em produção veio do renderizador.

Remove Agora não somente das boas-vindas e remove Pular por enquanto de todas as etapas. Histórico de STEP_SKIPPED e revisão continuam compatíveis no backend. A dispensa Não mostrar este Guia novamente exige confirmação, e o X permanece temporário. Mensagens distinguem primeira entrada, retorno, espera por atletas e Parte 2 liberada.

A Dashboard deixa de ter card de progresso. Um apresentador sem card mantém somente os modais dos marcos: primeira apresentação persistida, comemoração da Parte 1 e desbloqueio da Parte 2. O mesmo marco não insiste a cada login. X e Agora não contextuais não dispensam marcos futuros. A dispensa permanente suprime apresentações automáticas; acesso manual pelo perfil e pela página do guia permanece.

## Política comercial confirmada pelo responsável

Somente grupos criados a partir da ativação da campanha, em teste válido, sem assinatura paga, pagamento registrado ou cobrança iniciada no provedor. Grupos antigos, sem assinatura elegível, testes expirados e ciclos pagos não recebem prorrogação.

A ativação é o createdAt do registro imutável ONBOARDING_V3_10_DAYS, inserido pela migração no momento em que ela for aplicada. Não é a data do arquivo nem uma data retroativa fixa. A migração adiciona dois campos opcionais à assinatura e uma restrição única parcial; não reinicia dados ou progresso.

O backend exige as oito conquistas e uma publicação atualmente válida do Time Campeão do Dia, usando os critérios operacionais existentes, sem aceitar provas ou quantidade de dias enviadas pelo cliente. A data da rodada é guardada como evidência; não é confundida com a data de publicação. Grupos anteriores à campanha são excluídos pela criação do grupo.

## Cálculo e consistência financeira

Nova data = maior prazo vigente entre trialEnd, currentPeriodEnd e ajustes de acesso aplicados + dez períodos de 24 horas. trialEnd e currentPeriodEnd são atualizados juntos, dentro de transação que grava o SubscriptionDayAdjustment de cortesia comercial e o log de auditoria. Os dias originais do catálogo e extraTrialDays do cupom não são sobrescritos.

Bloqueio da assinatura e índice único (grupo, campanha) impedem duplicação entre administradores, retries e processos. Uma concessão já registrada não é repetida nem convertida em pagamento. Ajustes manuais não podem usar o identificador reservado da campanha; a reversão genérica de cortesia não pode reverter parcialmente essa recompensa e deixar datas divergentes.

O início do checkout registra um marcador antes do contato com o provedor e relê a assinatura, serializando-se com a recompensa. Para assinaturas recompensadas, a ativação usa o caminho de assinatura direta existente, enviando auto_recurring.start_date com o prazo real atualizado, inclusive quando existe um plano compartilhado configurado. PIX continua sendo compra voluntária; sua vigência usa o prazo atualizado existente.

Cortesias administrativas também relêem a assinatura sob bloqueio antes do cálculo, preservando uma recompensa concorrente. Cupons são aplicados com leitura e atualização da assinatura na mesma transação. Consultas de catálogo e registro de indicação ficam fora do bloqueio para não esgotar conexões em requisições concorrentes. Para um teste já recompensado, adicionar dias de cupom depois de iniciar cobrança exige revisão pelo suporte; o sistema não altera silenciosamente a agenda do provedor. Aplicar o cupom antes do checkout preserva a soma normalmente.

Limitação deliberada: uma tentativa de checkout com resultado externo incerto mantém o marcador. Não se concede benefício automaticamente sobre uma cobrança que pode ter sido criada. A recuperação exige verificar o provedor; não se limpa o marcador cegamente após timeout. Validações locais são realizadas antes de gravá-lo.

Referência primária da integração de data: https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/create-preapproval/post . Nenhuma chamada financeira real ou homologação com credenciais de pagamento foi executada nesta tarefa.

## Creator e compatibilidade

Atribuição, descontos, vendas validadas, comissões e permissões permanecem sob as regras existentes. A projeção expõe somente duração original, dias do cupom, dias do guia, outros ajustes e término do teste. Não expõe pagador, identificadores financeiros ou metadados da auditoria.

Novos testes criados pelo catálogo guardam originalTrialDays. Quando esse valor não existe no histórico, a interface informa desconhecido, sem deduzi-lo dos prazos prorrogados. Encerramento do prazo do teste e primeira compra usam fatos separados; a recompensa não cria pagamento, conversão nem comissão.

A confirmação visual do prêmio depende de granted no retorno do backend. Após concessão confirmada, os dados de plano e acesso são revalidados por evento restrito ao grupo atual, sem novo polling. Concessão única por grupo; apresentação guardada por vínculo administrativo. Falha na concessão permite retry sem prometer benefício não confirmado. A conquista permanece consultável no guia. Dispensa permanente não impede a concessão válida ao grupo, mas impede o modal automático.

## Validação e limites

Testes direcionados de interface, mensagens, confirmação, ausência de card/pulo, concessão confirmada e recuperação; regras comerciais, elegibilidade e preservação de cupom; projeção e renderização do painel Creator. Teste de integração com PostgreSQL verifica concorrência entre dois administradores, doze requisições, índice único, datas e um único log.

A matriz visual existente foi ampliada para transparência, formatos de escudo e ausência de card no desktop/mobile. Avaliações futuras continuam sem apagar conquistas persistidas, conforme teste de regressão do PR #189.

Safari/iPhone físico e fluxo real com provedor em homologação permanecem validações humanas antes da produção. Os dois erros preexistentes em tipos locais gerados das rotas archive/restore permanecem fora do diff, conforme auditoria anterior. Publicação coordenada: migração e backend antes dos clientes frontend/site, somente após autorização.
