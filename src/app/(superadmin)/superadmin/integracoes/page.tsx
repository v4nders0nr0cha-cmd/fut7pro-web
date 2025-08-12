"use client";

import Head from "next/head";
import { useState } from "react";
import { FaTrash, FaInfoCircle, FaTimes } from "react-icons/fa";

// 1. TIPAGEM DOS CAMPOS
type CampoIntegracao = { name: string; label: string; type: string; placeholder: string };
type CamposIntegracao = {
  titulo: string;
  descricao: string;
  instrucoes: string;
  campos: CampoIntegracao[];
};
type StatusIntegracao = "disponivel" | "instalado";
type IntegracaoCard = {
  id: string;
  nome: string;
  descricao: string;
  logo: string;
  status: StatusIntegracao;
};
type CategoriaIntegracao = {
  nome: string;
  integrações: IntegracaoCard[];
};

// 2. CAMPOS DE CONFIGURAÇÃO PARA CADA INTEGRAÇÃO
const camposIntegracoes: Record<string, CamposIntegracao> = {
  ssl: {
    titulo: "Certificado SSL",
    descricao: "Seu site precisa ter um certificado SSL ativo para máxima segurança.",
    instrucoes: `Adquira um certificado SSL (Let's Encrypt, Cloudflare, Sectigo, etc.) e instale no seu domínio. 
        Após instalar, insira abaixo o domínio HTTPS para validação.`,
    campos: [
      {
        name: "domain",
        label: "Domínio (com https://)",
        type: "text",
        placeholder: "Ex: https://meusite.com.br",
      },
    ],
  },
  safebrowsing: {
    titulo: "Google Safe Browsing",
    descricao: "Verificação de site seguro e reputação Google.",
    instrucoes: `Acesse https://transparencyreport.google.com/safe-browsing/search, pesquise seu domínio, e cole abaixo o status retornado (Seguro/Inseguro).`,
    campos: [{ name: "safe_status", label: "Status", type: "text", placeholder: "Ex: Seguro" }],
  },
  ebit: {
    titulo: "Ebit | Nielsen",
    descricao: "Selo de reputação Ebit para aumentar a confiança dos visitantes.",
    instrucoes: `Cole o Store ID e o Buscapé ID fornecidos no seu painel Ebit.`,
    campos: [
      { name: "store_id", label: "Store ID", type: "text", placeholder: "Ex: 123456" },
      { name: "buscape_id", label: "Buscapé ID", type: "text", placeholder: "Ex: 654321" },
    ],
  },
  reclameaqui: {
    titulo: "ReclameAqui",
    descricao: "Selo de reputação ReclameAqui e monitoramento de avaliações.",
    instrucoes: `Cole a URL da sua página no ReclameAqui e o Token/API se disponível.`,
    campos: [
      {
        name: "url",
        label: "URL da sua página ReclameAqui",
        type: "text",
        placeholder: "Ex: https://www.reclameaqui.com.br/empresa/fut7pro/",
      },
      {
        name: "token",
        label: "Token API (opcional)",
        type: "text",
        placeholder: "Ex: ABCD-1234-EFGH-5678",
      },
    ],
  },
  trustvox: {
    titulo: "Trustvox/Yotpo/Opiniões Verificadas",
    descricao: "Integre reviews automáticos e selo de avaliações.",
    instrucoes: `Cole o Widget ID, API Key, ou código do selo recebido por e-mail ao contratar Trustvox/Yotpo.`,
    campos: [
      { name: "widget_id", label: "Widget/API Key", type: "text", placeholder: "Ex: tvx-xxxxxxxx" },
    ],
  },
  mercadopago: {
    titulo: "Mercado Pago",
    descricao: "Pagamentos via PIX, cartão e boleto totalmente integrados.",
    instrucoes: `Acesse o painel Mercado Pago, gere um Access Token e cole abaixo para ativar pagamentos automáticos.`,
    campos: [
      {
        name: "access_token",
        label: "Access Token",
        type: "text",
        placeholder: "Ex: APP_USR-xxxxxxxxxxxx",
      },
    ],
  },
  webhookpagamento: {
    titulo: "Webhook de Pagamento",
    descricao: "Receba notificações automáticas de pagamentos de clientes e presidentes.",
    instrucoes: `Cole a URL do endpoint de webhook configurada no seu gateway de pagamentos.`,
    campos: [
      {
        name: "webhook_url",
        label: "URL do Webhook",
        type: "text",
        placeholder: "Ex: https://fut7pro.com.br/api/webhook/pagamento",
      },
      {
        name: "secret",
        label: "Chave Secreta (opcional)",
        type: "text",
        placeholder: "Ex: segredosupersecreto",
      },
    ],
  },
  faturamento: {
    titulo: "Faturamento Automático",
    descricao: "Cobrança recorrente para Presidentes/Admins e clubes.",
    instrucoes: `Configure seu gateway (ex: Mercado Pago, Iugu, Stripe) para cobrança recorrente e insira o identificador do plano.`,
    campos: [
      {
        name: "plano_id",
        label: "ID do Plano/Produto",
        type: "text",
        placeholder: "Ex: plano_premium_001",
      },
    ],
  },
  sendgrid: {
    titulo: "SendGrid (E-mail)",
    descricao: "Envio de e-mails transacionais automáticos.",
    instrucoes: `Cole sua API Key da conta SendGrid e, se quiser, um remetente padrão.`,
    campos: [
      { name: "api_key", label: "API Key", type: "text", placeholder: "Ex: SG.xxxxxx" },
      {
        name: "from_email",
        label: "E-mail do remetente",
        type: "text",
        placeholder: "Ex: contato@fut7pro.com.br",
      },
    ],
  },
  twilio: {
    titulo: "Twilio (SMS)",
    descricao: "Envio de SMS para notificações importantes.",
    instrucoes: `Insira Account SID, Auth Token e número Twilio para enviar SMS.`,
    campos: [
      { name: "account_sid", label: "Account SID", type: "text", placeholder: "Ex: ACxxxx" },
      { name: "auth_token", label: "Auth Token", type: "text", placeholder: "Ex: xxxxxxxx" },
      { name: "from", label: "Número Twilio", type: "text", placeholder: "Ex: +5511999999999" },
    ],
  },
  whatsapp: {
    titulo: "WhatsApp Business API",
    descricao: "Notificações rápidas e automáticas para admins e atletas.",
    instrucoes: `Insira Token de acesso, número e ID do provedor (Zenvia, Twilio, Gupshup, etc).`,
    campos: [
      { name: "provider", label: "Provedor", type: "text", placeholder: "Ex: Zenvia, Twilio" },
      { name: "token", label: "Token", type: "text", placeholder: "Ex: XXXXX" },
      { name: "number", label: "Número", type: "text", placeholder: "Ex: +5511912345678" },
    ],
  },
  onesignal: {
    titulo: "OneSignal (Push Notification)",
    descricao: "Notificações push web/mobile para engajamento.",
    instrucoes: `Cole App ID e API Key da sua conta OneSignal.`,
    campos: [
      {
        name: "app_id",
        label: "App ID",
        type: "text",
        placeholder: "Ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx",
      },
      { name: "api_key", label: "API Key", type: "text", placeholder: "Ex: REST_xxxxxxxx" },
    ],
  },
  ga4: {
    titulo: "Google Analytics 4",
    descricao: "Métricas, funis, eventos e conversões em tempo real.",
    instrucoes: `Cole o Measurement ID do seu Google Analytics 4 (Ex: G-XXXXXXX).`,
    campos: [
      {
        name: "measurement_id",
        label: "Measurement ID",
        type: "text",
        placeholder: "Ex: G-XXXXXXXXXX",
      },
    ],
  },
  tagmanager: {
    titulo: "Google Tag Manager",
    descricao: "Gerenciamento centralizado de tags/pixels/scripts.",
    instrucoes: `Cole o ID do container do seu Tag Manager.`,
    campos: [
      { name: "container_id", label: "Container ID", type: "text", placeholder: "Ex: GTM-XXXXXX" },
    ],
  },
  searchconsole: {
    titulo: "Google Search Console",
    descricao: "SEO, indexação, relatórios e alertas.",
    instrucoes: `Cole apenas o content/id da meta tag do Search Console: 
        <meta name="google-site-verification" content="xxxxxxxxx" /> (Cole só a parte 'xxxxxxxxx')`,
    campos: [
      {
        name: "property_id",
        label: "Content / ID da Propriedade",
        type: "text",
        placeholder: "Ex: xxxxxxxxx",
      },
    ],
  },
  adwords: {
    titulo: "Google Ads (AdWords)",
    descricao: "Anúncios, remarketing e acompanhamento de conversão.",
    instrucoes: `Cole o Conversion ID e Conversion Label do seu pixel AdWords.`,
    campos: [
      {
        name: "conversion_id",
        label: "Conversion ID",
        type: "text",
        placeholder: "Ex: AW-XXXXXXXX",
      },
      {
        name: "conversion_label",
        label: "Conversion Label",
        type: "text",
        placeholder: "Ex: abcDEFGhijkLMnopQRs",
      },
    ],
  },
  meta: {
    titulo: "Meta Pixel + Conversion API",
    descricao: "Rastreamento de conversões Facebook/Instagram.",
    instrucoes: `Cole Pixel ID e Access Token do seu pixel Facebook/Meta Business Suite.`,
    campos: [
      { name: "pixel_id", label: "Pixel ID", type: "text", placeholder: "Ex: 1234567890" },
      {
        name: "access_token",
        label: "Access Token",
        type: "text",
        placeholder: "Ex: EAABsbCS1iHgBA...",
      },
    ],
  },
  hotjar: {
    titulo: "Hotjar",
    descricao: "Mapa de calor, gravação de sessões e análise UX.",
    instrucoes: `Cole Site ID/Tracking Code do Hotjar.`,
    campos: [{ name: "site_id", label: "Site ID", type: "text", placeholder: "Ex: 1234567" }],
  },
  mybusiness: {
    titulo: "Google My Business",
    descricao: "Apareça em buscas locais, reviews e mapas.",
    instrucoes: `Cole o Place ID ou URL do seu perfil no Google Meu Negócio.`,
    campos: [
      {
        name: "place_id",
        label: "Place ID ou URL",
        type: "text",
        placeholder: "Ex: ChIJN1t_tDeuEmsRUsoyG83frY4",
      },
    ],
  },
  zapier: {
    titulo: "Zapier",
    descricao: "Automação e integração com centenas de apps.",
    instrucoes: `Cole o Webhook URL gerado no painel Zapier.`,
    campos: [
      {
        name: "webhook_url",
        label: "Webhook URL",
        type: "text",
        placeholder: "Ex: https://hooks.zapier.com/...",
      },
    ],
  },
  apipublica: {
    titulo: "API Pública Fut7Pro",
    descricao: "Integração para desenvolvedores, plugins e apps.",
    instrucoes: `Solicite sua API Key e cole abaixo.`,
    campos: [
      { name: "api_key", label: "API Key", type: "text", placeholder: "Ex: 12345abcd67890" },
    ],
  },
  calendar: {
    titulo: "Google Calendar",
    descricao: "Criação automática de eventos e jogos no seu calendário.",
    instrucoes: `Cole o ID do calendário ou a credencial de acesso à API do Google Calendar.`,
    campos: [
      {
        name: "calendar_id",
        label: "Calendar ID",
        type: "text",
        placeholder: "Ex: xxxxx@group.calendar.google.com",
      },
    ],
  },
  sentry: {
    titulo: "Sentry",
    descricao: "Monitoramento de erros front-end e back-end.",
    instrucoes: `Cole o DSN do seu projeto Sentry.`,
    campos: [
      {
        name: "dsn",
        label: "DSN",
        type: "text",
        placeholder: "Ex: https://xxxx.ingest.sentry.io/1234",
      },
    ],
  },
  login: {
    titulo: "Login Social (Google, Facebook, Apple, etc.)",
    descricao: "Acesso rápido via login social, maior conversão de cadastro.",
    instrucoes: `Cole Client ID, Client Secret e Provider (Google, Facebook, Apple, etc.)`,
    campos: [
      { name: "provider", label: "Provider", type: "text", placeholder: "Ex: Google, Facebook" },
      {
        name: "client_id",
        label: "Client ID",
        type: "text",
        placeholder: "Ex: 12345.apps.googleusercontent.com",
      },
      { name: "client_secret", label: "Client Secret", type: "text", placeholder: "Ex: xxxxxxx" },
    ],
  },
};

