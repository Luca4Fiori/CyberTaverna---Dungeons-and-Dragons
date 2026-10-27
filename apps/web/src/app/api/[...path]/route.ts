import { NextRequest } from "next/server";
import { z } from "zod";
import {
  appOrigin,
  auth,
  campaigns,
  database,
  characters,
  gameSessions,
} from "@/server/core";
import {
  failure,
  json,
  readMutation,
  requestToken,
  sessionCookie,
} from "@/server/http";
import { consumeRateLimit } from "../../../../../../packages/domain/src/auth";
import { emailSchema } from "../../../../../../packages/contracts/src/core";
import { DomainError } from "../../../../../../packages/domain/src/errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    const route = path.join("/");
    const method = request.method;
    const token = requestToken(request);
    let body: unknown = {};
    if (method !== "GET") {
      body = await readMutation(request);
      // Global protege hash de senha sem confiar em X-Forwarded-For fornecido pelo cliente.
      await consumeRateLimit(database(), "global-write", "all", 300, 60000);
      if (token)
        await consumeRateLimit(database(), "session-write", token, 120, 60000);
      if (["auth/login", "auth/register", "auth/forgot"].includes(route)) {
        const parsed = z.object({ email: emailSchema }).parse(body);
        await consumeRateLimit(
          database(),
          route,
          parsed.email,
          route === "auth/forgot" ? 3 : 10,
          15 * 60000,
        );
      }
    }
    if (route === "auth/register" && method === "POST")
      return json(await auth().register(body), 201);
    if (route === "auth/login" && method === "POST") {
      const result = await auth().login(body, token);
      return sessionCookie(json({ ok: true }), result.token, result.expiresAt);
    }
    if (route === "auth/logout" && method === "POST") {
      await auth().logout(token);
      return sessionCookie(json({ ok: true }), "", new Date(0));
    }
    if (route === "auth/forgot" && method === "POST") {
      await auth().forgot(body);
      return json({
        message:
          "Se houver uma conta ativa com esse email, você receberá instruções de recuperação.",
      });
    }
    if (route === "auth/reset" && method === "POST") {
      await auth().reset(body);
      return sessionCookie(
        json({ message: "Senha alterada. Entre novamente em sua conta." }),
        "",
        new Date(0),
      );
    }
    if (route === "me" && method === "GET") return json(await auth().me(token));
    if (route === "me" && method === "PATCH")
      return json(await auth().updateProfile(token, body));
    if (route === "campaigns" && method === "GET") {
      const page = z.coerce
        .number()
        .int()
        .min(1)
        .max(10000)
        .parse(request.nextUrl.searchParams.get("page") ?? 1);
      return json(await campaigns().list(token, page));
    }
    if (route === "campaigns" && method === "POST")
      return json(await campaigns().create(token, body), 201);
    if (route === "invites/accept" && method === "POST")
      return json(await campaigns().accept(token, body));
    if (path[0] === "campaigns" && path[1]) {
      const id = path[1];
      if (
        path.length === 3 &&
        path[2] === "character-settings" &&
        method === "PATCH"
      )
        return json(await characters().configure(token, id, body));
      if (path.length === 3 && path[2] === "characters" && method === "POST")
        return json(await characters().create(token, id, body), 201);
      if (path.length === 3 && path[2] === "characters" && method === "GET") {
        const page = z.coerce
          .number()
          .int()
          .min(1)
          .max(10000)
          .parse(request.nextUrl.searchParams.get("page") ?? 1);
        return json(await characters().list(token, id, page));
      }
      if (
        path.length === 4 &&
        path[2] === "characters" &&
        path[3] &&
        method === "GET"
      )
        return json(await characters().get(token, id, path[3]));
      if (
        path.length === 4 &&
        path[2] === "characters" &&
        path[3] &&
        method === "PATCH"
      )
        return json(await characters().update(token, id, path[3], body));
      if (path.length === 3 && path[2] === "sessions" && method === "GET")
        return json(await gameSessions().list(token, id));
      if (path.length === 3 && path[2] === "sessions" && method === "POST")
        return json(await gameSessions().create(token, id, body), 201);
      if (
        path.length === 4 &&
        path[2] === "sessions" &&
        path[3] &&
        method === "GET"
      )
        return json(await gameSessions().get(token, id, path[3]));
      if (
        path.length === 4 &&
        path[2] === "sessions" &&
        path[3] &&
        method === "PATCH"
      )
        return json(await gameSessions().status(token, id, path[3], body));
      if (
        path.length === 5 &&
        path[2] === "sessions" &&
        path[3] &&
        path[4] === "join" &&
        method === "POST"
      )
        return json(await gameSessions().join(token, id, path[3], body));
      if (path.length === 2 && method === "GET")
        return json(await campaigns().detail(token, id));
      if (path.length === 2 && method === "PATCH")
        return json(await campaigns().update(token, id, body));
      if (path.length === 3 && path[2] === "invites" && method === "GET")
        return json(await campaigns().invites(token, id));
      if (path.length === 3 && path[2] === "invites" && method === "POST") {
        const invite = await campaigns().invite(token, id, body);
        return json(
          { ...invite, link: `${appOrigin()}/convites#${invite.token}` },
          201,
        );
      }
      if (
        path.length === 4 &&
        path[2] === "invites" &&
        path[3] &&
        method === "DELETE"
      ) {
        await campaigns().revoke(token, id, path[3]);
        return json({ ok: true });
      }
    }
    throw new DomainError(404, "NOT_FOUND", "Endpoint não encontrado.");
  } catch (error) {
    return failure(error);
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
