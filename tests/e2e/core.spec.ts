import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { testDatabase } from "../database";
const origin = "http://localhost:3100";
const password = "Senha-segura-teste-123";
const test = base.extend<{ run: string }>({
  run: async ({}, provide) => {
    const run = randomUUID();
    try {
      await provide(run);
    } finally {
      const db = testDatabase();
      try {
        const users = await db.user.findMany({
          where: { email: { startsWith: `e2e-${run}` } },
          select: { id: true },
        });
        const ids = users.map((user) => user.id);
        const memberships = await db.campaignMember.findMany({
          where: { userId: { in: ids }, role: "GM" },
          select: { campaignId: true },
        });
        const campaigns = memberships.map((member) => member.campaignId);
        await db.auditLog.deleteMany({
          where: {
            OR: [{ actorId: { in: ids } }, { campaignId: { in: campaigns } }],
          },
        });
        await db.campaign.deleteMany({ where: { id: { in: campaigns } } });
        await db.user.deleteMany({ where: { id: { in: ids } } });
      } finally {
        await db.$disconnect();
      }
    }
  },
});
async function register(request: APIRequestContext, email: string) {
  const result = await request.post("/api/auth/register", {
    headers: { Origin: origin },
    data: { email, password, displayName: "Aventureiro" },
  });
  expect(result.status()).toBe(201);
}
async function login(
  request: APIRequestContext,
  email: string,
  value = password,
) {
  const response = await request.post("/api/auth/login", {
    headers: { Origin: origin },
    data: { email, password: value },
  });
  expect(response.status()).toBe(200);
  return response;
}
test("cadastro, login, perfil, campanha persistida e logout pela interface", async ({
  page,
  run,
}) => {
  const email = `e2e-${run}-ui@example.test`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome de exibição").fill("Explorador UI");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const cookie = (await page.context().cookies()).find(
    (item) => item.name === "ct-session",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  await page.goto("/perfil");
  await page.getByLabel("Nome de exibição").fill("Guardião do gelo");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByRole("status")).toContainText("salvas");
  await page.reload();
  await expect(page.getByLabel("Nome de exibição")).toHaveValue(
    "Guardião do gelo",
  );
  await page.goto("/campanhas/nova");
  await page.getByLabel("Nome da campanha").fill("Montanhas de teste");
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Uma campanha persistida no PostgreSQL.");
  await page
    .getByRole("button", { name: "Criar campanha", exact: true })
    .click();
  await expect(page).toHaveURL(/\/campanhas\/[a-f0-9-]{36}$/);
  await page.getByLabel("Nome da campanha").fill("Montanhas editadas");
  await page.getByRole("button", { name: "Salvar campanha" }).click();
  await expect(page.getByRole("status")).toContainText("salvas");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Montanhas editadas", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Gerar convite" }).click();
  await expect(page.getByLabel("Link do convite")).toHaveValue(
    /\/convites#[a-f0-9]{64}$/,
  );
  await page.getByLabel(/Arquivar campanha/).check();
  await page.getByRole("button", { name: "Salvar campanha" }).click();
  await expect(
    page.getByRole("button", { name: "Gerar convite" }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.getByLabel(/Arquivar campanha/)).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/me")).status()).toBe(401);
});
test("duas contas têm papéis distintos por campanha; API bloqueia escalada, CSRF e acesso cruzado", async ({
  playwright,
  run,
}) => {
  const a = await playwright.request.newContext({ baseURL: origin });
  const b = await playwright.request.newContext({ baseURL: origin });
  const anonymous = await playwright.request.newContext({ baseURL: origin });
  try {
    const emailA = `e2e-${run}-a@example.test`;
    const emailB = `e2e-${run}-b@example.test`;
    await register(a, emailA);
    await register(b, emailB);
    await login(a, emailA);
    await login(b, emailB);
    const ca = await (
      await a.post("/api/campaigns", {
        headers: { Origin: origin },
        data: { name: "Mundo A" },
      })
    ).json();
    const cb = await (
      await b.post("/api/campaigns", {
        headers: { Origin: origin },
        data: { name: "Mundo B" },
      })
    ).json();
    expect((await a.get(`/api/campaigns/${cb.id}`)).status()).toBe(404);
    expect((await anonymous.get(`/api/campaigns/${ca.id}`)).status()).toBe(401);
    const invite = await (
      await b.post(`/api/campaigns/${cb.id}/invites`, {
        headers: { Origin: origin },
        data: { maxUses: 1 },
      })
    ).json();
    expect(
      (
        await a.post("/api/invites/accept", {
          headers: { Origin: origin },
          data: { token: invite.token },
        })
      ).status(),
    ).toBe(200);
    expect((await (await a.get(`/api/campaigns/${cb.id}`)).json()).role).toBe(
      "PLAYER",
    );
    expect((await (await a.get(`/api/campaigns/${ca.id}`)).json()).role).toBe(
      "GM",
    );
    expect(
      (
        await a.patch(`/api/campaigns/${cb.id}`, {
          headers: { Origin: origin },
          data: { name: "Ataque", archived: true },
        })
      ).status(),
    ).toBe(403);
    expect((await a.get(`/api/campaigns/${cb.id}/invites`)).status()).toBe(403);
    expect(
      (
        await a.patch("/api/me", {
          headers: { Origin: "https://evil.example" },
          data: { displayName: "Ataque", timezone: "UTC" },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await a.patch("/api/me", {
          headers: { Origin: origin },
          data: { displayName: "Ataque", timezone: "UTC", globalRole: "ADMIN" },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await anonymous.post("/api/auth/register", {
          headers: { Origin: origin },
          data: {
            email: `e2e-${run}-admin@example.test`,
            password,
            displayName: "Admin",
            globalRole: "ADMIN",
          },
        })
      ).status(),
    ).toBe(400);
    const loginResponse = await login(a, emailA);
    expect(loginResponse.headers()["cache-control"]).toBe("no-store");
    expect(loginResponse.headers()["set-cookie"]).toContain("HttpOnly");
  } finally {
    await a.dispose();
    await b.dispose();
    await anonymous.dispose();
  }
});
test("recuperação envia email ao SMTP local, usa link uma vez e encerra sessões", async ({
  page,
  request,
  run,
}) => {
  const email = `e2e-${run}-recovery@example.test`;
  await register(page.request, email);
  await login(page.request, email);
  await page.goto("/recuperar-senha");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Solicitar recuperação" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Se houver uma conta ativa",
  );
  let messageId = "";
  await expect
    .poll(async () => {
      const response = await request.get(
        "http://localhost:8025/api/v1/messages",
      );
      const result = (await response.json()) as {
        messages: { ID: string; To: { Address: string }[] }[];
      };
      messageId =
        result.messages.find((message) =>
          message.To.some((to) => to.Address === email),
        )?.ID ?? "";
      return Boolean(messageId);
    })
    .toBe(true);
  const message = (await (
    await request.get(`http://localhost:8025/api/v1/message/${messageId}`)
  ).json()) as { Text: string };
  const link = message.Text.match(
    /http:\/\/localhost:3100\/redefinir-senha#[a-f0-9]{64}/,
  )?.[0];
  expect(link).toBeTruthy();
  await page.goto(link!);
  await page
    .getByLabel("Nova senha", { exact: true })
    .fill("Nova-senha-segura-456");
  await page
    .getByRole("button", { name: "Redefinir senha", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Senha alterada");
  expect((await page.request.get("/api/me")).status()).toBe(401);
  expect(
    (
      await page.request.post("/api/auth/login", {
        headers: { Origin: origin },
        data: { email, password },
      })
    ).status(),
  ).toBe(401);
  await login(page.request, email, "Nova-senha-segura-456");
  expect(
    (
      await page.request.post("/api/auth/reset", {
        headers: { Origin: origin },
        data: { token: link!.split("#")[1], password },
      })
    ).status(),
  ).toBe(400);
  await request.delete(`http://localhost:8025/api/v1/messages`, {
    data: { IDs: [messageId] },
  });
});
