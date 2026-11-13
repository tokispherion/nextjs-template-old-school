// imports
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type en from "@/dictionaries/en.json";
import { defaultLocale, hasLocale, locales, type Locale } from "@/lib/i18n";

// types
export type Dictionary = typeof en;

// constants
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ja: () => import("@/dictionaries/ja.json").then((m) => m.default),
};

// helper functions
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}

// Canonical + hreflang links for a page path (e.g. "" for home, "/about")
export async function getAlternates(
  path: string,
): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}
