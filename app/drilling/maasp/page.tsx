"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { maaspSI } from "@/lib/drilling";
import { convertFromSI } from "@/lib/units";

export default function MAASPPage() {
  const [shoeVal, setShoeVal] = useState("8000");
  const [shoeUnit, setShoeUnit] = useState("ft");
  const [shoeSI, setShoeSI] = useState<number | null>(null);
  const [maxMwVal, setMaxMwVal] = useState("14");
  const [maxMwUnit, setMaxMwUnit] = useState("ppg");
  const [maxMwSI, setMaxMwSI] = useState<number | null>(null);
  const [curMwVal, setCurMwVal] = useState("10");
  const [curMwUnit, setCurMwUnit] = useState("ppg");
  const [curMwSI, setCurMwSI] = useState<number | null>(null);
  const [resultPa, setResultPa] = useState<number | null>(null);

  const handleCalculate = () => {
    if (shoeSI == null || maxMwSI == null || curMwSI == null) return;
    const pPa = maaspSI({ shoeTvdM: shoeSI, maxDensityKgM3: maxMwSI, currentDensityKgM3: curMwSI });
    setResultPa(pPa);
  };

  const psi = resultPa != null ? convertFromSI(resultPa, "psi", "pressure") : null;

  return (
    <CalculatorLayout title="MAASP" description="Maximum allowable annular surface pressure (casing shoe limit)." sectionHref="/drilling" sectionLabel="Drilling Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="length" label="Casing shoe TVD" name="shoe" value={shoeVal} unit={shoeUnit} onValueChange={setShoeVal} onUnitChange={setShoeUnit} onValueSI={setShoeSI} />
            <UnitInput quantity="density" label="Max mud weight (fracture)" name="maxMw" value={maxMwVal} unit={maxMwUnit} onValueChange={setMaxMwVal} onUnitChange={setMaxMwUnit} onValueSI={setMaxMwSI} />
            <UnitInput quantity="density" label="Current mud weight" name="mw" value={curMwVal} unit={curMwUnit} onValueChange={setCurMwVal} onUnitChange={setCurMwUnit} onValueSI={setCurMwSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={shoeSI == null || maxMwSI == null || curMwSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {psi != null && <ResultPanel items={[{ label: "MAASP", value: psi.toFixed(2), unit: "psi" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
