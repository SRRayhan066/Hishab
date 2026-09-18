import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateState } from "arctic";
import {
  createGoogleClient,
  googleStateCookie,
  googleVerifierCookie,
} from "@/lib/auth/google";
import { minutesFromNow, secureCookieOptions } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = createGoogleClient(request.nextUrl.origin).createAuthorizationURL(
    state,
    codeVerifier,
    ["openid", "email", "profile"],
  );
  url.searchParams.set("prompt", "select_account");

  const cookieStore = await cookies();
  const options = secureCookieOptions(minutesFromNow(10));
  cookieStore.set(googleStateCookie, state, options);
  cookieStore.set(googleVerifierCookie, codeVerifier, options);

  redirect(url.toString());
}
