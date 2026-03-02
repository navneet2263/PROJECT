"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import { porosityFromVolumesSI } from "@/lib/production";

export default function PorosityPage() {
  const [bulkVal, setBulkVal] = useState("1000");
  const [bulkUnit, setBulkUnit] = useState("stb");
  const [bulkSI, setBulkSI] = useState<number | null>(null);
  const [poreVal, setPoreVal] = useState("150");
  const [poreUnit, setPoreUnit] = useState("stb");
  const [poreSI, setPoreSI] = useState<number | null>(null);
  const [phiFraction, setPhiFraction] = useState<number | null>(null);
  const [phiPercent, setPhiPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    if (bulkSI == null || poreSI == null) return;
    if (bulkSI <= 0 || poreSI < 0 || poreSI > bulkSI) {
      setError("Pore volume must be between 0 and bulk volume.");
      setPhiFraction(null);
      setPhiPercent(null);
      return;
    }
    setError(null);
    const result = porosityFromVolumesSI({ bulkVolumeM3: bulkSI, poreVolumeM3: poreSI });
    setPhiFraction(result.phiFraction);
    setPhiPercent(result.phiPercent);
  };

  const hasResult = phiFraction != null && phiPercent != null && error == null;

  return (
    <CalculatorLayout
      title="Porosity"
      description="Porosity from bulk and pore volumes."
      sectionHref="/production"
      sectionLabel="Production Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput
              quantity="volume"
              label="Bulk volume Vb"
              name="vb"
              value={bulkVal}
              unit={bulkUnit}
              onValueChange={setBulkVal}
              onUnitChange={setBulkUnit}
              onValueSI={setBulkSI}
            />
            <UnitInput
              quantity="volume"
              label="Pore volume Vp"
              name="vp"
              value={poreVal}
              unit={poreUnit}
              onValueChange={setPoreVal}
              onUnitChange={setPoreUnit}
              onValueSI={setPoreSI}
            />
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={bulkSI == null || poreSI == null}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Calculate porosity
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div>
          {hasResult && (
            <ResultPanel
              items={[
                { label: "Porosity (fraction)", value: phiFraction!.toFixed(3) },
                { label: "Porosity (%)", value: phiPercent!.toFixed(1), unit: "%" },
              ]}
            />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}

