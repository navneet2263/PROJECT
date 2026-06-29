import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/production/porosity", title: "Porosity", description: "Porosity from bulk and pore volumes." },
  { href: "/production/productivity-index", title: "Productivity Index", description: "PI for steady, transient, horizontal, and fractured wells." },
  { href: "/production/relative-permeability", title: "Relative Permeability (Corey)", description: "Oil and water relative permeabilities from Corey model." },
  { href: "/production/ipr", title: "IPR Analysis", description: "Inflow performance relationships for oil and gas wells." },
  { href: "/production/well-performance", title: "Well Performance Simulator", description: "Analyze well deliverability using IPR, VLP, and nodal analysis to determine the operating point." },
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
