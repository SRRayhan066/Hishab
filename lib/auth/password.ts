import "server-only";
import { hash } from "bcryptjs";

export function hashPassword(password: string) {
  return hash(password, 10);
}
