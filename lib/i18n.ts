// types
export type Locale = "en" | "ja";

// constants
export const locales: readonly Locale[] = ["en", "ja"];
export const defaultLocale: Locale = "en";

// Client-safe error texts (error pages can't load server dictionaries)
export const errorMessages: Record<
  Locale,
  { title: string; retry: string; backHome: string }
> = {
  en: {
    title: "Something went wrong",
    retry: "Try again",
    backHome: "Back to home",
  },
  ja: {
    title: "エラーが発生しました",
    retry: "もう一度試す",
    backHome: "ホームに戻る",
  },
};

// helper functions
export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
