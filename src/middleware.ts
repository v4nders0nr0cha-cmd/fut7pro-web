import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Configuração de rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por minuto
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Função para verificar rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRateLimit = rateLimitMap.get(ip);

  if (!userRateLimit || now > userRateLimit.resetTime) {
    // Reset ou criar novo rate limit
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit excedido
  }

  // Incrementar contador
  userRateLimit.count++;
  return true;
}

// Função para limpar rate limits antigos
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Limpar rate limits a cada 5 minutos
setInterval(cleanupRateLimits, 5 * 60 * 1000);

// Rotas que requerem autenticação
const PROTECTED_ROUTES = ["/admin", "/superadmin", "/api/admin", "/api/superadmin"];

// Rotas que requerem roles específicos
const ROLE_PROTECTED_ROUTES = {
  "/admin": ["ADMIN", "SUPERADMIN", "GERENTE", "SUPORTE", "FINANCEIRO"],
  "/superadmin": ["SUPERADMIN"],
  "/api/admin": ["ADMIN", "SUPERADMIN", "GERENTE", "SUPORTE", "FINANCEIRO"],
  "/api/superadmin": ["SUPERADMIN"],
};

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/public",
  "/_next",
  "/favicon.ico",
  "/images",
  "/public",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";

  // Headers de segurança básicos
  const response = NextResponse.next();

  // Adicionar headers de segurança
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=()"
  );

  // Content-Security-Policy endurecida (ajustar domínios conforme necessário)
  const self = "'self'";
  const unsafeNone = "'none'";
  // Fontes de conexão dinâmicas (API, Sentry, Analytics)
  const connectSources = [self];
  if (process.env.NEXT_PUBLIC_API_URL) connectSources.push(process.env.NEXT_PUBLIC_API_URL);
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) connectSources.push('https://*.sentry.io');
  if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    try {
      const analyticsOrigin = new URL(process.env.NEXT_PUBLIC_ANALYTICS_URL).origin;
      connectSources.push(analyticsOrigin);
    } catch {}
  }

  const csp = [
    `default-src ${self}`,
    `base-uri ${self}`,
    `font-src ${self} data:`,
    `form-action ${self}`,
    `frame-ancestors ${unsafeNone}`,
    `img-src ${self} data: blob:`,
    `object-src ${unsafeNone}`,
    `script-src ${self}`,
    `script-src-attr ${unsafeNone}`,
    // TODO: remover 'unsafe-inline' quando todos os estilos inline forem eliminados
    `style-src ${self} 'unsafe-inline'`,
    `connect-src ${connectSources.join(' ')}`,
    `worker-src ${self} blob:`,
    `manifest-src ${self}`,
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // HSTS (somente quando em produção e usando HTTPS)
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Verificar se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  if (isPublicRoute) {
    return response;
  }

  // Rate limiting para APIs
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": (Date.now() + RATE_LIMIT_WINDOW).toString(),
          },
        }
      );
    }

    // Adicionar headers de rate limit
    const userRateLimit = rateLimitMap.get(ip);
    if (userRateLimit) {
      response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        (RATE_LIMIT_MAX_REQUESTS - userRateLimit.count).toString()
      );
      response.headers.set("X-RateLimit-Reset", userRateLimit.resetTime.toString());
    }
  }

  // Proteção contra ataques de força bruta em rotas de autenticação
  if (pathname.startsWith("/api/auth/")) {
    const authRateLimit = 5; // 5 tentativas por minuto para auth
    const authKey = `auth_${ip}`;

    if (!checkRateLimit(authKey)) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many authentication attempts. Please try again later.",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    try {
      // Verificar token JWT
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        // Redirecionar para login se não autenticado
        if (pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        } else if (pathname.startsWith("/superadmin")) {
          return NextResponse.redirect(new URL("/superadmin/login", request.url));
        } else {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      // Verificar role se necessário
      const userRole = token.role as string;
      const requiredRoles = ROLE_PROTECTED_ROUTES[pathname as keyof typeof ROLE_PROTECTED_ROUTES];

      if (requiredRoles && !requiredRoles.includes(userRole)) {
        // Redirecionar para página de não autorizado
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Adicionar informações do usuário aos headers para uso no backend
      response.headers.set("X-User-ID", token.id as string);
      response.headers.set("X-User-Role", userRole);
      response.headers.set("X-User-Tenant", token.tenantId as string);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro na verificação de autenticação:", error);
      }

      // Em caso de erro, redirecionar para login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Proteção contra ataques de enumeração de usuários
  const userAgent = request.headers.get("user-agent") || "";
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /w3af/i,
    /acunetix/i,
    /netsparker/i,
    /appscan/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    return new NextResponse(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Proteção contra ataques de path traversal
  if (pathname.includes("..") || pathname.includes("//")) {
    return new NextResponse(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
