import Link from "next/link";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
}

export default function CalculatorCard({ title, description, href }: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface-elevated p-4 transition hover:border-accent/40 hover:bg-accent/5"
    >
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  );
}
