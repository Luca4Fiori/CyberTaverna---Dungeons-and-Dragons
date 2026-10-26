import { realtimeEnvironmentSchema } from "../../../packages/contracts/src/index";
import { createRealtimeServer } from "./server";
const env = realtimeEnvironmentSchema.parse(process.env);
const { httpServer, io } = createRealtimeServer(env.WEB_ORIGIN);
httpServer.listen(env.REALTIME_PORT, "127.0.0.1", () => {
  console.info(
    `CT RPG realtime: http://localhost:${env.REALTIME_PORT} (fundação; conexões autenticadas pendentes)`,
  );
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void io.close(() => process.exit(0));
  });
