"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { archieWaterSaturationSI } from "@/lib/logging";

export default function ArchieSaturationPage() {
  const [rt, setRt] = useState("20");
  const [rw, setRw] = useState("0.05");
  const [porosity, setPorosity] = useState("0.22");
  const [a, setA] = useState("1");
  const [m, setM] = useState("2");
  const [n, setN] = useState("2");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const sw = archieWaterSaturationSI({
      rt: Number(rt),
      rw: Number(rw),
      porosity: Number(porosity),
      a: Number(a),
      m: Number(m),
      n: Number(n),
    });
    setResult(sw);
  };

  return (
    <CalculatorLayout title="Archie Water Saturation" description="Sw from Rt, Rw and porosity (Archie equation)." sectionHref="/well-logging" sectionLabel="Well Logging / Petrophysics">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Rt" name="rt" value={rt} onChange={setRt} unit="Ω·m" />
            <InputField label="Rw" name="rw" value={rw} onChange={setRw} unit="Ω·m" />
            <InputField label="Porosity φ" name="phi" value={porosity} onChange={setPorosity} />
            <InputField label="a" name="a" value={a} onChange={setA} />
            <InputField label="m" name="m" value={m} onChange={setM} />
            <InputField label="n" name="n" value={n} onChange={setN} />
          </div>
          <button type="button" onClick={handleCalculate} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90">
            Calculate
          </button>
        </div>
        <div>
          {result != null && (
            <ResultPanel items={[{ label: "Sw", value: result.toFixed(4) }, { label: "So", value: (1 - result).toFixed(4) }]} />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
