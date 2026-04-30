function stringifyAuthError(error: unknown): string {
  if (!error) return "";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.details;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return String(error ?? "");
}

export function getHumanAuthErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir esta ação agora. Tente novamente em alguns instantes."
) {
  const rawMessage = stringifyAuthError(error);
  const message = rawMessage.toLowerCase();

  if (
    message.includes("bad request") ||
    message.includes("payload") ||
    message.includes("dados invalidos") ||
    message.includes("dados inválidos") ||
    message.includes("validation failed")
  ) {
    return "Não foi possível concluir a solicitação. Confira os dados e tente novamente.";
  }

  if (
    message.includes("invalid token") ||
    message.includes("token invalid") ||
    message.includes("token invalido") ||
    message.includes("token inválido") ||
    message.includes("link invalido") ||
    message.includes("link inválido")
  ) {
    return "Este link não é mais válido. Solicite um novo link para continuar.";
  }

  if (message.includes("expired") || message.includes("expirado") || message.includes("expirou")) {
    return "Este link expirou. Solicite um novo link para continuar.";
  }

  if (
    message.includes("codigo invalido") ||
    message.includes("código inválido") ||
    message.includes("codigo otp invalido") ||
    message.includes("código otp inválido")
  ) {
    return "O código informado não está correto ou expirou. Confira o e-mail e tente novamente.";
  }

  if (
    message.includes("credenciais invalidas") ||
    message.includes("credenciais inválidas") ||
    message.includes("senha incorreta")
  ) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (message.includes("unauthorized") || message.includes("não autorizado")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (message.includes("forbidden") || message.includes("sem permiss")) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch")
  ) {
    return "Não foi possível conectar ao Fut7Pro. Verifique sua internet e tente novamente.";
  }

  if (message.includes("solicita") && message.includes("pendente")) {
    return "Sua solicitação para entrar neste racha já foi enviada. Aguarde a aprovação do administrador.";
  }

  if (message.includes("ja faz parte") || message.includes("já faz parte")) {
    return "Você já faz parte deste racha. Entre para acompanhar partidas, estatísticas e informações do seu perfil.";
  }

  if (message.includes("aprovad")) {
    return "Sua entrada neste racha foi aprovada. Agora você já pode acessar sua área de atleta.";
  }

  if (
    message.includes("request failed") ||
    message.includes("internal server error") ||
    message.includes("erro 500")
  ) {
    return "Não foi possível concluir esta ação agora. Tente novamente em alguns instantes.";
  }

  return fallback;
}
