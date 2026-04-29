import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

function readRecord(value: unknown) {
  return typeof value === "object" && value ? (value as Record<string, unknown>) : null;
}

export function sanitizePublicAuthErrorPayload(
  parsed: unknown,
  fallback = "Não foi possível concluir esta ação agora. Tente novamente em alguns instantes."
) {
  const record = readRecord(parsed);
  const nestedMessage = readRecord(record?.message);
  const nestedError = readRecord(record?.error);
  const code =
    (typeof record?.code === "string" && record.code) ||
    (typeof nestedMessage?.code === "string" && nestedMessage.code) ||
    (typeof nestedError?.code === "string" && nestedError.code) ||
    "";
  const rawMessage =
    (typeof nestedMessage?.message === "string" && nestedMessage.message) ||
    (typeof record?.message === "string" && record.message) ||
    (typeof record?.error === "string" && record.error) ||
    parsed;

  return {
    ok: false,
    ...(code ? { code } : {}),
    message: getHumanAuthErrorMessage(rawMessage, fallback),
  };
}
