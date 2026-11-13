@AGENTS.md

# Project

Bare Next.js (App Router) template for bilingual (English / Japanese) homepage and marketing websites. Starts unstyled on purpose: no default design, fonts or demo content.

## Stack

- Next.js 16 (App Router, `cacheComponents` enabled), React 19, TypeScript
- Tailwind CSS 4 via the `@tailwindcss/turbopack` loader in `next.config.ts` (no PostCSS config)
- zod (validation), zustand (client state), lucide-react (icons)
- Prettier with `prettier-plugin-tailwindcss`, ESLint (`eslint-config-next`)
- i18n without libraries: `app/[lang]` routing, JSON dictionaries, `proxy.ts` language redirect
- GSAP is optional and not installed; add `gsap` + `@gsap/react` only when a site needs animations

## Commands

- `npm run dev` - dev server (http://localhost:3000)
- `npm run build` - production build (stop the dev server first; it locks `.next`)
- `npm run lint` - ESLint
- `npm run format` / `npm run format:check` - Prettier
- `npx tsc --noEmit` - type check (run a build first after route changes; it regenerates route types)

## Structure

- `app/[lang]/` - all pages, plus the root `layout.tsx` (sets `<html lang>` and metadata), `error.tsx` and `not-found.tsx`
- `app/global-error.tsx` - fallback when the root layout itself fails
- `app/global-not-found.tsx` - 404 for URLs that match no route (bilingual, own `<html>`)
- `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` (placeholder icon - replace per site)
- `app/api/` - API routes (`app/api/<name>/route.ts`)
- `proxy.ts` - redirects URLs without a language prefix to `/en` or `/ja`
- `dictionaries/` - `en.json` and `ja.json` with all site text
- `components/ui/` - reusable building blocks (button, input, card); site-specific pieces (header, footer, hero) go directly in `components/`
- `hooks/` - custom React hooks
- `lib/` - helpers: `env.ts` (zod-validated env vars), `i18n.ts` (locales, client-safe), `dictionaries.ts` (server-only text and SEO helpers)
- `stores/` - zustand stores
- `types/` - shared TypeScript types (used by 2+ files; one-file types stay in that file's `// types` section)
- `public/` - static files

## Internationalization (en / ja)

- Every page lives under `app/[lang]/`; never add pages directly in `app/`
- No hard-coded text: put it in both `dictionaries/en.json` and `dictionaries/ja.json` (same keys; TypeScript fails if `ja.json` is missing a key)
- Server components read text with `const dict = await getDictionary()` and the language with `await getLocale()` (from `@/lib/dictionaries`)
- Client components never import dictionaries; the server parent passes the text in as props
- Internal links include the language: `<Link href={`/${locale}/about`}>`; linking to unprefixed URLs costs a redirect
- Every page exports `generateMetadata` returning `alternates: await getAlternates("/about")` (canonical + hreflang), and its path is added to `PAGES` in `app/sitemap.ts`
- Error page texts live in `errorMessages` in `lib/i18n.ts` (error pages are client components)
- Default language is `en` (`defaultLocale` in `lib/i18n.ts`); visitors are redirected by their browser's `Accept-Language`

## Component structure

Every component follows this order, and each section starts with its category comment (`// imports`, `// types`, ...). Add a category comment for every section that has code; skip sections that are empty.

1. `// imports`
2. `// types` - props and other types
3. `// constants` - values that never change
4. `// helper functions` - pure functions that don't use state or props (outside the component)
5. `// global states` - zustand store values
6. `// states` - `useState`
7. `// refs` - `useRef`
8. `// custom hooks` - hooks from `hooks/` or libraries
9. `// handlers` - functions that use state or props
10. `// effects` - `useEffect`
11. `// return`

Sections 5-10 only exist in client components (`"use client"`); server components usually have imports, types, constants, helper functions and return.

```tsx
"use client";

// imports
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useCartStore } from "@/stores/cart";

// types
type Props = { label: string };

// constants
const MAX_BADGE = 99;

// helper functions
function formatCount(count: number) {
  return count > MAX_BADGE ? `${MAX_BADGE}+` : String(count);
}

export default function MenuButton({ label }: Props) {
  // global states
  const count = useCartStore((s) => s.items.length);

  // states
  const [open, setOpen] = useState(false);

  // refs
  const buttonRef = useRef<HTMLButtonElement>(null);

  // handlers
  function handleToggle() {
    setOpen((prev) => !prev);
  }

  // effects
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // return
  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      aria-expanded={open}
      aria-label={label}
    >
      <Menu aria-hidden />
      {formatCount(count)}
    </button>
  );
}
```

## Performance

Loading and rendering speed is the top priority.

- Put `"use client"` on the smallest interactive component (e.g. a menu button), never on pages, layouts or whole sections; everything a client file imports ships to the browser
- Pass server-rendered content into client components as `children` instead of importing it there
- Keep pages static: don't read `cookies()`, `headers()` or `searchParams` at the top of a page or layout; wrap request-time parts in `<Suspense>` and cache data fetches with `"use cache"`
- Fonts: only via `next/font` (self-hosted, no layout shift), at most 1-2 families; never a Google Fonts `<link>`; a Japanese font is large, so prefer the system font stack for Japanese unless the design requires one
- Local images: import statically (`import hero from "./hero.jpg"`) for automatic `width`/`height`, `placeholder="blur"` support and long-term caching; use SVG for logos
- zustand: always select single values (`useStore((s) => s.items)`), use `useShallow` for several; never read the whole store
- `lib/env.ts` and `lib/dictionaries.ts` are server-only; client components read `process.env.NEXT_PUBLIC_*` directly and get text as props
- Images: always use `next/image` (lazy-loaded by default); give `width`/`height`, or `fill` with `sizes`
- The main above-the-fold image (hero) gets `fetchPriority="high"`; never lazy-load it, and don't use the deprecated `priority` prop
- Heavy client components below the fold (maps, video players, carousels, GSAP sections, chat widgets) load with `next/dynamic`; don't wrap ordinary components in `dynamic()`
- `<iframe>` embeds (YouTube, Google Maps) get `loading="lazy"`
- Third-party scripts (analytics, chat) use `next/script` with `strategy="lazyOnload"` unless they must run early
- Don't add lazy-loading libraries or manual route splitting; Next.js splits each route automatically

## Conventions

- Folder names are lowercase (kebab-case); Linux servers are case-sensitive
- Comments are single-line only
- Keep the template minimal: don't add packages, styles or demo content unless asked
- Import with the `@/` alias (e.g. `@/lib/env`)
- New env vars go in `lib/env.ts` and `.env.example`; reference `NEXT_PUBLIC_*` vars as `process.env.NEXT_PUBLIC_X` explicitly so Next.js can inline them
- Use `"use client"` only where needed (state, effects, browser APIs, zustand, GSAP); see Performance for placement
- Keep empty folders tracked with a `.gitkeep` file
- Run `npx tsc --noEmit`, `npm run lint` and `npm run format:check` after changes
- Setup steps and per-site checklist are in `README.md`; update it when packages or template files change
