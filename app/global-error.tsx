"use client"; // Error pages must run in the browser

// imports
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { defaultLocale, errorMessages, hasLocale } from "@/lib/i18n";

// types
type Props = { error: unknown; retry: () => void };

// Last-resort error page if the whole site layout breaks; it builds its own bare page without site styles
export default function GlobalError({ error, retry }: Props) {
  // custom hooks
  const params = useParams<{ lang?: string }>();
  const locale =
    params?.lang && hasLocale(params.lang) ? params.lang : defaultLocale;
  const t = errorMessages[locale];

  // effects
  useEffect(() => {
    console.error(error);
  }, [error]);

  // return
  return (
    <html lang={locale}>
      <body>
        <title>{t.title}</title>
        <main>
          <h1>{t.title}</h1>
          <button onClick={() => retry()}>{t.retry}</button>
          <Link href={`/${locale}`}>{t.backHome}</Link>
        </main>
      </body>
    </html>
  );
}
