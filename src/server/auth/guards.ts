import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
type AppSession = Session & {
  user: Session["user"] & {
    role?: string | null;
    tenantSlug?: string | null;
    rachaSlug?: string | null;
  };
};

import { authOptions } from "@/server/auth/options";
import { isAdminRole, normalizeAdminRole } from "./roles";

type MaybeString = string | null | undefined;

type BodyLike = Record<string, unknown> | undefined;

function pickSlug(value: MaybeString): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveRachaSlugFromApiReq(req: NextApiRequest): string | null {
  const headerSlug = pickSlug(req.headers["x-tenant-slug"] as MaybeString);
  if (headerSlug) return headerSlug;

  const querySlug = pickSlug(typeof req.query?.slug === "string" ? req.query.slug : undefined);
  if (querySlug) return querySlug;

  const body = req.body as BodyLike;
  if (body && typeof body === "object") {
    const rachaSlug = pickSlug(typeof body.rachaSlug === "string" ? body.rachaSlug : undefined);
    if (rachaSlug) return rachaSlug;
  }

  return null;
}

export function resolveRachaSlugFromAppReq(req: NextRequest): string | null {
  const headerSlug = pickSlug(req.headers.get("x-tenant-slug"));
  if (headerSlug) return headerSlug;

  const url = new URL(req.url);
  const querySlug = pickSlug(url.searchParams.get("slug"));
  if (querySlug) return querySlug;

  return null;
}

export function withAdminApiRoute(
  handler: NextApiHandler,
  opts: { mustOwnRacha?: boolean } = {}
): NextApiHandler {
  const { mustOwnRacha = false } = opts;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = (await getServerSession(req, res, authOptions)) as AppSession | null;

    const role = normalizeAdminRole(session?.user?.role);
    if (!role || !isAdminRole(role)) {
      return res.status(403).json({ error: "Sem permissao" });
    }

    if (mustOwnRacha) {
      const slug = resolveRachaSlugFromApiReq(req);
      if (!slug || session?.user?.rachaSlug !== slug) {
        return res.status(403).json({ error: "Racha invalido para este usuario" });
      }
    }

    return handler(req, res);
  };
}

export function withAdminAppRoute<T extends (req: NextRequest) => Promise<Response> | Response>(
  handler: T,
  opts: { mustOwnRacha?: boolean } = {}
) {
  const { mustOwnRacha = false } = opts;

  return async (req: NextRequest) => {
    const session = (await getServerSession(authOptions)) as AppSession | null;

    const role = normalizeAdminRole(session?.user?.role);
    if (!role || !isAdminRole(role)) {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
    }

    if (mustOwnRacha) {
      const slug = resolveRachaSlugFromAppReq(req);
      if (slug && session?.user?.rachaSlug !== slug) {
        return NextResponse.json({ error: "Racha invalido para este usuario" }, { status: 403 });
      }
    }

    return handler(req);
  };
}
