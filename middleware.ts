import { withAuth } from "next-auth/middleware";

import { normalizeAdminRole } from "@/server/auth/roles";

export default withAuth(() => {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      const needsAdmin = path.startsWith("/admin") || path.startsWith("/api/admin");
      if (!needsAdmin) {
        return true;
      }

      const adminRole = normalizeAdminRole(token?.role as string | undefined);
      return adminRole !== null;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
