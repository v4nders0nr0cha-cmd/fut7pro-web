import Link from "next/link";

export default function ContatoPage() {
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
          Suporte técnico: <a href="mailto:suporte@fut7pro.com.br">suporte@fut7pro.com.br</a>
        </li>
        <li>
          Comercial e parcerias: <a href="mailto:social@fut7pro.com.br">social@fut7pro.com.br</a>
        </li>
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
