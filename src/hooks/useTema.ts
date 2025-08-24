import { rachaConfig } from "@/config/racha.config";

export function useTema() {
  return {
    nome: rachaConfig?.nome || "Fut7Pro",
    logo: rachaConfig?.logo || "/images/logos/logo_fut7pro.png",
    corPrimaria: rachaConfig?.cores?.primária || "#FFCC00",
    corSecundaria: rachaConfig?.cores?.secundária || "#1A1A1A",
    frases: rachaConfig?.frases || {
      principal:
        "Fut7Pro é o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos.",
      secundaria: "Fut7Pro – O jogo começa aqui.",
    },
    endereco:
      "endereco" in rachaConfig && typeof rachaConfig.endereco === "string"
        ? rachaConfig.endereco
        : "Endereço não informado",
  };
}
