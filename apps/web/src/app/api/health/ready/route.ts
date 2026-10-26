import { database } from "@/server/core";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await database().user.count();
    return Response.json(
      { status: "ready", database: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
