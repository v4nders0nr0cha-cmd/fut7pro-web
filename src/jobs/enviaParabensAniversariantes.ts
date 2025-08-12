// src/jobs/enviaParabensAniversariantes.ts

import { getAniversariantesDoDia } from "@/services/aniversariantesService";
import { enviarMensagemWhatsapp, enviarEmail } from "@/services/envioMensagens";
import cron from "node-cron";

// Função que busca aniversariantes e envia as felicitações
export async function rotinaParabens() {
  const hoje = new Date();
  const lista = await getAniversariantesDoDia(hoje);

  for (const user of lista) {
    const mensagem = `Feliz aniversário, ${user.nome}! Que seu novo ano seja repleto de gols e vitórias, dentro e fora de campo! 🎉 – Fut7Pro`;

    if (user.whatsapp) {
      await enviarMensagemWhatsapp(user.whatsapp, mensagem);
    } else if (user.email) {
      await enviarEmail(user.email, "Feliz aniversário!", mensagem);
    }
    // Futuramente, registre o envio no banco/log se quiser.
  }
}

// Agenda para rodar automaticamente todo dia às 8h (horário de Brasília)
cron.schedule("0 8 * * *", rotinaParabens, { timezone: "America/Sao_Paulo" });

export default rotinaParabens;
