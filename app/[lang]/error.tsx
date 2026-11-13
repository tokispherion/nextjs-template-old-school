"use client"; // Error pages must run in the browser

// imports
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { defaultLocale, errorMessages, hasLocale } from "@/lib/i18n";

// types
type Props = { error: unknown; retry: () => void };

// Shown when something on a page breaks; the rest of the site layout stays visible
export default function Error({ error, retry }: Props) {
  // custom hooks
  const params = useParams<{ lang: string }>();
  const locale = hasLocale(params.lang) ? params.lang : defaultLocale;
  const t = errorMessages[locale];

  // effects
  useEffect(() => {
    console.error(error);
  }, [error]);

  // return
  return (
    <main>
      <h1>{t.title}</h1>
      <button onClick={() => retry()}>{t.retry}</button>
      <Link href={`/${locale}`}>{t.backHome}</Link>
    </main>
  );
}
