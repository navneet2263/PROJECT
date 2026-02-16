import CalculatorCard from "@/components/CalculatorCard";

const CALCULATORS = [
  { href: "/surface-facilities/separator-sizing", title: "Separator Sizing", description: "Two-phase separator dimensions." },
];

export default function SurfaceFacilitiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Surface Facilities</h1>
        <p className="mt-1 text-muted">Separator and facility sizing.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
