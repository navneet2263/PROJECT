import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/economics/npv", title: "NPV", description: "Net present value of cash flows." },
  { href: "/economics/irr", title: "IRR", description: "Internal rate of return." },
  { href: "/economics/break-even-oil-price", title: "Break-even Oil Price", description: "Minimum oil price for project." },
];

export default function EconomicsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Economics</h1>
        <p className="mt-1 text-muted">NPV, IRR and break-even analysis.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
