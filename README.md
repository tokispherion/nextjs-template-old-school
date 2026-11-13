# Next.js homepage template

A bare, unstyled Next.js 16 template for fast bilingual (English / Japanese) homepage and marketing sites.

## Stack

| Purpose      | Package                                   |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 16 (App Router, Cache Components) |
| Styling      | Tailwind CSS 4 (`@tailwindcss/turbopack`) |
| Validation   | zod                                       |
| Client state | zustand                                   |
| Icons        | lucide-react                              |
| Formatting   | Prettier + `prettier-plugin-tailwindcss`  |
| Animations   | optional: `npm install gsap @gsap/react`  |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 - you are redirected to `/en` or `/ja` based on your browser language.

## New site checklist

1. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` (and in the hosting provider's environment variables)
2. Replace `siteName` and `description` in `dictionaries/en.json` and `dictionaries/ja.json`
3. Replace the placeholder icon `app/icon.svg` (add `app/apple-icon.png` if needed)
4. Update this README with the site's name and details

## Adding a page

1. Create `app/[lang]/<page>/page.tsx`
2. Add its text to both dictionaries
3. Export `generateMetadata` with `alternates: await getAlternates("/<page>")`
4. Add `"/<page>"` to `PAGES` in `app/sitemap.ts`

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Dev server                                   |
| `npm run build`        | Production build (stop the dev server first) |
| `npm run start`        | Serve the production build                   |
| `npm run lint`         | ESLint                                       |
| `npm run format`       | Format all files with Prettier               |
| `npm run format:check` | Check formatting                             |

Coding rules for this project (component structure, i18n, performance) are in `CLAUDE.md`.
