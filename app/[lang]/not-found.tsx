// imports
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/dictionaries";

// Shown when a page under /[lang] calls notFound()
export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary();

  // return
  return (
    <main>
      <h1>{dict.notFound.title}</h1>
      <Link href={`/${locale}`}>{dict.notFound.backHome}</Link>
    </main>
  );
}
