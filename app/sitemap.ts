// imports
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales } from "@/lib/i18n";

// constants - add every public page path here ("" is the home page)
const PAGES = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;

  // return
  return PAGES.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
