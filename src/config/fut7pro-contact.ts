export const FUT7PRO_OFFICIAL_WHATSAPP_DISPLAY = "+55 88 99243-1113";
export const FUT7PRO_OFFICIAL_WHATSAPP_NUMBER = "5588992431113";
export const FUT7PRO_OFFICIAL_WHATSAPP_URL = `https://wa.me/${FUT7PRO_OFFICIAL_WHATSAPP_NUMBER}`;
export const FUT7PRO_OFFICIAL_PHONE_TEL = `tel:+${FUT7PRO_OFFICIAL_WHATSAPP_NUMBER}`;
export const FUT7PRO_OFFICIAL_CONTACT_EMAIL = "contato@fut7pro.com.br";
export const FUT7PRO_OFFICIAL_COMMERCIAL_EMAIL = "social@fut7pro.com.br";
export const FUT7PRO_OFFICIAL_SUPPORT_EMAIL = "suporte@fut7pro.com.br";

export function buildFut7ProOfficialWhatsAppUrl(message?: string) {
  if (!message) return FUT7PRO_OFFICIAL_WHATSAPP_URL;

  return `${FUT7PRO_OFFICIAL_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
