import "server-only";
import { cookies } from "next/headers";
import { decodeIdToken, Google } from "arctic";
import { z } from "zod";
import { db } from "@/lib/db";
import { minutesFromNow, secureCookieOptions } from "./cookies";
import { signToken, verifyToken } from "./token";

export const googleProvider = "google";
export const googleStateCookie = "hishabi_google_state";
export const googleVerifierCookie = "hishabi_google_verifier";

const pendingSignUpCookie = "hishabi_google_signup";
const pendingSignUpAudience = "google-signup";
const pendingSignUpMinutes = 15;

const googleClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
  picture: z.string().optional(),
});

const pendingSignUpSchema = z.object({
  googleId: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  image: z.string().nullable(),
});

export type GoogleProfile = z.infer<typeof pendingSignUpSchema> & {
  emailVerified: boolean;
};

export type PendingGoogleSignUp = z.infer<typeof pendingSignUpSchema>;

export function createGoogleClient(origin: string) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET is not set");
  }

  return new Google(
    clientId,
    clientSecret,
    `${origin}/api/auth/callback/google`,
  );
}

export function readGoogleProfile(idToken: string): GoogleProfile | null {
  const parsed = googleClaimsSchema.safeParse(decodeIdToken(idToken));
  if (!parsed.success) return null;

  const { sub, email, email_verified, name, picture } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  return {
    googleId: sub,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split("@")[0],
    image: picture ?? null,
    emailVerified: email_verified,
  };
}

export async function findUserForGoogle(profile: GoogleProfile) {
  const account = await db.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: googleProvider,
        providerAccountId: profile.googleId,
      },
    },
    select: { userId: true },
  });
  if (account) return account.userId;

  const user = await db.user.findUnique({
    where: { email: profile.email },
    select: { id: true },
  });
  if (!user) return null;

  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: googleProvider,
        providerAccountId: profile.googleId,
      },
    },
    create: {
      userId: user.id,
      provider: googleProvider,
      providerAccountId: profile.googleId,
    },
    update: {},
  });

  return user.id;
}

export async function savePendingGoogleSignUp(signUp: PendingGoogleSignUp) {
  const expiresAt = minutesFromNow(pendingSignUpMinutes);
  const token = await signToken(signUp, pendingSignUpAudience, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(pendingSignUpCookie, token, secureCookieOptions(expiresAt));
}

export async function readPendingGoogleSignUp(): Promise<PendingGoogleSignUp | null> {
  const cookieStore = await cookies();
  const payload = await verifyToken(
    cookieStore.get(pendingSignUpCookie)?.value,
    pendingSignUpAudience,
  );
  if (!payload) return null;

  const parsed = pendingSignUpSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export async function clearPendingGoogleSignUp() {
  const cookieStore = await cookies();
  cookieStore.delete(pendingSignUpCookie);
}
