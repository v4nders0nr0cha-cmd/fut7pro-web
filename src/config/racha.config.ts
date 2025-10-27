// src/config/racha.config.ts
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const SITE_NAME = process.env.SITE_NAME || "Fut7Pro";
const SUPPORT_EMAIL = process.env.SMTP_USER || "suporte@fut7pro.com";

export const rachaConfig = {
  nome: SITE_NAME,
  slug: "fut7pro",
  logo: "/images/logos/logo_fut7pro.png", // caminho correto com underline
  cores: {
    primaria: "#FFCC00",
    secundaria: "#1A1A1A",
  },
  frases: {
    principal: "Fut7Pro e o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos.",
    slogan: "Fut7Pro - O jogo comeca aqui.",
  },
  urls: {
    site: APP_URL,
    api: API_URL,
    suporte: SUPPORT_EMAIL,
  },
  seo: {
    title: `${SITE_NAME} - Sistema para Racha, Fut7 e Futebol Amador`,
    description:
      "Fut7Pro e o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Gerencie seu racha, estatisticas, partidas e muito mais.",
    keywords: "fut7pro, racha, futebol 7, sistema, estatisticas, partidas, futebol amador",
  },
  storage: {
    configKey: "fut7pro-config",
  },
};
