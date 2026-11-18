// Ephemeral TLS transport for the existing isolated UI fixture.
import https from "node:https";
import http from "node:http";
import fs from "node:fs";

if (
  process.env.ADMIN_SMOKE_FIXTURE !== "1" ||
  process.env.PLAYWRIGHT_BASE_URL !== "https://127.0.0.1:3443"
)
  throw new Error("TLS fixture requires the isolated loopback environment.");
const server = https.createServer(
  {
    key: fs.readFileSync(process.env.FIXTURE_TLS_KEY),
    cert: fs.readFileSync(process.env.FIXTURE_TLS_CERT),
  },
  (request, response) => {
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path: request.url,
        method: request.method,
        headers: {
          ...request.headers,
          "x-forwarded-proto": "https",
          "x-forwarded-host": "127.0.0.1:3443",
        },
      },
      (result) => {
        response.writeHead(result.statusCode ?? 502, result.headers);
        result.pipe(response);
      }
    );
    upstream.on("error", () => {
      response.writeHead(502);
      response.end("Local fixture unavailable");
    });
    request.pipe(upstream);
  }
);
server.listen(3443, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
