# Refinamento do pagamento da assinatura

Base frontend: main `42f62791c63abdd58f4f4668892bddd0ed0cad47`. Base backend: main `8261a8921afcaacee523aab0a2dae0de004c9bad`.

## Implementação

A Visão geral conserva a navegação superior e remove atalhos duplicados. A ação financeira usa o estado confirmado: TESTE → Configurar pagamento; VENCIDO → Regularizar pagamento; PENDENTE com cobrança registrada → Pagar cobrança; demais estados → Opções de pagamento. Datas não determinam inadimplência ou acesso.

O diálogo apresenta cartão automático e PIX avulso com valores do `pricingPreview` do backend. Sem preço confirmado, os dois meios ficam bloqueados. A autorização de recorrência aparece somente depois da escolha de cartão, antes do redirecionamento ao Mercado Pago. Não há oferta de parcelamento. O PIX não depende de consentimento para cartão e não cancela uma recorrência existente.

O cupom é expansível no pagamento, respeita canApplyCoupon e utiliza validateCoupon seguido de applyCouponToSubscription. Validação isolada não concede benefício. Após aplicação, a escolha de cartão permanece; o consentimento é renovado e os pagamentos aguardam a assinatura atualizada. Uma falha de atualização mantém o bloqueio. O código de cupom é codificado como segmento de URL. Respostas atrasadas continuam sujeitas ao escopo de grupo e sessão do CentralProvider.

Antes de mostrar um PIX ou redirecionar ao cartão, a resposta financeira é conferida com o resumo consultado. Divergência exige nova consulta e, se persistir, suporte; não provoca cancelamento nem criação automática de outra cobrança. O backend continua calculando valores e processando confirmações.

Ajuste técnico separado no backend: o caminho que utiliza plano compartilhado MP não enviava a data individual futura. Quando existir trialEnd/currentPeriodEnd futuro, utiliza-se o caminho direto já implementado com start_date. Reutilização de checkout exige que a data do provedor não antecipe esse prazo. Nenhum contrato, preço, prazo salvo, pagamento histórico ou política comercial é reescrito.

## Identidade no checkout hospedado

O código usa POST /preapproval e recebe init_point do Mercado Pago. O payload contém motivo, pagador, condições de recorrência, plano opcional e URL de retorno; não envia foto pessoal ou logotipo. A API de criação consultada não documenta parâmetro para trocar o avatar do vendedor no checkout de assinatura. Portanto, a imagem observada vem do ambiente e da identidade mantidos pelo provedor; não foi possível confirmar qual cadastro específico a seleciona sem acesso à conta e ao checkout correspondente.

Foto de perfil, dados do titular, marca da loja e personalização de links de pagamento são configurações distintas. A documentação oficial de **links de pagamento** informa o caminho Configurações → Conta → Personalização do checkout → Editar → Mostrar marca da loja, com URL pública da imagem. O proprietário pode conferir se essa opção existe na conta vendedora correta e quais soluções ela abrange. Isso não comprova que a mesma configuração altere o checkout de **assinaturas**. Se a imagem persistir nessa modalidade, abrir atendimento com o Mercado Pago, informando a modalidade preapproval e um identificador de checkout, sem compartilhar access tokens. Não trocar titularidade ou credenciais para resolver o avatar.

Nenhuma configuração da conta foi alterada. Não foi aplicada manipulação de iframe, página externa ou substituição do checkout oficial.

Referências oficiais consultadas em 27/11/2026:

- https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/create-preapproval/post
- https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration/subscription-associated-plan
- https://www.mercadopago.com.br/blog/personalizar-link-pagamento-logo-marca

## Desconto PIX: proposta para aprovação

Nenhuma porcentagem, selo promocional ou desconto por modalidade foi implementado. O valor atual do PIX segue o cálculo vigente do backend.

Proposta: política versionada no catálogo oficial, definida por plano/periodicidade e modalidade PIX, com vigência, percentual OU abatimento fixo em centavos, limite e regra de combinação explícita. Recomenda-se desativada por padrão; decidir comercialmente se é cumulativa com cupons ou se vale o melhor desconto. Decidir também se vale na primeira cobrança ou em cada renovação avulsa, e como tratar faturas emitidas antes da vigência. Esses pontos precisam de aprovação antes da implementação.

O backend deve selecionar uma única política válida dentro da operação idempotente e da mesma proteção contra concorrência já existente. Aplicar a ordem aprovada de descontos uma vez, arredondar em centavos com regra única, impedir total negativo e manter o mínimo do provedor. O cálculo de recorrência em cartão nunca recebe a política PIX. Persistir na fatura/snapshot versão da política, modalidade, base, cupom, cada abatimento, arredondamento e total. O evento auditável acompanha a emissão; pagamento confirmado registra o valor efetivo, sem reescrever o snapshot nem reaplicar desconto. Reutilizar cobrança pendente conserva condições de emissão; mudança de política não recalcula uma cobrança já criada.

APIs futuras devem devolver a cotação por modalidade com identificador/validade e discriminação, validada novamente na emissão. A interface apenas apresenta essa cotação. Testar cumulatividade, primeira/recorrente, centavos, concorrência, retries, expiração, reembolso e imutabilidade do histórico. Não há migração proposta pronta para execução nesta tarefa.

## Cartão parcelado: viabilidade separada

Assinatura automática por preapproval agenda cobranças periódicas; isso não equivale a parcelar um pagamento único anual no cartão. O Fut7Pro atual não oferece esse parcelamento. Uma alternativa exigiria Checkout Pro ou outra API de pagamento único compatível, com aprovação de juros, quantidade de parcelas, responsabilidade pelas tarifas, acesso concedido, renovação, cancelamento, reembolsos e relacionamento com recorrências existentes. Não criar esse fluxo antes de aprovação comercial e desenho técnico específico.

## Validação e integração

Resultados executados, capturas e checks finais serão registrados nos PRs. Os testes de navegador usam provedor simulado, dados fictícios e URLs locais. Testes locais usam cache de dependências existente; o CI com instalação congelada é a referência para o grafo atual. Não houve cobrança real, migração, merge ou publicação manual. Integrar a correção de data do backend antes dos ajustes de contratação no frontend.
