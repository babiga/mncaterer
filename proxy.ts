import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { jwtVerify } from "jose";

const LOCALE_COOKIE_NAME = "lastLocale";
const SESSION_COOKIE_NAME = "session";
const DEFAULT_LOCALE = "mn";
const VALID_LOCALES = ["en", "mn"];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle dashboard routes: check auth and redirect with locale
  if (pathname.startsWith("/dashboard")) {
    const session = await getSessionFromCookie(request);

    if (!session || session.userType !== "dashboard") {
      const lastLocale = getLastLocale(request);
      return NextResponse.redirect(
        new URL(`/${lastLocale}/login`, request.url),
      );
    }

    return NextResponse.next();
  }

  // 2. Handle locale routes: run intl middleware + set cookie
  const response = intlMiddleware(request);

  const localeMatch = pathname.match(/^\/(en|mn)(\/|$)/);
  if (localeMatch) {
    response.cookies.set(LOCALE_COOKIE_NAME, localeMatch[1], {
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

async function getSessionFromCookie(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; userType: string; role?: string };
  } catch {
    return null;
  }
}

function getLastLocale(request: NextRequest): string {
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieValue && VALID_LOCALES.includes(cookieValue)) {
    return cookieValue;
  }
  return DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/", "/(mn|en)/:path*", "/dashboard/:path*"],
};
