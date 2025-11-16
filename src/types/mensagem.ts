export interface MensagemContato {
  id: string;
  slug: string; // tenant slug associado
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  dataEnvio: string; // ISO date
  status: "novo" | "lido" | "respondido";
}
