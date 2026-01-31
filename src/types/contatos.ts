export type ContatosConfig = {
  tituloPatrocinio?: string;
  descricaoPatrocinio?: string;
  email?: string;
  whatsapp?: string;
  endereco?: string;
};

export type ContatosConfigResponse = {
  data: ContatosConfig;
};
