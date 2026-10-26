import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "../../../../packages/domain/src/errors";
import { appOrigin } from "./core";
export const cookieName = () =>
  appOrigin().startsWith("https:") ? "__Host-ct-session" : "ct-session";
export const requestToken = (request: NextRequest) =>
  request.cookies.get(cookieName())?.value;
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
export function sessionCookie(
  response: NextResponse,
  token: string,
  expires: Date,
) {
  response.cookies.set(cookieName(), token, {
    httpOnly: true,
    secure: appOrigin().startsWith("https:"),
    sameSite: "lax",
    path: "/",
    expires,
  });
  return response;
}
export async function readMutation(request: NextRequest): Promise<unknown> {
  if (
    request.headers.get("origin") !== appOrigin() ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new DomainError(403, "CSRF", "Origem da solicitação não autorizada.");
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new DomainError(415, "CONTENT_TYPE", "Envie dados JSON.");
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 16384) {
      await reader.cancel();
      throw new DomainError(413, "BODY_TOO_LARGE", "Solicitação muito grande.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new DomainError(400, "INVALID_JSON", "JSON inválido.");
  }
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return json(
      {
        error: {
          code: "VALIDATION",
          message: "Confira os campos informados.",
          fields: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      400,
    );
  if (error instanceof DomainError)
    return json(
      { error: { code: error.code, message: error.message } },
      error.status,
    );
  // Sem dados pessoais, SQL, senhas ou tokens nos logs/respostas.
  console.error(
    "API_INTERNAL_ERROR",
    error instanceof Error ? error.name : "UnknownError",
  );
  return json(
    {
      error: {
        code: "INTERNAL",
        message: "Não foi possível concluir a solicitação. Tente novamente.",
      },
    },
    500,
  );
}
