import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/flow-assurance/pipeline-pressure-drop", title: "Pipeline Pressure Drop", description: "Pressure loss along pipeline." },
  { href: "/flow-assurance/critical-velocity", title: "Critical Velocity", description: "Minimum velocity to prevent solids settling." },
];

export default function FlowAssurancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Flow Assurance & Pipeline</h1>
        <p className="mt-1 text-muted">Pipeline hydraulics and flow assurance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
