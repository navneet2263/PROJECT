import Link from "next/link";

interface SectionCardProps {
  title: string;
  description: string;
  href: string;
}

export default function SectionCard({ title, description, href }: SectionCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-surface-elevated p-6 shadow-sm transition hover:border-accent/50 hover:shadow-md dark:shadow-none"
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-accent">
        Open
        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
