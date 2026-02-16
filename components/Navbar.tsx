"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const SECTIONS = [
  { href: "/reservoir", label: "Reservoir Engineering" },
  { href: "/drilling", label: "Drilling Engineering" },
  { href: "/production", label: "Production Engineering" },
  { href: "/artificial-lift", label: "Artificial Lift" },
  { href: "/well-logging", label: "Well Logging / Petrophysics" },
  { href: "/flow-assurance", label: "Flow Assurance & Pipeline" },
  { href: "/surface-facilities", label: "Surface Facilities" },
  { href: "/economics", label: "Economics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggleDark = () => {
    const next = !document.documentElement.classList.toggle("dark");
    setDark(!next);
    localStorage.setItem("theme", next ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-accent">
          PetroCalc
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDark}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-surface"
            aria-label="Toggle dark mode"
          >
            {dark ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg border border-border p-2 sm:hidden"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      <nav className={`border-t border-border bg-surface-elevated sm:border-t-0 ${open ? "block" : "hidden sm:block"}`}>
        <div className="mx-auto max-w-7xl px-4 py-2 sm:flex sm:flex-wrap sm:gap-1 sm:px-6">
          {SECTIONS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block rounded px-3 py-2 text-sm font-medium sm:inline-block ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
