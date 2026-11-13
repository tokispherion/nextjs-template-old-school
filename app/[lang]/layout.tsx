// imports
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { locales } from "@/lib/i18n";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import "../globals.css";

// Builds the English and Japanese pages ahead of time so they load instantly
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: dict.metadata.siteName,
      template: `%s | ${dict.metadata.siteName}`,
    },
    description: dict.metadata.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  // return
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
