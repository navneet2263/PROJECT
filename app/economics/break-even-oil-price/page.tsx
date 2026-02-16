"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { breakEvenOilPriceSI } from "@/lib/economics";
import { convertFromSI } from "@/lib/units";

export default function BreakEvenOilPricePage() {
  const [totalCost, setTotalCost] = useState("50000000");
  const [prodVal, setProdVal] = useState("1000000");
  const [prodUnit, setProdUnit] = useState("stb");
  const [prodSI, setProdSI] = useState<number | null>(null);
  const [resultPerM3, setResultPerM3] = useState<number | null>(null);

  const handleCalculate = () => {
    if (prodSI == null || prodSI <= 0) return;
    const perM3 = breakEvenOilPriceSI({ totalCost: Number(totalCost), totalProductionM3: prodSI });
    setResultPerM3(perM3);
  };

  const prodStb = prodSI != null ? convertFromSI(prodSI, "stb", "volume") : null;
  const pricePerBbl = resultPerM3 != null && prodStb != null && prodStb > 0 ? Number(totalCost) / prodStb : null;

  return (
    <CalculatorLayout title="Break-even Oil Price" description="Minimum oil price to recover total project cost." sectionHref="/economics" sectionLabel="Economics">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Total cost" name="cost" value={totalCost} onChange={setTotalCost} />
            <UnitInput quantity="volume" label="Total production" name="prod" value={prodVal} unit={prodUnit} onValueChange={setProdVal} onUnitChange={setProdUnit} onValueSI={setProdSI} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={prodSI == null || prodSI <= 0} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {pricePerBbl != null && <ResultPanel items={[{ label: "Break-even price", value: pricePerBbl.toFixed(2), unit: "$/bbl" }]} />}
        </div>
      </div>
    </CalculatorLayout>
  );
}
