import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/production/productivity-index", title: "Productivity Index", description: "PI from rate and pressures." },
  { href: "/production/vogel-ipr", title: "Vogel IPR", description: "Inflow performance relationship with graph." },
];

export default function ProductionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Production Engineering</h1>
        <p className="mt-1 text-muted">Inflow and well performance calculators.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
