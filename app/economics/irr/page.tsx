"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { irr } from "@/lib/economics";

export default function IRRPage() {
  const [cashFlowStr, setCashFlowStr] = useState("-1000000, 300000, 400000, 350000, 300000");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const flows = cashFlowStr.split(",").map((s) => Number(s.trim()));
    const rate = irr(flows);
    setResult(rate);
  };

  return (
    <CalculatorLayout
      title="IRR"
      description="Internal rate of return of a cash flow stream."
      sectionHref="/economics"
      sectionLabel="Economics"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash flows (comma-separated, year 0 first)</label>
              <input
                type="text"
                value={cashFlowStr}
                onChange={(e) => setCashFlowStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-slate-900 focus:border-accent focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Calculate
          </button>
        </div>
        <div>
          {result != null && (
            <ResultPanel
              items={[
                { label: "IRR", value: (result * 100).toFixed(2), unit: "%" },
                { label: "IRR (decimal)", value: result.toFixed(4) },
              ]}
            />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
