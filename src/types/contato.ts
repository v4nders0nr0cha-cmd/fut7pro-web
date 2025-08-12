export interface MensagemContato {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  data: string;
  rachaSlug: string; // Fundamental para multi-rachas
}
