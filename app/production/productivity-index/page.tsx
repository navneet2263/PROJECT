"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import {
  productivityIndexRadialSteadyPISI,
  productivityIndexRadialTransientPISI,
  productivityIndexRadialPseudoSteadyPISI,
  productivityIndexHorizontalWellPISI,
  productivityIndexFracturedWellPISI,
} from "@/lib/production";

type FlowRegime = "steady" | "transient" | "pseudoSteady" | "horizontal" | "fractured";

const FLOW_REGIME_OPTIONS: { value: FlowRegime; label: string; formula: string }[] = [
  { value: "steady", label: "Steady-state (radial)", formula: "J = 0.00708 · k · h / (μ · Bo · ln(re / rw))" },
  {
    value: "transient",
    label: "Transient (infinite-acting)",
    formula: "J = 0.00708 · k · h / (μ · Bo · ln(0.472 · re² / rw²))",
  },
  {
    value: "pseudoSteady",
    label: "Pseudo-steady state",
    formula: "J = 0.00708 · k · h / (μ · Bo · (ln(re / rw) - 0.75 + s))",
  },
  {
    value: "horizontal",
    label: "Horizontal well (Joshi)",
    formula: "J = 0.00708 · k · h / (μ · Bo · ln(4 · L / (π · rw)))",
  },
  {
    value: "fractured",
    label: "Hydraulically fractured well",
    formula: "J = 0.00708 · k · h / (μ · Bo · ln(re / xf))",
  },
];

