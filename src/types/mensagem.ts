export interface MensagemContato {
  id: string;
  rachaId: string; // ou number, conforme seu banco
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  dataEnvio: string; // ISO date
  status: "novo" | "lido" | "respondido";
}
