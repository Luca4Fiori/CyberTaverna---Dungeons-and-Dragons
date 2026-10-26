import { afterEach, describe, expect, it } from "vitest";
import { io as client } from "socket.io-client";
import { createRealtimeServer } from "../../apps/realtime/src/server";
describe("fundação realtime", () => {
  const servers: ReturnType<typeof createRealtimeServer>[] = [];
  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        ({ io }) =>
          new Promise<void>((resolve) => {
            void io.close(() => resolve());
          }),
      ),
    );
  });
  async function start() {
    const service = createRealtimeServer("http://localhost:3000");
    servers.push(service);
    await new Promise<void>((resolve) =>
      service.httpServer.listen(0, "127.0.0.1", resolve),
    );
    const address = service.httpServer.address();
    if (!address || typeof address === "string")
      throw new Error("Porta indisponível");
    return `http://127.0.0.1:${address.port}`;
  }
  it("expõe saúde sem alegar multiplayer funcional", async () => {
    const response = await fetch(`${await start()}/health/live`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ multiplayer: false });
  });
  it("recusa cliente sem autenticação", async () => {
    const url = await start();
    const socket = client(url, {
      transports: ["websocket"],
      extraHeaders: { origin: "http://localhost:3000" },
      reconnection: false,
    });
    try {
      const error = await new Promise<Error>((resolve, reject) => {
        socket.on("connect_error", resolve);
        socket.on("connect", () => reject(new Error("Conexão indevida")));
      });
      expect(error.message).toBe("AUTH_NOT_IMPLEMENTED");
    } finally {
      socket.disconnect();
    }
  });
  it("recusa origem não autorizada", async () => {
    const url = await start();
    const socket = client(url, {
      transports: ["websocket"],
      extraHeaders: { origin: "https://invalid.example" },
      reconnection: false,
    });
    try {
      const error = await new Promise<Error>((resolve, reject) => {
        socket.on("connect_error", resolve);
        socket.on("connect", () => reject(new Error("Origem indevida")));
      });
      expect(error.message).toBe("websocket error");
    } finally {
      socket.disconnect();
    }
  });
});
