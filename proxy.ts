import { NextResponse, type NextRequest } from "next/server";
import { sessionAudience, sessionCookie, verifyToken } from "@/lib/auth/token";

const appRoutes = ["/home", "/budget", "/savings", "/history", "/add"];
const authRoutes = ["/login", "/signup", "/forgot-password"];

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifyToken(
    request.cookies.get(sessionCookie)?.value,
    sessionAudience,
  );
  const signedIn = Boolean(session?.sub);

  if (!signedIn && matches(pathname, appRoutes)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (signedIn && matches(pathname, authRoutes)) {
    return NextResponse.redirect(new URL("/home", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
