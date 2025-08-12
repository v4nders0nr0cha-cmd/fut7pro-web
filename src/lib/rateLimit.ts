// src/lib/rateLimit.ts
// Sistema de Rate Limiting para APIs

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();

    const key = this.getKey(identifier);
    const now = Date.now();

    if (!this.store[key] || this.store[key].resetTime < now) {
      // Primeira requisição ou janela expirada
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[key].resetTime,
      };
    }

    if (this.store[key].count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime,
      };
    }

    // Incrementar contador
    this.store[key].count++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime,
    };
  }
}

// Instância global do rate limiter
const rateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
});

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  return rateLimiter.isAllowed(identifier);
}

// Helper para extrair IP do request
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback para desenvolvimento
  return "localhost";
}

// Middleware para Next.js API routes
export function withRateLimit(handler: (req: Request, ...args: unknown[]) => Promise<Response>) {
  return async (req: Request, ...args: unknown[]) => {
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Muitas requisições. Tente novamente em alguns minutos.",
          resetTime: rateLimitResult.resetTime,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Adicionar headers de rate limit à resposta
    const response = await handler(req, ...args);

    if (response instanceof Response) {
      response.headers.set("X-RateLimit-Limit", "100");
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
      response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());
    }

    return response;
  };
}
