import type { ContatosConfig } from "@/types/contatos";

export const DEFAULT_CONTATOS: Required<ContatosConfig> = {
  tituloPatrocinio: "Sua marca em destaque no nosso Racha",
  descricaoPatrocinio:
    "Empresas e patrocinadores podem divulgar sua marca nos jogos e eventos parceiros do Racha Fut7Pro, com exposição em banners, páginas e posts oficiais. Peça nosso Media Kit ou solicite mais informações pelo formulário ou pelos canais diretos!",
  email: "contato@fut7pro.com.br",
  whatsapp: "https://wa.me/5599999999999",
  endereco: "Racha Fut7Pro - São Paulo/SP",
};

const resolveText = (value: unknown, fallback: string, max: number) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length) return trimmed.slice(0, max);
  }
  const fallbackTrim = (fallback || "").trim();
  return fallbackTrim.length ? fallbackTrim.slice(0, max) : "";
};

export function resolveWhatsappLink(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

export function resolveContatosConfig(
  raw?: ContatosConfig | null,
  fallback?: Partial<ContatosConfig>
): Required<ContatosConfig> {
  const tituloFallback = fallback?.tituloPatrocinio ?? DEFAULT_CONTATOS.tituloPatrocinio;
  const descricaoFallback = fallback?.descricaoPatrocinio ?? DEFAULT_CONTATOS.descricaoPatrocinio;
  const emailFallback = fallback?.email ?? DEFAULT_CONTATOS.email;
  const whatsappFallback = fallback?.whatsapp ?? DEFAULT_CONTATOS.whatsapp;
  const enderecoFallback = fallback?.endereco ?? DEFAULT_CONTATOS.endereco;

  return {
    tituloPatrocinio: resolveText(raw?.tituloPatrocinio, tituloFallback, 80),
    descricaoPatrocinio: resolveText(raw?.descricaoPatrocinio, descricaoFallback, 800),
    email: resolveText(raw?.email, emailFallback, 80),
    whatsapp: resolveText(raw?.whatsapp, whatsappFallback, 120),
    endereco: resolveText(raw?.endereco, enderecoFallback, 160),
  };
}
