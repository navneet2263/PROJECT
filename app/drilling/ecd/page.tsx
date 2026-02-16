"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { ecdSI } from "@/lib/drilling";
import { convertFromSI } from "@/lib/units";

export default function ECDPage() {
  const [mwVal, setMwVal] = useState("10");
  const [mwUnit, setMwUnit] = useState("ppg");
  const [mwSI, setMwSI] = useState<number | null>(null);
  const [aplVal, setAplVal] = useState("150");
  const [aplUnit, setAplUnit] = useState("psi");
  const [aplSI, setAplSI] = useState<number | null>(null);
  const [tvdVal, setTvdVal] = useState("10000");
  const [tvdUnit, setTvdUnit] = useState("ft");
  const [tvdSI, setTvdSI] = useState<number | null>(null);
  const [resultKgM3, setResultKgM3] = useState<number | null>(null);

  const handleCalculate = () => {
    if (mwSI == null || aplSI == null || tvdSI == null) return;
    const ecd = ecdSI({ densityKgM3: mwSI, annularPressureLossPa: aplSI, tvdM: tvdSI });
    setResultKgM3(ecd);
  };

  const ppg = resultKgM3 != null ? convertFromSI(resultKgM3, "ppg", "density") : null;

  return (
    <CalculatorLayout title="ECD" description="Equivalent circulating density including annular friction loss." sectionHref="/drilling" sectionLabel="Drilling Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="density" label="Mud weight" name="mw" value={mwVal} unit={mwUnit} onValueChange={setMwVal} onUnitChange={setMwUnit} onValueSI={setMwSI} />
            <UnitInput quantity="pressure" label="Annular pressure loss" name="apl" value={aplVal} unit={aplUnit} onValueChange={setAplVal} onUnitChange={setAplUnit} onValueSI={setAplSI} />
            <UnitInput quantity="length" label="TVD" name="tvd" value={tvdVal} unit={tvdUnit} onValueChange={setTvdVal} onUnitChange={setTvdUnit} onValueSI={setTvdSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={mwSI == null || aplSI == null || tvdSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {ppg != null && <ResultPanel items={[{ label: "ECD", value: ppg.toFixed(2), unit: "ppg" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
