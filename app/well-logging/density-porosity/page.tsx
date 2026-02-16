"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { densityPorositySI } from "@/lib/logging";

export default function DensityPorosityPage() {
  const [rhoBVal, setRhoBVal] = useState("2.35");
  const [rhoBUnit, setRhoBUnit] = useState("g/cc");
  const [rhoBSI, setRhoBSI] = useState<number | null>(null);
  const [rhoMaVal, setRhoMaVal] = useState("2.65");
  const [rhoMaUnit, setRhoMaUnit] = useState("g/cc");
  const [rhoMaSI, setRhoMaSI] = useState<number | null>(null);
  const [rhoFlVal, setRhoFlVal] = useState("1.0");
  const [rhoFlUnit, setRhoFlUnit] = useState("g/cc");
  const [rhoFlSI, setRhoFlSI] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (rhoBSI == null || rhoMaSI == null || rhoFlSI == null) return;
    const phi = densityPorositySI({ rhoBKgM3: rhoBSI, rhoMaKgM3: rhoMaSI, rhoFlKgM3: rhoFlSI });
    setResult(phi);
  };

  return (
    <CalculatorLayout title="Density Porosity" description="Porosity from bulk, matrix and fluid density: φ = (ρma − ρb) / (ρma − ρfl)." sectionHref="/well-logging" sectionLabel="Well Logging / Petrophysics">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="density" label="Bulk density ρb" name="rhoB" value={rhoBVal} unit={rhoBUnit} onValueChange={setRhoBVal} onUnitChange={setRhoBUnit} onValueSI={setRhoBSI} />
            <UnitInput quantity="density" label="Matrix density ρma" name="rhoMa" value={rhoMaVal} unit={rhoMaUnit} onValueChange={setRhoMaVal} onUnitChange={setRhoMaUnit} onValueSI={setRhoMaSI} />
            <UnitInput quantity="density" label="Fluid density ρfl" name="rhoFl" value={rhoFlVal} unit={rhoFlUnit} onValueChange={setRhoFlVal} onUnitChange={setRhoFlUnit} onValueSI={setRhoFlSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={rhoBSI == null || rhoMaSI == null || rhoFlSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {result != null && (
            <ResultPanel items={[{ label: "Density porosity", value: result.toFixed(4) }, { label: "Density porosity", value: (result * 100).toFixed(2), unit: "%" }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
