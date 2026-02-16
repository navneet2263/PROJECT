"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { productivityIndexSI } from "@/lib/production";
import { convertFromSI } from "@/lib/units";

const PI_SI_TO_STB_D_PSI = (86400 / 0.158987) * 6894.76;

export default function ProductivityIndexPage() {
  const [qVal, setQVal] = useState("1000");
  const [qUnit, setQUnit] = useState("stb/d");
  const [qSI, setQSI] = useState<number | null>(null);
  const [pwfVal, setPwfVal] = useState("2000");
  const [pwfUnit, setPwfUnit] = useState("psi");
  const [pwfSI, setPwfSI] = useState<number | null>(null);
  const [prVal, setPrVal] = useState("2500");
  const [prUnit, setPrUnit] = useState("psi");
  const [prSI, setPrSI] = useState<number | null>(null);
  const [resultSI, setResultSI] = useState<number | null>(null);

  const handleCalculate = () => {
    if (qSI == null || pwfSI == null || prSI == null) return;
    const pi = productivityIndexSI({ qM3S: qSI, pwfPa: pwfSI, prPa: prSI });
    setResultSI(pi);
  };

  const piStbDPsi = resultSI != null ? resultSI * PI_SI_TO_STB_D_PSI : null;

  return (
    <CalculatorLayout title="Productivity Index" description="PI = Q / (Pr − Pwf)." sectionHref="/production" sectionLabel="Production Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="flowrate" label="Oil rate" name="q" value={qVal} unit={qUnit} onValueChange={setQVal} onUnitChange={setQUnit} onValueSI={setQSI} />
            <UnitInput quantity="pressure" label="Flowing BHP" name="pwf" value={pwfVal} unit={pwfUnit} onValueChange={setPwfVal} onUnitChange={setPwfUnit} onValueSI={setPwfSI} />
            <UnitInput quantity="pressure" label="Reservoir pressure" name="pr" value={prVal} unit={prUnit} onValueChange={setPrVal} onUnitChange={setPrUnit} onValueSI={setPrSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={qSI == null || pwfSI == null || prSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {piStbDPsi != null && <ResultPanel items={[{ label: "Productivity Index", value: piStbDPsi.toFixed(2), unit: "stb/d/psi" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
