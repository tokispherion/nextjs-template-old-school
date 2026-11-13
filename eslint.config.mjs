import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sectionLabels from "./eslint/section-labels.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Checks pages and components follow the section labels and order from CLAUDE.md
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    plugins: { "section-labels": sectionLabels },
    rules: { "section-labels/require-section-labels": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
