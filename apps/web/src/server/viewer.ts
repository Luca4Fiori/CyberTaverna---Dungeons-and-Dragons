import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./core";
import { cookieName } from "./http";
import { DomainError } from "../../../../packages/domain/src/errors";
export async function viewer() {
  const token = (await cookies()).get(cookieName())?.value;
  try {
    return { user: await auth().me(token), token };
  } catch (error) {
    if (error instanceof DomainError && error.status === 401)
      redirect("/login");
    throw error;
  }
}
