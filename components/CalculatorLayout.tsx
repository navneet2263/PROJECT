import Link from "next/link";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  sectionHref: string;
  sectionLabel: string;
  children: React.ReactNode;
}

export default function CalculatorLayout({
  title,
  description,
  sectionHref,
  sectionLabel,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <nav className="text-sm text-muted">
          <Link href={sectionHref} className="hover:text-accent">
            {sectionLabel}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 dark:text-slate-300">{title}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
        <p className="mt-1 text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