export default function ProductivityIndexPage() {
  const [regime, setRegime] = useState<FlowRegime>("steady");

  const [kVal, setKVal] = useState("50");
  const [kUnit, setKUnit] = useState("mD");
  const [kSI, setKSI] = useState<number | null>(null);

  const [hVal, setHVal] = useState("50");
  const [hUnit, setHUnit] = useState("ft");
  const [hSI, setHSI] = useState<number | null>(null);

  const [muVal, setMuVal] = useState("1");
  const [muUnit, setMuUnit] = useState("cP");
  const [muSI, setMuSI] = useState<number | null>(null);

  const [boVal, setBoVal] = useState("1.2");
  const [boUnit, setBoUnit] = useState("—");
  const [boSI, setBoSI] = useState<number | null>(null);

  const [reVal, setReVal] = useState("1000");
  const [reUnit, setReUnit] = useState("ft");
  const [reSI, setReSI] = useState<number | null>(null);

  const [rwVal, setRwVal] = useState("0.328");
  const [rwUnit, setRwUnit] = useState("ft");
  const [rwSI, setRwSI] = useState<number | null>(null);

  const [sVal, setSVal] = useState("0");
  const [sUnit, setSUnit] = useState("—");
  const [sSI, setSSI] = useState<number | null>(null);

  const [lVal, setLVal] = useState("1000");
  const [lUnit, setLUnit] = useState("ft");
  const [lSI, setLSI] = useState<number | null>(null);

  const [xfVal, setXfVal] = useState("100");
  const [xfUnit, setXfUnit] = useState("ft");
  const [xfSI, setXfSI] = useState<number | null>(null);

  const [pi, setPi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedFormula = useMemo(
    () => FLOW_REGIME_OPTIONS.find((opt) => opt.value === regime)?.formula ?? "",
    [regime],
  );

  const handleCalculate = () => {
    if (kSI == null || hSI == null || muSI == null || boSI == null) return;

    const base = {
      permeabilityM2: kSI,
      thicknessM: hSI,
      viscosityPaS: muSI,
      formationVolumeFactorRBPerSTB: boSI,
    };

    let j: number | null = null;

    if (regime === "steady" || regime === "transient" || regime === "pseudoSteady") {
      if (reSI == null || rwSI == null) return;
      if (regime === "steady") {
        j = productivityIndexRadialSteadyPISI({
          ...base,
          drainageRadiusM: reSI,
          wellboreRadiusM: rwSI,
        });
      } else if (regime === "transient") {
        j = productivityIndexRadialTransientPISI({
          ...base,
          drainageRadiusM: reSI,
          wellboreRadiusM: rwSI,
        });
      } else {
        j = productivityIndexRadialPseudoSteadyPISI({
          ...base,
          drainageRadiusM: reSI,
          wellboreRadiusM: rwSI,
          skinFactor: sSI ?? 0,
        });
      }
    } else if (regime === "horizontal") {
      if (lSI == null || rwSI == null) return;
      j = productivityIndexHorizontalWellPISI({
        ...base,
        horizontalLengthM: lSI,
        wellboreRadiusM: rwSI,
      });
    } else if (regime === "fractured") {
      if (reSI == null || xfSI == null) return;
      j = productivityIndexFracturedWellPISI({
        ...base,
        drainageRadiusM: reSI,
        fractureHalfLengthM: xfSI,
      });
    }

    if (j == null || !Number.isFinite(j) || j < 0) {
      setError("Inputs result in an invalid productivity index. Please check values.");
      setPi(null);
      return;
    }

    setError(null);
    setPi(j);
  };

  const hasResult = pi != null && error == null;

  return (
    <CalculatorLayout
      title="Productivity Index"
      description="Productivity index for different flow regimes."
      sectionHref="/production"
      sectionLabel="Production Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Flow regime
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as FlowRegime)}
                className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              >
                {FLOW_REGIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedFormula && (
              <p className="text-xs text-muted">
                {selectedFormula}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput
              quantity="permeability"
              label="Permeability k"
              name="k"
              value={kVal}
              unit={kUnit}
              onValueChange={setKVal}
              onUnitChange={setKUnit}
              onValueSI={setKSI}
            />
            <UnitInput
              quantity="length"
              label="Net thickness h"
              name="h"
              value={hVal}
              unit={hUnit}
              onValueChange={setHVal}
              onUnitChange={setHUnit}
              onValueSI={setHSI}
            />
            <UnitInput
              quantity="viscosity"
              label="Viscosity μ"
              name="mu"
              value={muVal}
              unit={muUnit}
              onValueChange={setMuVal}
              onUnitChange={setMuUnit}
              onValueSI={setMuSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Oil FVF Bo"
              name="bo"
              value={boVal}
              unit={boUnit}
              onValueChange={setBoVal}
              onUnitChange={setBoUnit}
              onValueSI={setBoSI}
            />
            {(regime === "steady" || regime === "transient" || regime === "pseudoSteady" || regime === "fractured") && (
              <UnitInput
                quantity="length"
                label="Drainage radius re"
                name="re"
                value={reVal}
                unit={reUnit}
                onValueChange={setReVal}
                onUnitChange={setReUnit}
                onValueSI={setReSI}
              />
            )}
            {(regime === "steady" || regime === "transient" || regime === "pseudoSteady" || regime === "horizontal") && (
              <UnitInput
                quantity="length"
                label="Wellbore radius rw"
                name="rw"
                value={rwVal}
                unit={rwUnit}
                onValueChange={setRwVal}
                onUnitChange={setRwUnit}
                onValueSI={setRwSI}
              />
            )}
            {regime === "pseudoSteady" && (
              <UnitInput
                quantity="dimensionless"
                label="Skin factor s"
                name="s"
                value={sVal}
                unit={sUnit}
                onValueChange={setSVal}
                onUnitChange={setSUnit}
                onValueSI={setSSI}
              />
            )}
            {regime === "horizontal" && (
              <UnitInput
                quantity="length"
                label="Horizontal length L"
                name="L"
                value={lVal}
                unit={lUnit}
                onValueChange={setLVal}
                onUnitChange={setLUnit}
                onValueSI={setLSI}
              />
            )}
            {regime === "fractured" && (
              <UnitInput
                quantity="length"
                label="Fracture half-length xf"
                name="xf"
                value={xfVal}
                unit={xfUnit}
                onValueChange={setXfVal}
                onUnitChange={setXfUnit}
                onValueSI={setXfSI}
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={kSI == null || hSI == null || muSI == null || boSI == null}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Calculate productivity index
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div>
          {hasResult && (
            <ResultPanel
              items={[
                { label: "Productivity index J", value: pi!.toFixed(3), unit: "stb/d/psi" },
                {
                  label: "Flow regime",
                  value: FLOW_REGIME_OPTIONS.find((opt) => opt.value === regime)?.label ?? regime,
                },
              ]}
            />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}

