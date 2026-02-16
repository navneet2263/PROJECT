"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { separatorSizingSI } from "@/lib/surfaceFacilities";
import { convertFromSI } from "@/lib/units";

export default function SeparatorSizingPage() {
  const [qOilVal, setQOilVal] = useState("5000");
  const [qOilUnit, setQOilUnit] = useState("bbl/d");
  const [qOilSI, setQOilSI] = useState<number | null>(null);
  const [retentionVal, setRetentionVal] = useState("3");
  const [retentionUnit, setRetentionUnit] = useState("min");
  const [retentionSI, setRetentionSI] = useState<number | null>(null);
  const [pVal, setPVal] = useState("100");
  const [pUnit, setPUnit] = useState("psi");
  const [pSI, setPSI] = useState<number | null>(null);
  const [z, setZ] = useState("0.9");
  const [tVal, setTVal] = useState("80");
  const [tUnit, setTUnit] = useState("°F");
  const [tSI, setTSI] = useState<number | null>(299.82);
  const [result, setResult] = useState<{ diameterM: number; lengthM: number; volumeM3: number } | null>(null);

  const handleCalculate = () => {
    if (qOilSI == null || retentionSI == null || pSI == null || tSI == null) return;
    const r = separatorSizingSI({
      qOilM3S: qOilSI,
      retentionTimeS: retentionSI,
      operatingPa: pSI,
      z: Number(z),
      tK: tSI,
    });
    setResult(r);
  };

  const diamIn = result != null ? convertFromSI(result.diameterM, "in", "length") : null;
  const lengthFt = result != null ? convertFromSI(result.lengthM, "ft", "length") : null;
  const volBbl = result != null ? convertFromSI(result.volumeM3, "bbl", "volume") : null;

  return (
    <CalculatorLayout title="Separator Sizing" description="Two-phase separator dimensions from oil rate and retention time." sectionHref="/surface-facilities" sectionLabel="Surface Facilities">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput quantity="flowrate" label="Oil rate" name="qOil" value={qOilVal} unit={qOilUnit} onValueChange={setQOilVal} onUnitChange={setQOilUnit} onValueSI={setQOilSI} />
            <UnitInput quantity="time" label="Retention time" name="t" value={retentionVal} unit={retentionUnit} onValueChange={setRetentionVal} onUnitChange={setRetentionUnit} onValueSI={setRetentionSI} />
            <UnitInput quantity="pressure" label="Operating pressure" name="p" value={pVal} unit={pUnit} onValueChange={setPVal} onUnitChange={setPUnit} onValueSI={setPSI} />
            <InputField label="Z factor" name="z" value={z} onChange={setZ} />
            <UnitInput quantity="temperature" label="Temperature" name="tR" value={tVal} unit={tUnit} onValueChange={setTVal} onUnitChange={setTUnit} onValueSI={setTSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={qOilSI == null || retentionSI == null || pSI == null || tSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {diamIn != null && lengthFt != null && volBbl != null && (
            <ResultPanel items={[{ label: "Diameter", value: diamIn.toFixed(1), unit: "in" }, { label: "Length", value: lengthFt.toFixed(1), unit: "ft" }, { label: "Liquid volume", value: volBbl.toFixed(2), unit: "bbl" }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
