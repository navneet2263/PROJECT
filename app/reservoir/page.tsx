import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/reservoir/stoiip", title: "STOIIP", description: "Stock Tank Oil Initially In Place." },
  { href: "/reservoir/formation-volume-factor", title: "Formation Volume Factor (Bo)", description: "Oil formation volume factor." },
  { href: "/reservoir/material-balance", title: "Material Balance (Basic)", description: "Basic material balance equation." },
];

export default function ReservoirPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Reservoir Engineering</h1>
        <p className="mt-1 text-muted">Reservoir volume and material balance calculators.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
