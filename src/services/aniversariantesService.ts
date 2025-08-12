// src/services/aniversariantesService.ts

import { db } from "@/lib/db";

// Função para buscar aniversariantes do dia atual.
// Futuramente troque para PrismaClient real, se desejar.
export async function getAniversariantesDoDia(data = new Date()) {
  const mes = data.getMonth() + 1;
  const dia = data.getDate();

  return db.usuario.findMany({
    where: {
      ativo: true,
      dataNascimento: {
        // Checa se termina com -MM-DD (aniversariante do dia)
        endsWith: `-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`,
      },
    },
  });
}
