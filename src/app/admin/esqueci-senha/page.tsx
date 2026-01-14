import EsqueciSenhaClient from "./EsqueciSenhaClient";

export const metadata = {
  title: "Recuperar senha | Fut7Pro",
  description: "Recupere o acesso ao painel Fut7Pro com um link enviado por e-mail.",
  robots: { index: false, follow: false },
};

export default function EsqueciSenhaPage() {
  return <EsqueciSenhaClient />;
}
