import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export const sessionCookie = "hishabi_session";
export const sessionAudience = "session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: JWTPayload,
  audience: string,
  expiresAt: Date,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

export async function verifyToken(
  token: string | undefined,
  audience: string,
): Promise<JWTPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      audience,
    });
    return payload;
  } catch {
    return null;
  }
}
