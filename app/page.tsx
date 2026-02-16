import SectionCard from "@/components/SectionCard";

const SECTIONS = [
  { href: "/reservoir", title: "Reservoir Engineering", description: "STOIIP, Bo, material balance and reservoir diagnostics." },
  { href: "/drilling", title: "Drilling Engineering", description: "Hydrostatic pressure, kill mud, ECD, MAASP and well control." },
  { href: "/production", title: "Production Engineering", description: "Productivity index, Vogel IPR and inflow performance." },
  { href: "/artificial-lift", title: "Artificial Lift", description: "Gas lift depth, ESP head and lift design." },
  { href: "/well-logging", title: "Well Logging / Petrophysics", description: "Archie saturation, density porosity and log interpretation." },
  { href: "/flow-assurance", title: "Flow Assurance & Pipeline", description: "Pressure drop, critical velocity and pipeline hydraulics." },
  { href: "/surface-facilities", title: "Surface Facilities", description: "Separator sizing and facility design." },
  { href: "/economics", title: "Economics", description: "NPV, IRR and break-even oil price." },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">PetroCalc</h1>
        <p className="mt-2 text-muted">
          Petroleum Engineering calculator platform. Choose a domain to access calculators.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SECTIONS.map((s) => (
          <SectionCard key={s.href} href={s.href} title={s.title} description={s.description} />
        ))}
      </div>
    </div>
  );
}
