import "server-only";
import { createDatabase } from "../../../../packages/database/src/index";
import { createAuthService } from "../../../../packages/domain/src/auth";
import { createCampaignService } from "../../../../packages/domain/src/campaigns";
import nodemailer from "nodemailer";
const globalDb = globalThis as unknown as {
  ctDatabase?: ReturnType<typeof createDatabase>;
};
export function database() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL não configurada");
  globalDb.ctDatabase ??= createDatabase(process.env.DATABASE_URL);
  return globalDb.ctDatabase;
}
export function appOrigin() {
  const url = new URL(process.env.APP_URL ?? "http://localhost:3000");
  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw new Error("APP_URL requer HTTPS");
  return url.origin;
}
export function auth() {
  const smtpUrl = process.env.SMTP_URL;
  const from = process.env.MAIL_FROM;
  const mailer =
    smtpUrl && from
      ? async (email: string, token: string) => {
          const smtp = new URL(smtpUrl);
          if (!["smtp:", "smtps:"].includes(smtp.protocol))
            throw new Error("SMTP_URL inválida");
          const transport = nodemailer.createTransport({
            host: smtp.hostname,
            port: Number(smtp.port || (smtp.protocol === "smtps:" ? 465 : 587)),
            secure: smtp.protocol === "smtps:",
            requireTLS: !["localhost", "127.0.0.1"].includes(smtp.hostname),
            ...(smtp.username
              ? {
                  auth: {
                    user: decodeURIComponent(smtp.username),
                    pass: decodeURIComponent(smtp.password),
                  },
                }
              : {}),
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
          });
          // Fragmento evita registrar o token em access logs e Referer.
          const link = `${appOrigin()}/redefinir-senha#${token}`;
          await transport.sendMail({
            from,
            to: email,
            subject: "Redefinir sua senha — CT RPG",
            text: `Recebemos uma solicitação para redefinir sua senha no CT RPG.\n\n${link}\n\nO link expira em 30 minutos e só pode ser usado uma vez. Se não foi você, ignore esta mensagem.`,
          });
        }
      : undefined;
  return createAuthService(database(), mailer);
}
export const campaigns = () => createCampaignService(database());
