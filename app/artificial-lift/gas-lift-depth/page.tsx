"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { gasLiftInjectionDepthSI } from "@/lib/artificialLift";
import { convertFromSI } from "@/lib/units";

export default function GasLiftDepthPage() {
  const [thpVal, setThpVal] = useState("500");
  const [thpUnit, setThpUnit] = useState("psi");
  const [thpSI, setThpSI] = useState<number | null>(null);
  const [gradVal, setGradVal] = useState("0.35");
  const [gradUnit, setGradUnit] = useState("psi/ft");
  const [gradSI, setGradSI] = useState<number | null>(null);
  const [gasGradVal, setGasGradVal] = useState("0.05");
  const [gasGradUnit, setGasGradUnit] = useState("psi/ft");
  const [gasGradSI, setGasGradSI] = useState<number | null>(null);
  const [drawdownVal, setDrawdownVal] = useState("500");
  const [drawdownUnit, setDrawdownUnit] = useState("psi");
  const [drawdownSI, setDrawdownSI] = useState<number | null>(null);
  const [resultM, setResultM] = useState<number | null>(null);

  const handleCalculate = () => {
    if (thpSI == null || gradSI == null || gasGradSI == null || drawdownSI == null) return;
    const depthM = gasLiftInjectionDepthSI({
      tubingHeadPa: thpSI,
      liquidGradientPaPerM: gradSI,
      gasGradientPaPerM: gasGradSI,
      targetDrawdownPa: drawdownSI,
    });
    setResultM(depthM);
  };

  const depthFt = resultM != null ? convertFromSI(resultM, "ft", "length") : null;

  return (
    <CalculatorLayout title="Gas Lift Injection Depth" description="Estimate gas lift valve injection depth from gradients and target drawdown." sectionHref="/artificial-lift" sectionLabel="Artificial Lift">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="pressure" label="Tubing head pressure" name="thp" value={thpVal} unit={thpUnit} onValueChange={setThpVal} onUnitChange={setThpUnit} onValueSI={setThpSI} />
            <UnitInput quantity="pressure_per_length" label="Liquid gradient" name="grad" value={gradVal} unit={gradUnit} onValueChange={setGradVal} onUnitChange={setGradUnit} onValueSI={setGradSI} />
            <UnitInput quantity="pressure_per_length" label="Gas gradient" name="gasGrad" value={gasGradVal} unit={gasGradUnit} onValueChange={setGasGradVal} onUnitChange={setGasGradUnit} onValueSI={setGasGradSI} />
            <UnitInput quantity="pressure" label="Target drawdown" name="drawdown" value={drawdownVal} unit={drawdownUnit} onValueChange={setDrawdownVal} onUnitChange={setDrawdownUnit} onValueSI={setDrawdownSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={thpSI == null || gradSI == null || gasGradSI == null || drawdownSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {depthFt != null && <ResultPanel items={[{ label: "Injection depth", value: depthFt.toFixed(0), unit: "ft" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
