// imports
import type { Metadata } from "next";
import { getAlternates } from "@/lib/dictionaries";

// Tells search engines this page's main address and its English/Japanese versions ("" = home page)
export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await getAlternates("") };
}

export default function Home() {
  // return
  return <main></main>;
}
