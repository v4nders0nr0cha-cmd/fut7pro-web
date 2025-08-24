// src/app/api/admin/rachas/route.ts

import { NextRequest, NextResponse } from "next/server";

interface Racha {
  id: string;
  nome: string;
  slug: string;
}

let rachas: Racha[] = [];

// GET: Lista todos os rachas
export async function GET() {
  // Se precisar de autenticação, coloque aqui (deixe liberado para teste)
  return NextResponse.json(rachas, { status: 200 });
}

// POST: Cria novo racha
export async function POST(req: Request) {
  // Pega os dados do body
  const data = await req.json();

  // Permite cadastro SEM autenticação se não existir racha ainda (bootstrap SaaS)
  if (rachas.length === 0) {
    // Cria o primeiro racha
    const novoRacha = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      ativo: true,
    };
    rachas.push(novoRacha);
    return NextResponse.json(novoRacha, { status: 201 });
  }

  // Aqui você poderia exigir autenticação (exemplo: retorna erro para demais POSTs)
  return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
}

// Opcional: PUT e DELETE para update/remover (adapte se quiser)
