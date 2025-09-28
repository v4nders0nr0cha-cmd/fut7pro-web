import { prisma } from '@/server/prisma';
import type { SuperadminUsuarioResumo, SuperadminUsuariosSnapshot } from '@/types/superadmin';

function mapUsuario(usuario: {
  id: string;
  nome: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: Date;
}): SuperadminUsuarioResumo {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    ativo: usuario.status === 'ativo',
    criadoEm: usuario.createdAt.toISOString(),
  };
}

export async function loadSuperadminUsuarios(): Promise<SuperadminUsuariosSnapshot> {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const itens: SuperadminUsuarioResumo[] = usuarios.map(mapUsuario);
  const porRole = itens.reduce<Record<string, number>>((acc, usuario) => {
    const key = usuario.role;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const ativos = itens.filter((usuario) => usuario.ativo).length;

  return {
    total: itens.length,
    ativos,
    porRole,
    itens,
  };
}
