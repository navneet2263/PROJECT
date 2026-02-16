import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/artificial-lift/gas-lift-depth", title: "Gas Lift Injection Depth", description: "Estimate injection depth for gas lift." },
  { href: "/artificial-lift/esp-head", title: "ESP Head", description: "Electrical submersible pump head calculation." },
];

export default function ArtificialLiftPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Artificial Lift</h1>
        <p className="mt-1 text-muted">Gas lift and ESP calculators.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
