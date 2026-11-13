// Tests for the section label lint rule - run with: npm run test:lint-rules
import { RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";
import sectionLabels from "./section-labels.mjs";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rule = sectionLabels.rules["require-section-labels"];

ruleTester.run("require-section-labels", rule, {
  valid: [
    // Full client component in the order from CLAUDE.md
    `"use client";

// imports
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/stores/cart";

// types
type Props = { label: string };

// constants
const MAX_BADGE = 99;

// helper functions
function formatCount(count: number) {
  return count > MAX_BADGE ? "99+" : String(count);
}

export default function MenuButton({ label }: Props) {
  // global states
  const count = useCartStore((s) => s.items.length);

  // states
  const [open, setOpen] = useState(false);

  // refs
  const buttonRef = useRef<HTMLButtonElement>(null);

  // custom hooks
  const params = useParams();
  const locale = params.lang;

  // handlers
  function handleToggle() {
    setOpen((prev) => !prev);
  }
  const handleClose = () => setOpen(false);

  // effects
  useEffect(() => {
    if (!open) return;
  }, [open]);

  // return
  return <button ref={buttonRef} onClick={handleToggle}>{label}{count}{locale}</button>;
}`,
    // Server page: Next.js exports and plain values need no label
    `// imports
import type { Metadata } from "next";
import { getLocale } from "@/lib/dictionaries";

export const metadata: Metadata = { title: "404" };

export async function generateMetadata(): Promise<Metadata> {
  return {};
}

export default async function Page() {
  const locale = await getLocale();

  // return
  return <main>{locale}</main>;
}`,
    // Labels may have a plain-language note after a dash
    `// imports
import Link from "next/link";

// constants - pages listed in the menu
const PAGES = ["/about"];

export default function Menu() {
  // return
  return <Link href={PAGES[0]}>About</Link>;
}`,
    // A correctly labeled memo component
    `// imports
import { memo, useState } from "react";

// types
type Props = { title: string };

const Card = memo(function Card({ title }: Props) {
  // states
  const [open, setOpen] = useState(false);

  // handlers
  function handleToggle() {
    setOpen((prev) => !prev);
  }

  // return
  return <button onClick={handleToggle}>{title}{String(open)}</button>;
});

export default Card;`,
  ],
  // Wrapped components (memo, any wrapper function) are checked like plain ones
  invalid: [
    {
      code: `// imports
import { memo, useState } from "react";
const Card = memo(function Card() {
  // refs
  const [open] = useState(false);
  // return
  return <p>{String(open)}</p>;
});
export default Card;`,
      errors: [
        { messageId: "wrong", data: { section: "states", label: "refs" } },
      ],
    },
    {
      code: `// imports
import { memo, useEffect, useState } from "react";
export default memo(() => {
  // effects
  useEffect(() => {}, []);
  // states
  const [open] = useState(false);
  // return
  return <p>{String(open)}</p>;
});`,
      errors: [
        { messageId: "order", data: { label: "states", previous: "effects" } },
      ],
    },
    // Default-exported arrow component
    {
      code: `// imports
import Link from "next/link";
export default () => {
  return <Link href="/">x</Link>;
};`,
      errors: [{ messageId: "missing", data: { section: "return" } }],
    },
    // React.useState written with the React. prefix
    {
      code: `// imports
import React from "react";
export default function A() {
  // refs
  const [open] = React.useState(false);
  // return
  return <p>{String(open)}</p>;
}`,
      errors: [
        { messageId: "wrong", data: { section: "states", label: "refs" } },
      ],
    },
    // Class components are not allowed (use a function component)
    {
      code: `// imports
import { Component } from "react";
export default class Old extends Component {
  render() {
    return <p>x</p>;
  }
}`,
      errors: [{ messageId: "classComponent" }],
    },
    {
      code: `// imports
import React from "react";
class Old extends React.PureComponent {
  render() {
    return <p>x</p>;
  }
}
export default Old;`,
      errors: [{ messageId: "classComponent" }],
    },
    // forwardRef is not needed in React 19 (pass ref as a prop)
    {
      code: `// imports
import { forwardRef } from "react";
const Input = forwardRef<HTMLInputElement>(function Input(props, ref) {
  // return
  return <input ref={ref} />;
});
export default Input;`,
      errors: [{ messageId: "forwardRef" }],
    },

    // Missing labels
    {
      code: `import Link from "next/link";
export default function A() {
  return <Link href="/">x</Link>;
}`,
      errors: [
        { messageId: "missing", data: { section: "imports" } },
        { messageId: "missing", data: { section: "return" } },
      ],
    },
    // useState under the wrong label
    {
      code: `// imports
import { useState } from "react";
export default function A() {
  // refs
  const [open] = useState(false);
  // return
  return <p>{String(open)}</p>;
}`,
      errors: [
        { messageId: "wrong", data: { section: "states", label: "refs" } },
      ],
    },
    // Effects before states (wrong order)
    {
      code: `// imports
import { useEffect, useState } from "react";
export default function A() {
  // effects
  useEffect(() => {}, []);
  // states
  const [open] = useState(false);
  // return
  return <p>{String(open)}</p>;
}`,
      errors: [
        { messageId: "order", data: { label: "states", previous: "effects" } },
      ],
    },
    // Top-level helper function without a label
    {
      code: `// imports
import Link from "next/link";
function slug(text: string) {
  return text.toLowerCase();
}
export default function A() {
  // return
  return <Link href={slug("X")}>x</Link>;
}`,
      errors: [
        {
          messageId: "wrong",
          data: { section: "helper functions", label: "imports" },
        },
      ],
    },
    // Zustand store value labeled as a custom hook
    {
      code: `// imports
import { useCartStore } from "@/stores/cart";
export default function A() {
  // custom hooks
  const count = useCartStore((s) => s.count);
  // return
  return <p>{count}</p>;
}`,
      errors: [
        {
          messageId: "wrong",
          data: { section: "global states", label: "custom hooks" },
        },
      ],
    },
  ],
});

console.log("section-labels: all tests passed");
