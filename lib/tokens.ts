import { randomBytes } from "crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function generateResetToken() {
  return randomBytes(32).toString("hex");
}
