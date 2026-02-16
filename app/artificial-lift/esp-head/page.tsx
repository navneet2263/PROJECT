"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { espHeadSI, espPressureSI } from "@/lib/artificialLift";
import { convertFromSI } from "@/lib/units";

export default function ESPHeadPage() {
  const [stages, setStages] = useState("100");
  const [hpsVal, setHpsVal] = useState("25");
  const [hpsUnit, setHpsUnit] = useState("ft");
  const [hpsSI, setHpsSI] = useState<number | null>(null);
  const [sg, setSg] = useState("0.85");
  const [resultHeadM, setResultHeadM] = useState<number | null>(null);
  const [resultPressurePa, setResultPressurePa] = useState<number | null>(null);

  const handleCalculate = () => {
    if (hpsSI == null) return;
    const input = { stages: Number(stages), headPerStageM: hpsSI, sg: Number(sg) };
    setResultHeadM(espHeadSI(input));
    setResultPressurePa(espPressureSI(input));
  };

  const headFt = resultHeadM != null ? convertFromSI(resultHeadM, "ft", "length") : null;
  const pressurePsi = resultPressurePa != null ? convertFromSI(resultPressurePa, "psi", "pressure") : null;

  return (
    <CalculatorLayout title="ESP Head" description="Total head and pressure from ESP stages and head per stage." sectionHref="/artificial-lift" sectionLabel="Artificial Lift">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Number of stages" name="stages" value={stages} onChange={setStages} />
            <UnitInput quantity="length" label="Head per stage" name="hps" value={hpsVal} unit={hpsUnit} onValueChange={setHpsVal} onUnitChange={setHpsUnit} onValueSI={setHpsSI} />
            <InputField label="Liquid SG" name="sg" value={sg} onChange={setSg} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={hpsSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {headFt != null && pressurePsi != null && (
            <ResultPanel items={[{ label: "Total head", value: headFt.toFixed(0), unit: "ft" }, { label: "Total head", value: pressurePsi.toFixed(2), unit: "psi" }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
