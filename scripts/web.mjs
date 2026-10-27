// Carrega o .env raiz sem flags que o Next dev propagaria para NODE_OPTIONS.
import "dotenv/config";
await import("../node_modules/next/dist/bin/next");
