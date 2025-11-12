// src/services/aniversariantesService.ts

import { db } from "@/lib/db";

// Função para buscar aniversariantes do dia atual.
// Futuramente troque para PrismaClient real, se desejar.
export async function getAniversariantesDoDia(data = new Date()) {
  const mes = data.getMonth() + 1;
  const dia = data.getDate();

  const usuarios = await db.usuario.findMany({
    where: {
      ativo: true,
    },
  });

  const suffix = `-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;

  return usuarios.filter((usuario) =>
    typeof usuario.dataNascimento === "string" ? usuario.dataNascimento.endsWith(suffix) : false
  );
}
