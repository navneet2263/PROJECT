"use client";

import CalculatorCard from "@/components/CalculatorCard";
import { useSimulationState } from "@/components/SimulationStateProvider";

const CALCULATORS = [
  { href: "/artificial-lift/gas-lift-depth", title: "Gas Lift Injection Depth", description: "Estimate injection depth for gas lift." },
  { href: "/artificial-lift/esp-head", title: "ESP Head", description: "Electrical submersible pump head calculation." },
];

export default function ArtificialLiftPage() {
  const { simulationState } = useSimulationState();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Artificial Lift</h1>
        <p className="mt-1 text-muted">Gas lift and ESP calculators.</p>
      </div>
      {simulationState ? (
        <section className="rounded-xl border border-accent/30 bg-accent/5 p-5 shadow-sm dark:bg-accent/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Simulation Imported Successfully
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Current Well Loaded", "Production Data Loaded", "Ready for Artificial Lift Analysis"].map((item) => (
                  <span key={item} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {simulationState.currentWell.name}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryMetric
              label="Current Production"
              value={simulationState.simulationResults.operatingRate}
              unit="STB/day"
            />
            <SummaryMetric
              label="Operating Pressure"
              value={simulationState.simulationResults.operatingBottomholePressure}
              unit="psi"
            />
            <SummaryMetric
              label="Reservoir Pressure"
              value={simulationState.reservoirData.reservoirPressure}
              unit="psi"
            />
            <SummaryMetric
              label="Well Depth"
              value={simulationState.wellData.wellDepth}
              unit="ft"
            />
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recommended Lift</p>
              <p className="mt-2 text-base font-bold text-accent">
                {simulationState.recommendedArtificialLift?.method ?? "Review Required"}
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        {value.toLocaleString("en-US", {
          maximumFractionDigits: 1,
        })}
        <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
      </p>
    </div>
  );
}
