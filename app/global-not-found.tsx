// imports
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "404",
};

// Shown for URLs that match no route; the language is unknown here, so both are shown
export default function GlobalNotFound() {
  // return
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Page not found</h1>
          <p lang="ja">ページが見つかりません</p>
          <Link href="/">Back to home / ホームに戻る</Link>
        </main>
      </body>
    </html>
  );
}
