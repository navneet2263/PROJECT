import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/drilling/hydrostatic-pressure", title: "Hydrostatic Pressure", description: "Bottomhole pressure from mud column." },
  { href: "/drilling/kill-mud-weight", title: "Kill Mud Weight", description: "Required mud weight for well control." },
  { href: "/drilling/ecd", title: "ECD", description: "Equivalent circulating density." },
  { href: "/drilling/maasp", title: "MAASP", description: "Maximum allowable annular surface pressure." },
];

export default function DrillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Drilling Engineering</h1>
        <p className="mt-1 text-muted">Well control and hydraulics calculators.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
