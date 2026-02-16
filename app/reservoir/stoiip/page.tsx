"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { stoiipSI } from "@/lib/reservoir";
import { convertFromSI } from "@/lib/units";

export default function STOIIPPage() {
  const [areaValue, setAreaValue] = useState("100");
  const [areaUnit, setAreaUnit] = useState("acre");
  const [areaSI, setAreaSI] = useState<number | null>(null);

  const [thicknessValue, setThicknessValue] = useState("50");
  const [thicknessUnit, setThicknessUnit] = useState("ft");
  const [thicknessSI, setThicknessSI] = useState<number | null>(null);

  const [porosity, setPorosity] = useState("0.22");
  const [sw, setSw] = useState("0.25");
  const [bo, setBo] = useState("1.2");
  const [ntg, setNtg] = useState("1");

  const [resultM3, setResultM3] = useState<number | null>(null);

  const handleCalculate = () => {
    if (areaSI == null || thicknessSI == null) return;
    const nM3 = stoiipSI({
      areaM2: areaSI,
      thicknessM: thicknessSI,
      porosity: Number(porosity),
      sw: Number(sw),
      bo: Number(bo),
      ntg: Number(ntg) || 1,
    });
    setResultM3(nM3);
  };

  const stb = resultM3 != null ? convertFromSI(resultM3, "stb", "volume") : null;
  const mmstb = stb != null ? stb / 1e6 : null;

  return (
    <CalculatorLayout
      title="STOIIP"
      description="Stock Tank Oil Initially In Place from area, thickness, porosity, water saturation and Bo."
      sectionHref="/reservoir"
      sectionLabel="Reservoir Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput
              quantity="area"
              label="Area"
              name="area"
              value={areaValue}
              unit={areaUnit}
              onValueChange={setAreaValue}
              onUnitChange={setAreaUnit}
              onValueSI={setAreaSI}
            />
            <UnitInput
              quantity="length"
              label="Net pay thickness"
              name="thickness"
              value={thicknessValue}
              unit={thicknessUnit}
              onValueChange={setThicknessValue}
              onUnitChange={setThicknessUnit}
              onValueSI={setThicknessSI}
            />
            <InputField label="Porosity" name="phi" value={porosity} onChange={setPorosity} />
            <InputField label="Water saturation" name="sw" value={sw} onChange={setSw} />
            <InputField label="Formation volume factor Bo" name="bo" value={bo} onChange={setBo} />
            <InputField label="NTG (optional)" name="ntg" value={ntg} onChange={setNtg} />
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={areaSI == null || thicknessSI == null}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Calculate
          </button>
        </div>
        <div>
          {resultM3 != null && stb != null && mmstb != null && (
            <ResultPanel
              items={[
                { label: "STOIIP", value: stb.toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: "STB" },
                { label: "STOIIP", value: mmstb.toFixed(2), unit: "MMSTB" },
              ]}
            />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
