import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/well-logging/archie-saturation", title: "Archie Water Saturation", description: "Sw from resistivity and porosity." },
  { href: "/well-logging/density-porosity", title: "Density Porosity", description: "Porosity from density log." },
];

export default function WellLoggingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Well Logging / Petrophysics</h1>
        <p className="mt-1 text-muted">Log interpretation and saturation calculators.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
