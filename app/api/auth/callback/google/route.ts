import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createGoogleClient,
  findUserForGoogle,
  googleStateCookie,
  googleVerifierCookie,
  readGoogleProfile,
  savePendingGoogleSignUp,
  type GoogleProfile,
} from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";

async function fetchGoogleProfile(
  origin: string,
  code: string,
  codeVerifier: string,
): Promise<GoogleProfile | null> {
  try {
    const tokens = await createGoogleClient(origin).validateAuthorizationCode(
      code,
      codeVerifier,
    );
    return readGoogleProfile(tokens.idToken());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(googleStateCookie)?.value;
  const codeVerifier = cookieStore.get(googleVerifierCookie)?.value;
  cookieStore.delete(googleStateCookie);
  cookieStore.delete(googleVerifierCookie);

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    redirect("/login?error=google");
  }

  const profile = await fetchGoogleProfile(origin, code, codeVerifier);
  if (!profile) redirect("/login?error=google");
  if (!profile.emailVerified) redirect("/login?error=google-unverified");

  const userId = await findUserForGoogle(profile);
  if (userId) {
    await createSession(userId);
    redirect("/home");
  }

  await savePendingGoogleSignUp({
    googleId: profile.googleId,
    email: profile.email,
    name: profile.name,
    image: profile.image,
  });
  redirect("/signup/complete");
}
