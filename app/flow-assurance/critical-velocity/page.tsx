"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { criticalVelocitySI } from "@/lib/flowAssurance";
import { convertFromSI } from "@/lib/units";

export default function CriticalVelocityPage() {
  const [diamVal, setDiamVal] = useState("12");
  const [diamUnit, setDiamUnit] = useState("in");
  const [diamSI, setDiamSI] = useState<number | null>(null);
  const [rhoVal, setRhoVal] = useState("8");
  const [rhoUnit, setRhoUnit] = useState("ppg");
  const [rhoSI, setRhoSI] = useState<number | null>(null);
  const [visVal, setVisVal] = useState("5");
  const [visUnit, setVisUnit] = useState("cP");
  const [visSI, setVisSI] = useState<number | null>(null);
  const [rhoPVal, setRhoPVal] = useState("21");
  const [rhoPUnit, setRhoPUnit] = useState("ppg");
  const [rhoPSI, setRhoPSI] = useState<number | null>(null);
  const [resultMs, setResultMs] = useState<number | null>(null);

  const handleCalculate = () => {
    if (diamSI == null || rhoSI == null) return;
    const vc = criticalVelocitySI({
      diameterM: diamSI,
      densityKgM3: rhoSI,
      viscosityPaS: visSI ?? 0.001,
      particleDensityKgM3: rhoPSI ?? undefined,
    });
    setResultMs(vc);
  };

  const ftS = resultMs != null ? convertFromSI(resultMs, "ft/s", "velocity") : null;

  return (
    <CalculatorLayout title="Critical Velocity" description="Minimum velocity to prevent solids settling in pipeline." sectionHref="/flow-assurance" sectionLabel="Flow Assurance & Pipeline">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="length" label="Diameter" name="d" value={diamVal} unit={diamUnit} onValueChange={setDiamVal} onUnitChange={setDiamUnit} onValueSI={setDiamSI} />
            <UnitInput quantity="density" label="Fluid density" name="rho" value={rhoVal} unit={rhoUnit} onValueChange={setRhoVal} onUnitChange={setRhoUnit} onValueSI={setRhoSI} />
            <UnitInput quantity="viscosity" label="Viscosity" name="mu" value={visVal} unit={visUnit} onValueChange={setVisVal} onUnitChange={setVisUnit} onValueSI={setVisSI} />
            <UnitInput quantity="density" label="Particle density" name="rhoP" value={rhoPVal} unit={rhoPUnit} onValueChange={setRhoPVal} onUnitChange={setRhoPUnit} onValueSI={setRhoPSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={diamSI == null || rhoSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {ftS != null && <ResultPanel items={[{ label: "Critical velocity", value: ftS.toFixed(2), unit: "ft/s" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
