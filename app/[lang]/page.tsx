// imports
import type { Metadata } from "next";
import { getAlternates } from "@/lib/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await getAlternates("") };
}

export default function Home() {
  // return
  return <main></main>;
}
