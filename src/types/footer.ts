export type FooterCampo = {
  nome?: string;
  endereco?: string;
  mapa?: string;
};

export type FooterConfig = {
  legenda?: string;
  campo?: FooterCampo;
  topicosExtras?: string[];
  topicosOcultos?: string[];
};

export type FooterConfigResponse = {
  data: FooterConfig;
};
