"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { formationVolumeFactorBoSI } from "@/lib/reservoir";

export default function FormationVolumeFactorPage() {
  const [rs, setRs] = useState("500");
  const [oilApi, setOilApi] = useState("35");
  const [gasSG, setGasSG] = useState("0.65");
  const [tValue, setTValue] = useState("180");
  const [tUnit, setTUnit] = useState("°F");
  const [tSI, setTSI] = useState<number | null>(null);
  const [pValue, setPValue] = useState("2000");
  const [pUnit, setPUnit] = useState("psi");
  const [pSI, setPSI] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (tSI == null || pSI == null) return;
    const bo = formationVolumeFactorBoSI({
      rs: Number(rs),
      oilApi: Number(oilApi),
      gasSG: Number(gasSG),
      tK: tSI,
      pPa: pSI,
    });
    setResult(bo);
  };

  return (
    <CalculatorLayout
      title="Formation Volume Factor (Bo)"
      description="Oil formation volume factor from Rs, API, gas SG, temperature and pressure."
      sectionHref="/reservoir"
      sectionLabel="Reservoir Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Solution GOR" name="rs" value={rs} onChange={setRs} unit="scf/stb" />
            <InputField label="Oil API gravity" name="api" value={oilApi} onChange={setOilApi} unit="°API" />
            <InputField label="Gas specific gravity" name="gasSG" value={gasSG} onChange={setGasSG} />
            <UnitInput quantity="temperature" label="Temperature" name="t" value={tValue} unit={tUnit} onValueChange={setTValue} onUnitChange={setTUnit} onValueSI={setTSI} />
            <UnitInput quantity="pressure" label="Pressure" name="p" value={pValue} unit={pUnit} onValueChange={setPValue} onUnitChange={setPUnit} onValueSI={setPSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={tSI == null || pSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {result != null && <ResultPanel items={[{ label: "Bo", value: result.toFixed(4), unit: "rb/stb" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
