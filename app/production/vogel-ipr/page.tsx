"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import GraphPanel from "@/components/GraphPanel";
import { vogelIPRSI, vogelIPRCurveSI } from "@/lib/production";
import { convertFromSI } from "@/lib/units";

export default function VogelIPRPage() {
  const [prVal, setPrVal] = useState("2500");
  const [prUnit, setPrUnit] = useState("psi");
  const [prSI, setPrSI] = useState<number | null>(null);
  const [qMaxVal, setQMaxVal] = useState("5000");
  const [qMaxUnit, setQMaxUnit] = useState("stb/d");
  const [qMaxSI, setQMaxSI] = useState<number | null>(null);
  const [pwfVal, setPwfVal] = useState("1500");
  const [pwfUnit, setPwfUnit] = useState("psi");
  const [pwfSI, setPwfSI] = useState<number | null>(null);
  const [resultM3S, setResultM3S] = useState<number | null>(null);

  const curveDataSI = useMemo(() => {
    if (prSI == null || qMaxSI == null) return [];
    return vogelIPRCurveSI({ prPa: prSI, qMaxM3S: qMaxSI }, 25);
  }, [prSI, qMaxSI]);

  const curveData = useMemo(() => {
    return curveDataSI.map(({ pwfPa, qM3S }) => ({
      pwf: convertFromSI(pwfPa, "psi", "pressure"),
      q: convertFromSI(qM3S, "stb/d", "flowrate"),
    }));
  }, [curveDataSI]);

  const handleCalculate = () => {
    if (prSI == null || qMaxSI == null || pwfSI == null) return;
    const q = vogelIPRSI(prSI, pwfSI, qMaxSI);
    setResultM3S(q);
  };

  const qStbD = resultM3S != null ? convertFromSI(resultM3S, "stb/d", "flowrate") : null;

  return (
    <CalculatorLayout title="Vogel IPR" description="Inflow performance relationship for solution-gas-drive reservoirs." sectionHref="/production" sectionLabel="Production Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="pressure" label="Reservoir pressure" name="pr" value={prVal} unit={prUnit} onValueChange={setPrVal} onUnitChange={setPrUnit} onValueSI={setPrSI} />
            <UnitInput quantity="flowrate" label="Q max (AOF)" name="qmax" value={qMaxVal} unit={qMaxUnit} onValueChange={setQMaxVal} onUnitChange={setQMaxUnit} onValueSI={setQMaxSI} />
            <UnitInput quantity="pressure" label="Flowing BHP (for rate)" name="pwf" value={pwfVal} unit={pwfUnit} onValueChange={setPwfVal} onUnitChange={setPwfUnit} onValueSI={setPwfSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={prSI == null || qMaxSI == null || pwfSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate rate at Pwf
          </button>
        </div>
        <div className="space-y-4">
          {qStbD != null && <ResultPanel items={[{ label: "Q at Pwf", value: qStbD.toFixed(2), unit: "stb/d" }]} />}
        </div>
      </div>
      {curveData.length > 0 && (
        <GraphPanel title="IPR curve" data={curveData} xKey="pwf" lines={[{ dataKey: "q", name: "Q (stb/d)" }]} xUnit="psi" yUnit="stb/d" />
      )}
    </CalculatorLayout>
  );
}
