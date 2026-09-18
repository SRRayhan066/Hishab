import "server-only";
import { compare, hash } from "bcryptjs";

const passwordCost = 10;

const dummyHash = hash("hishabi-dummy-password", passwordCost);

export function hashPassword(password: string) {
  return hash(password, passwordCost);
}

export async function verifyPassword(
  password: string,
  passwordHash: string | null,
) {
  if (!passwordHash) {
    await compare(password, await dummyHash);
    return false;
  }

  return compare(password, passwordHash);
}
