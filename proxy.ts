// imports
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";

// helper functions - picks English or Japanese based on the visitor's browser language
function getPreferredLocale(header: string | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (hasLocale(lang)) return lang;
  }
  return defaultLocale;
}

// Adds the language to addresses that don't have one (e.g. /about -> /ja/about)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1])) return;

  const locale = getPreferredLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

// Leaves files and behind-the-scenes requests alone (images, robots.txt, sitemap.xml, API)
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
