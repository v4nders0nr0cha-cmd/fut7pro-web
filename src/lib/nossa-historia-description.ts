import { DEFAULT_NOSSA_HISTORIA } from "@/utils/schemas/nossaHistoria.schema";

export const DEFAULT_NOSSA_HISTORIA_DESCRIPTION =
  "Nossa história começou com a amizade e a paixão pelo futebol. Com o tempo, os encontros viraram tradição, dentro e fora de campo. Seguimos construindo essa história a cada jogo, com respeito, resenha e momentos compartilhados.";

// Modelo gerado pelo editor antigo. A expressão completa evita classificar como padrão
// descrições personalizadas que apenas mencionem "O racha" ou "Fundado por".
const LEGACY_EDITOR_DESCRIPTION_TEMPLATE =
  "O racha {nomeDoRacha} nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por {nomePresidente}, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const legacyEditorDescriptionPattern = new RegExp(
  `^${LEGACY_EDITOR_DESCRIPTION_TEMPLATE.split(/\{nomeDoRacha\}|\{nomePresidente\}/)
    .map(escapeRegExp)
    .join("([\\s\\S]+?)")}$`
);

export function isDefaultNossaHistoriaDescription(description?: string | null): boolean {
  const value = description?.trim();
  return (
    !value ||
    value === DEFAULT_NOSSA_HISTORIA.descricao ||
    value === DEFAULT_NOSSA_HISTORIA_DESCRIPTION ||
    legacyEditorDescriptionPattern.test(value)
  );
}
