import { createServer } from "node:http";
import { Server } from "socket.io";
export function createRealtimeServer(origin: string) {
  const httpServer = createServer((request, response) => {
    if (request.url === "/health/live" && request.method === "GET") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          status: "ok",
          service: "realtime",
          stage: "foundation",
          multiplayer: false,
        }),
      );
      return;
    }
    response.writeHead(404);
    response.end();
  });
  const io = new Server(httpServer, {
    cors: { origin, credentials: true },
    maxHttpBufferSize: 16_384,
    allowRequest: (request, callback) =>
      callback(null, request.headers.origin === origin),
    serveClient: false,
  });
  // Fail closed: nenhum cliente acessa salas antes da autenticação da ETAPA 1.
  io.use((_socket, next) => next(new Error("AUTH_NOT_IMPLEMENTED")));
  return { httpServer, io };
}
