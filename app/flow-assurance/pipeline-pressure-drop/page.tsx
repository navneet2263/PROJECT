"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { pipelinePressureDropSI } from "@/lib/flowAssurance";
import { convertFromSI } from "@/lib/units";

export default function PipelinePressureDropPage() {
  const [lenVal, setLenVal] = useState("10000");
  const [lenUnit, setLenUnit] = useState("ft");
  const [lenSI, setLenSI] = useState<number | null>(null);
  const [diamVal, setDiamVal] = useState("12");
  const [diamUnit, setDiamUnit] = useState("in");
  const [diamSI, setDiamSI] = useState<number | null>(null);
  const [rateVal, setRateVal] = useState("50000");
  const [rateUnit, setRateUnit] = useState("bbl/d");
  const [rateSI, setRateSI] = useState<number | null>(null);
  const [visVal, setVisVal] = useState("5");
  const [visUnit, setVisUnit] = useState("cP");
  const [visSI, setVisSI] = useState<number | null>(null);
  const [rhoVal, setRhoVal] = useState("8");
  const [rhoUnit, setRhoUnit] = useState("ppg");
  const [rhoSI, setRhoSI] = useState<number | null>(null);
  const [resultPa, setResultPa] = useState<number | null>(null);

  const handleCalculate = () => {
    if (lenSI == null || diamSI == null || rateSI == null || visSI == null || rhoSI == null) return;
    const dPa = pipelinePressureDropSI({
      lengthM: lenSI,
      diameterM: diamSI,
      rateM3S: rateSI,
      viscosityPaS: visSI,
      densityKgM3: rhoSI,
    });
    setResultPa(dPa);
  };

  const psi = resultPa != null ? convertFromSI(resultPa, "psi", "pressure") : null;
  const bar = resultPa != null ? convertFromSI(resultPa, "bar", "pressure") : null;

  return (
    <CalculatorLayout title="Pipeline Pressure Drop" description="Frictional pressure drop along a pipeline (simplified)." sectionHref="/flow-assurance" sectionLabel="Flow Assurance & Pipeline">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="length" label="Length" name="len" value={lenVal} unit={lenUnit} onValueChange={setLenVal} onUnitChange={setLenUnit} onValueSI={setLenSI} />
            <UnitInput quantity="length" label="Diameter" name="d" value={diamVal} unit={diamUnit} onValueChange={setDiamVal} onUnitChange={setDiamUnit} onValueSI={setDiamSI} />
            <UnitInput quantity="flowrate" label="Liquid rate" name="q" value={rateVal} unit={rateUnit} onValueChange={setRateVal} onUnitChange={setRateUnit} onValueSI={setRateSI} />
            <UnitInput quantity="viscosity" label="Viscosity" name="mu" value={visVal} unit={visUnit} onValueChange={setVisVal} onUnitChange={setVisUnit} onValueSI={setVisSI} />
            <UnitInput quantity="density" label="Density" name="rho" value={rhoVal} unit={rhoUnit} onValueChange={setRhoVal} onUnitChange={setRhoUnit} onValueSI={setRhoSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={lenSI == null || diamSI == null || rateSI == null || visSI == null || rhoSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {psi != null && bar != null && (
            <ResultPanel items={[{ label: "Pressure drop", value: psi.toFixed(2), unit: "psi" }, { label: "Pressure drop", value: bar.toFixed(2), unit: "bar" }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