// 3. CATEGORIAS DE CARDS PARA O PAINEL
const categoriasIntegracoes: CategoriaIntegracao[] = [
  {
    nome: "Segurança & Confiança",
    integrações: [
      {
        id: "ssl",
        nome: "Certificado SSL",
        descricao: "HTTPS, segurança e reputação.",
        logo: "/images/integracoes/ssl.png",
        status: "disponivel",
      },
      {
        id: "safebrowsing",
        nome: "Google Safe Browsing",
        descricao: "Proteção e reputação anti-phishing.",
        logo: "/images/integracoes/safebrowsing.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Reputação & Prova Social",
    integrações: [
      {
        id: "ebit",
        nome: "Ebit | Nielsen",
        descricao: "Avaliação de consumidores reais.",
        logo: "/images/integracoes/ebit.png",
        status: "disponivel",
      },
      {
        id: "reclameaqui",
        nome: "ReclameAqui",
        descricao: "Selo de reputação no Brasil.",
        logo: "/images/integracoes/reclameaqui.png",
        status: "disponivel",
      },
      {
        id: "trustvox",
        nome: "Trustvox/Yotpo",
        descricao: "Reviews automáticos e selo de avaliações.",
        logo: "/images/integracoes/trustvox.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Pagamentos & Faturamento",
    integrações: [
      {
        id: "mercadopago",
        nome: "Mercado Pago",
        descricao: "PIX, cartão e boleto integrado.",
        logo: "/images/integracoes/mercadopago.png",
        status: "disponivel",
      },
      {
        id: "webhookpagamento",
        nome: "Webhook de Pagamento",
        descricao: "Atualizações automáticas de status de pagamento.",
        logo: "/images/integracoes/webhook.png",
        status: "disponivel",
      },
      {
        id: "faturamento",
        nome: "Faturamento Automático",
        descricao: "Cobrança recorrente e gestão de planos.",
        logo: "/images/integracoes/faturamento.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Notificações & Comunicação",
    integrações: [
      {
        id: "sendgrid",
        nome: "SendGrid (E-mail)",
        descricao: "E-mails transacionais automáticos.",
        logo: "/images/integracoes/sendgrid.png",
        status: "disponivel",
      },
      {
        id: "twilio",
        nome: "Twilio (SMS)",
        descricao: "Envio de SMS para comunicações críticas.",
        logo: "/images/integracoes/twilio.png",
        status: "disponivel",
      },
      {
        id: "whatsapp",
        nome: "WhatsApp Business API",
        descricao: "Alertas rápidos para admins e atletas.",
        logo: "/images/integracoes/twilio.png",
        status: "disponivel",
      },
      {
        id: "onesignal",
        nome: "OneSignal (Push)",
        descricao: "Notificações push web/mobile.",
        logo: "/images/integracoes/onesignal.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Marketing, SEO & Analytics",
    integrações: [
      {
        id: "ga4",
        nome: "Google Analytics 4",
        descricao: "Métricas e funil de conversão.",
        logo: "/images/integracoes/ga4.png",
        status: "disponivel",
      },
      {
        id: "tagmanager",
        nome: "Google Tag Manager",
        descricao: "Gerenciamento de tags e pixels.",
        logo: "/images/integracoes/tagmanager.png",
        status: "disponivel",
      },
      {
        id: "searchconsole",
        nome: "Google Search Console",
        descricao: "SEO, indexação e performance.",
        logo: "/images/integracoes/searchconsole.png",
        status: "disponivel",
      },
      {
        id: "adwords",
        nome: "Google Ads (AdWords)",
        descricao: "Anúncios e remarketing.",
        logo: "/images/integracoes/adwords.png",
        status: "disponivel",
      },
      {
        id: "meta",
        nome: "Meta Pixel + Conversion API",
        descricao: "Conversões Facebook/Instagram.",
        logo: "/images/integracoes/meta.png",
        status: "disponivel",
      },
      {
        id: "hotjar",
        nome: "Hotjar",
        descricao: "Mapa de calor e gravação de sessões.",
        logo: "/images/integracoes/hotjar.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Prova Social, Local & Outros",
    integrações: [
      {
        id: "mybusiness",
        nome: "Google My Business",
        descricao: "Busca local, mapas e reviews.",
        logo: "/images/integracoes/mybusiness.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "Automação, Expansão & Engajamento",
    integrações: [
      {
        id: "zapier",
        nome: "Zapier",
        descricao: "Automação com outros apps.",
        logo: "/images/integracoes/zapier.png",
        status: "disponivel",
      },
      {
        id: "apipublica",
        nome: "API Pública Fut7Pro",
        descricao: "Plugins, integrações externas e B2B.",
        logo: "/images/integracoes/apipublica.png",
        status: "disponivel",
      },
    ],
  },
  {
    nome: "UX, Monitoramento & Login",
    integrações: [
      {
        id: "calendar",
        nome: "Google Calendar",
        descricao: "Eventos e agenda automática.",
        logo: "/images/integracoes/calendar.png",
        status: "disponivel",
      },
      {
        id: "sentry",
        nome: "Sentry",
        descricao: "Monitoramento de erros.",
        logo: "/images/integracoes/sentry.png",
        status: "disponivel",
      },
      {
        id: "login",
        nome: "Login Social",
        descricao: "Acesso fácil via Google, Facebook, etc.",
        logo: "/images/integracoes/login.png",
        status: "disponivel",
      },
    ],
  },
];

// 4. COMPONENTE PRINCIPAL
export default function IntegracoesSuperAdminPage() {
  const [modal, setModal] = useState<{ id: string; nome: string } | null>(null);
  const [campos, setCampos] = useState<{ [key: string]: string }>({});

  function handleAbrirModal(integ: IntegracaoCard) {
    setModal({ id: integ.id, nome: integ.nome });
    setCampos({});
  }
  function handleFecharModal() {
    setModal(null);
    setCampos({});
  }
  function handleCampoChange(name: string, value: string) {
    setCampos((prev) => ({ ...prev, [name]: value }));
  }
  function handleSalvar() {
    // Grava no localStorage (mock, troca para API quando quiser)
    window.localStorage.setItem(`integracao_${modal?.id}`, JSON.stringify(campos));
    alert(`Configuração salva para ${modal?.nome}:\n${JSON.stringify(campos, null, 2)}`);
    handleFecharModal();
  }

  return (
    <>
      <Head>
        <title>Integrações • SuperAdmin | Fut7Pro</title>
        <meta
          name="description"
          content="Painel de integrações do site Fut7Pro – SuperAdmin SaaS"
        />
        <meta
          name="keywords"
          content="fut7, integrações, api, google, facebook, analytics, ebit, ssl, pagamentos, saas, webhook, reviews, reputação"
        />
      </Head>
      <main className="min-h-screen bg-fundo px-2 py-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-amarelo mb-6 text-left w-full max-w-7xl">
          Integrações
        </h1>
        <div className="w-full max-w-7xl space-y-12">
          {categoriasIntegracoes.map((categoria) => (
            <section key={categoria.nome} className="mb-4">
              <h2 className="text-lg font-semibold mb-4 text-white">{categoria.nome}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoria.integrações.map((integ) => (
                  <div
                    key={integ.id}
                    className="relative flex flex-col items-center bg-zinc-900 rounded-xl p-4 shadow group transition hover:ring-2 hover:ring-amarelo"
                  >
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold 
                      ${integ.status === "instalado" ? "bg-green-700 text-green-100" : "bg-zinc-700 text-zinc-200"}`}
                    >
                      {integ.status === "instalado" ? "Instalado" : "Disponível"}
                    </span>
                    <img
                      src={integ.logo}
                      alt={`Logo ${integ.nome}`}
                      className="w-24 h-16 object-contain mx-auto mb-3 rounded bg-white"
                    />
                    <div className="font-bold text-base text-white text-center mb-1">
                      {integ.nome}
                    </div>
                    <div className="flex items-center gap-1 text-zinc-300 text-sm text-center mb-3">
                      {integ.descricao}
                      <FaInfoCircle
                        title="Saiba mais sobre esta integração"
                        className="ml-1 text-amarelo"
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        className="flex-1 px-2 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition text-sm"
                        onClick={() => handleAbrirModal(integ)}
                      >
                        Configurar
                      </button>
                      <button
                        className="p-2 rounded-xl border border-zinc-600 text-zinc-400 hover:bg-red-700/20 transition"
                        title="Remover integração"
                        onClick={() => alert("Remover integração futura!")}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* MODAL DE CONFIGURAÇÃO */}
        {modal && camposIntegracoes[modal.id] && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-2">
            <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-2xl p-6">
              <button
                className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                onClick={handleFecharModal}
              >
                <FaTimes size={24} />
              </button>
              <div className="mb-2 text-xl font-bold text-amarelo">
                {camposIntegracoes[modal.id]!.titulo}
              </div>
              <div className="mb-1 text-zinc-100">{camposIntegracoes[modal.id]!.descricao}</div>
              <div
                className="mb-2 text-zinc-400 text-sm"
                dangerouslySetInnerHTML={{ __html: camposIntegracoes[modal.id]!.instrucoes }}
              />
              <form
                className="space-y-4 mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSalvar();
                }}
              >
                {camposIntegracoes[modal.id]!.campos.map((campo: CampoIntegracao) => (
                  <div key={campo.name} className="flex flex-col">
                    <label className="text-sm text-zinc-200 font-semibold mb-1">
                      {campo.label}
                    </label>
                    <input
                      className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-amarelo"
                      type={campo.type}
                      name={campo.name}
                      value={campos[campo.name] || ""}
                      onChange={(e) => handleCampoChange(campo.name, e.target.value)}
                      placeholder={campo.placeholder}
                      autoComplete="off"
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 font-semibold"
                    onClick={handleFecharModal}
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 font-bold"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="text-center mt-10 text-zinc-400 text-xs">
          Painel exclusivo para gestão das integrações estratégicas do SaaS Fut7Pro.
        </div>
      </main>
    </>
  );
}
