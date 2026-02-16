"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { hydrostaticPressureSI } from "@/lib/drilling";
import { convertFromSI } from "@/lib/units";

export default function HydrostaticPressurePage() {
  const [mwVal, setMwVal] = useState("10");
  const [mwUnit, setMwUnit] = useState("ppg");
  const [mwSI, setMwSI] = useState<number | null>(null);
  const [tvdVal, setTvdVal] = useState("10000");
  const [tvdUnit, setTvdUnit] = useState("ft");
  const [tvdSI, setTvdSI] = useState<number | null>(null);
  const [resultPa, setResultPa] = useState<number | null>(null);

  const handleCalculate = () => {
    if (mwSI == null || tvdSI == null) return;
    const pPa = hydrostaticPressureSI({ densityKgM3: mwSI, tvdM: tvdSI });
    setResultPa(pPa);
  };

  const psi = resultPa != null ? convertFromSI(resultPa, "psi", "pressure") : null;
  const bar = resultPa != null ? convertFromSI(resultPa, "bar", "pressure") : null;

  return (
    <CalculatorLayout title="Hydrostatic Pressure" description="Bottomhole pressure from mud column." sectionHref="/drilling" sectionLabel="Drilling Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="density" label="Mud weight" name="mw" value={mwVal} unit={mwUnit} onValueChange={setMwVal} onUnitChange={setMwUnit} onValueSI={setMwSI} />
            <UnitInput quantity="length" label="TVD" name="tvd" value={tvdVal} unit={tvdUnit} onValueChange={setTvdVal} onUnitChange={setTvdUnit} onValueSI={setTvdSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={mwSI == null || tvdSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {psi != null && bar != null && (
            <ResultPanel items={[{ label: "Hydrostatic pressure", value: psi.toFixed(2), unit: "psi" }, { label: "Hydrostatic pressure", value: bar.toFixed(2), unit: "bar" }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
