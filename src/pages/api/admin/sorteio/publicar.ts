import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

type JogadorInput = {
  id?: string;
  nome?: string;
  posicao?: string;
  foto?: string | null;
  apelido?: string | null;
  status?: string | null;
};

type TimeInput = {
  id?: string;
  nome?: string;
  jogadores?: JogadorInput[];
};

type JogoInput = {
  ordem?: number;
  tempo?: number;
  timeA?: { id?: string; nome?: string };
  timeB?: { id?: string; nome?: string };
  destaquesA?: string[];
  destaquesB?: string[];
};

type ConfigInput = {
  duracaoPartidaMin?: number;
  horarioInicio?: string;
};

type PublishRequestBody = {
  rachaId?: string;
  data?: string;
  horarioBase?: string;
  jogos?: JogoInput[];
  times?: TimeInput[];
  config?: ConfigInput;
};

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTimeToMinutes(value?: string) {
  if (!value) return null;
  const match = /^([0-2]?\d):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) return null;
  return hours * 60 + minutes;
}

function minutesToTime(total: number) {
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function serializeJogadores(jogadores: JogadorInput[] | undefined) {
  const normalized = (jogadores ?? []).map((jogador, index) => ({
    id: jogador.id || `temp-${index}`,
    nome: jogador.nome ?? "",
    posicao: jogador.posicao ?? null,
    foto: jogador.foto ?? null,
    apelido: jogador.apelido ?? null,
    status: jogador.status ?? "titular",
  }));
  return JSON.stringify(normalized);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as PublishRequestBody;
  const rachaId = body.rachaId;

  if (!rachaId || typeof rachaId !== "string") {
    return res.status(400).json({ error: "rachaId is required" });
  }

  if (!Array.isArray(body.jogos) || body.jogos.length === 0) {
    return res.status(400).json({ error: "jogos is required" });
  }

  if (!Array.isArray(body.times) || body.times.length === 0) {
    return res.status(400).json({ error: "times is required" });
  }

  const baseDate = parseDate(body.data) ?? new Date();
  const baseMinutesFromTime =
    parseTimeToMinutes(body.horarioBase) ??
    parseTimeToMinutes(body.config?.horarioInicio ?? "") ??
    (baseDate.getHours() * 60 + baseDate.getMinutes() || 19 * 60); // fallback to 19:00 when date has no time info

  const matchDuration =
    body.config?.duracaoPartidaMin && body.config.duracaoPartidaMin > 0
      ? body.config.duracaoPartidaMin
      : 15;

  const timesMap = new Map<string, TimeInput>();
  body.times.forEach((time) => {
    if (time?.id) {
      timesMap.set(time.id, time);
    }
  });

  const startDay = startOfDay(baseDate);
  const endDay = endOfDay(baseDate);

  try {
    const created = await prisma.$transaction(async (tx) => {
      await tx.partida.deleteMany({
        where: {
          rachaId,
          data: {
            gte: startDay,
            lte: endDay,
          },
        },
      });

      const records = await Promise.all(
        body.jogos!.map(async (jogo, index) => {
          const timeA = jogo.timeA?.id ? timesMap.get(jogo.timeA.id) : null;
          const timeB = jogo.timeB?.id ? timesMap.get(jogo.timeB.id) : null;

          if (!jogo.timeA?.nome || !jogo.timeB?.nome) {
            throw new Error("timeA/timeB nome is required");
          }

          const offset =
            (typeof jogo.ordem === "number" && jogo.ordem > 0 ? jogo.ordem - 1 : index) *
            matchDuration;

          const horarioMinutes = baseMinutesFromTime + offset;
          const horario = minutesToTime(horarioMinutes);

          const partidaDate = new Date(baseDate);
          partidaDate.setHours(0, 0, 0, 0);
          partidaDate.setMinutes(horarioMinutes);

          return tx.partida.create({
            data: {
              rachaId,
              data: partidaDate,
              horario,
              local: null,
              timeA: jogo.timeA.nome,
              timeB: jogo.timeB.nome,
              golsTimeA: 0,
              golsTimeB: 0,
              jogadoresA: serializeJogadores(timeA?.jogadores),
              jogadoresB: serializeJogadores(timeB?.jogadores),
              destaquesA: jogo.destaquesA ? JSON.stringify(jogo.destaquesA) : null,
              destaquesB: jogo.destaquesB ? JSON.stringify(jogo.destaquesB) : null,
              finalizada: false,
            },
          });
        })
      );

      return records;
    });

    return res.status(200).json({ ok: true, count: created.length });
  } catch (error) {
    console.error("POST /api/admin/sorteio/publicar failed", error);
    const message = error instanceof Error ? error.message : "failed to publish matches";
    return res.status(500).json({ error: message });
  }
}
