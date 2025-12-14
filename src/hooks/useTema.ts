import { rachaConfig } from "@/config/racha.config";
import { useBranding } from "./useBranding";

export function useTema() {
  const { nome, logo } = useBranding({ scope: "public" });
  const cores = (rachaConfig as any)?.cores || {};

  return {
    nome,
    logo,
    corPrimaria: cores.primaria || cores["prim\u00e1ria"] || "#FFCC00",
    corSecundaria: cores.secundaria || cores["secund\u00e1ria"] || "#1A1A1A",
    frases: rachaConfig?.frases || {
      principal:
        "Fut7Pro \u00e9 o primeiro sistema do mundo focado 100% no Futebol 7 entre amigos.",
      secundaria: "Fut7Pro - O jogo come\u00e7a aqui.",
    },
    endereco:
      "endereco" in rachaConfig && typeof (rachaConfig as any).endereco === "string"
        ? (rachaConfig as any).endereco
        : "Endere\u00e7o n\u00e3o informado",
  };
}
