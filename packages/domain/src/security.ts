import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
export const newToken = () => randomBytes(32).toString("hex");
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
export const verifyPassword = (hash: string, password: string) =>
  argon2.verify(hash, password);
