import Link from "next/link";
import {
  FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL,
  FUT7PRO_OFFICIAL_SUPPORT_EMAIL,
  FUT7PRO_OFFICIAL_WHATSAPP_DISPLAY,
  buildFut7ProOfficialWhatsAppUrl,
} from "@/config/fut7pro-contact";
import { FUT7PRO_SOCIAL_LINKS } from "@/config/fut7pro-socials";

export default function ContatoPage() {
  const supportWhatsappUrl = buildFut7ProOfficialWhatsAppUrl(
    "Olá! Preciso de atendimento oficial da Fut7Pro."
  );

  return (
    <main className="container mx-auto px-4 py-8 prose prose-invert">
      <h1>Contato</h1>
      <p>
        Precisa de ajuda com o Fut7Pro, suporte técnico, comercial ou parcerias? Fale com o nosso
        time pelos canais oficiais abaixo.
      </p>

      <h2>Canais oficiais Fut7Pro</h2>
      <ul>
        <li>
          WhatsApp oficial:{" "}
          <a href={supportWhatsappUrl} target="_blank" rel="noopener noreferrer">
            {FUT7PRO_OFFICIAL_WHATSAPP_DISPLAY}
          </a>
        </li>
        <li>
          Suporte técnico:{" "}
          <a href={`mailto:${FUT7PRO_OFFICIAL_SUPPORT_EMAIL}`}>
            {FUT7PRO_OFFICIAL_SUPPORT_EMAIL}
          </a>
        </li>
        <li>
          Comercial e parcerias:{" "}
          <a href={`mailto:${FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL}`}>
            {FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL}
          </a>
        </li>
      </ul>

      <h2>Redes oficiais Fut7Pro</h2>
      <ul>
        {FUT7PRO_SOCIAL_LINKS.map((social) => (
          <li key={social.label}>
            {social.label}:{" "}
            <a href={social.url} target="_blank" rel="noopener noreferrer">
              {social.handle}
            </a>
          </li>
        ))}
      </ul>

      <h2>Contato do seu racha</h2>
      <p>
        Os canais específicos de cada racha (WhatsApp, e-mail e redes sociais do administrador) são
        publicados na página de contatos do próprio racha.
      </p>
      <p>
        <Link href="/sobre-nos/contatos">Acessar contatos do racha</Link>
      </p>

      <h2>Prazo de resposta</h2>
      <p>
        Nosso time atende em horário comercial e responde por ordem de prioridade. Em chamados
        críticos de acesso, faça contato pelo e-mail de suporte.
      </p>
    </main>
  );
}
