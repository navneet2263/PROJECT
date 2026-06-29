"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import IPRGraphPanel from "@/components/IPRGraphPanel";
import {
  linearIPR,
  vogelIPR,
  gasIPRPressureSquared,
  fetkovichIPR,
  horizontalWellIPR,
  fracturedWellIPR,
  productivityIndexRadialSteadyPISI,
  PI_SI_TO_STB_D_PSI,
  type ProductivityIndexHorizontalWellInputSI,
  type ProductivityIndexFracturedWellInputSI,
  type ProductivityIndexRadialSteadyInputSI,
} from "@/lib/production";
import { convertFromSI } from "@/lib/units";

type IPRModel =
  | "linear"
  | "vogel"
  | "gasPressureSquared"
  | "gasPseudopressure"
  | "fetkovich"
  | "horizontal"
  | "fractured";

interface ModelConfig {
  value: IPRModel;
  label: string;
  formula: string;
  isGas: boolean;
}

const MODELS: ModelConfig[] = [
  { value: "linear", label: "Linear IPR (single phase oil)", formula: "Q = J × (Pr − Pwf)", isGas: false },
  { value: "vogel", label: "Vogel IPR (solution gas drive)", formula: "Q/Qmax = 1 − 0.2(Pwf/Pr) − 0.8(Pwf/Pr)²", isGas: false },
  { value: "gasPressureSquared", label: "Gas Well IPR (Pressure-squared)", formula: "Q = Qmax × (1 − (Pwf/Pr)²)", isGas: true },
  { value: "gasPseudopressure", label: "Gas Well IPR (Pseudopressure)", formula: "Q ∝ m(Pr) − m(Pwf) (p² approx)", isGas: true },
  { value: "fetkovich", label: "Fetkovich IPR", formula: "Q = Qmax × (1 − (Pwf/Pr)²)^n", isGas: false },
  { value: "horizontal", label: "Horizontal Well IPR", formula: "Q = J × (Pr − Pwf), Joshi J", isGas: false },
  { value: "fractured", label: "Fractured Well IPR", formula: "Q = J × (Pr − Pwf), fractured J", isGas: false },
];

export default function IPRAnalysisPage() {
  const [model, setModel] = useState<IPRModel>("vogel");

  const [prVal, setPrVal] = useState("2500");
  const [prUnit, setPrUnit] = useState("psi");
  const [prSI, setPrSI] = useState<number | null>(null);

  const [qMaxVal, setQMaxVal] = useState("5000");
  const [qMaxUnit, setQMaxUnit] = useState("stb/d");
  const [qMaxSI, setQMaxSI] = useState<number | null>(null);

  const [nVal, setNVal] = useState("1");
  const [nUnit, setNUnit] = useState("—");
  const [nSI, setNSI] = useState<number | null>(null);

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

  const [lVal, setLVal] = useState("1000");
  const [lUnit, setLUnit] = useState("ft");
  const [lSI, setLSI] = useState<number | null>(null);

  const [xfVal, setXfVal] = useState("100");
  const [xfUnit, setXfUnit] = useState("ft");
  const [xfSI, setXfSI] = useState<number | null>(null);

  const [curve, setCurve] = useState<{ pwfPa: number; qM3S: number }[]>([]);
  const [maxRateSI, setMaxRateSI] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cfg = MODELS.find((m) => m.value === model)!;
  const rateUnit = cfg?.isGas ? "MSCF/d" : "stb/d";

  const graphData = useMemo(() => {
    return curve.map(({ pwfPa, qM3S }) => ({
      pwf: convertFromSI(pwfPa, "psi", "pressure"),
      rate: cfg?.isGas ? convertFromSI(qM3S, "MSCF/d", "flowrate") : convertFromSI(qM3S, "stb/d", "flowrate"),
    }));
  }, [curve, cfg?.isGas]);

  const maxRateDisplay = useMemo(() => {
    if (maxRateSI == null) return null;
    return cfg?.isGas
      ? convertFromSI(maxRateSI, "MSCF/d", "flowrate")
      : convertFromSI(maxRateSI, "stb/d", "flowrate");
  }, [maxRateSI, cfg?.isGas]);

  const handleCalculate = () => {
    setError(null);
    setCurve([]);
    setMaxRateSI(null);

    if (prSI == null || prSI <= 0) {
      setError("Reservoir pressure is required.");
      return;
    }

    let points: { pwfPa: number; qM3S: number }[] = [];
    let qMax = 0;

    try {
      if (model === "linear") {
        if (kSI == null || hSI == null || muSI == null || boSI == null || reSI == null || rwSI == null) {
          setError("All reservoir parameters are required for linear IPR.");
          return;
        }
        const input: ProductivityIndexRadialSteadyInputSI = {
          permeabilityM2: kSI,
          thicknessM: hSI,
          viscosityPaS: muSI,
          formationVolumeFactorRBPerSTB: boSI,
          drainageRadiusM: reSI,
          wellboreRadiusM: rwSI,
        };
        const j = productivityIndexRadialSteadyPISI(input);
        const jSI = j / PI_SI_TO_STB_D_PSI;
        points = linearIPR(prSI, jSI, 30);
        qMax = points.length > 0 ? points[0].qM3S : 0;
      } else if (model === "vogel" || model === "gasPressureSquared" || model === "gasPseudopressure") {
        if (qMaxSI == null || qMaxSI <= 0) {
          setError("Maximum rate (AOF) is required.");
          return;
        }
        points = model === "vogel" ? vogelIPR(prSI, qMaxSI, 30) : gasIPRPressureSquared(prSI, qMaxSI, 30);
        qMax = qMaxSI;
      } else if (model === "fetkovich") {
        if (qMaxSI == null || qMaxSI <= 0 || nSI == null || nSI <= 0) {
          setError("Maximum rate and exponent n are required.");
          return;
        }
        points = fetkovichIPR(prSI, qMaxSI, nSI, 30);
        qMax = qMaxSI;
      } else if (model === "horizontal") {
        if (kSI == null || hSI == null || muSI == null || boSI == null || lSI == null || rwSI == null) {
          setError("All reservoir parameters are required for horizontal well IPR.");
          return;
        }
        const input: ProductivityIndexHorizontalWellInputSI = {
          permeabilityM2: kSI,
          thicknessM: hSI,
          viscosityPaS: muSI,
          formationVolumeFactorRBPerSTB: boSI,
          horizontalLengthM: lSI,
          wellboreRadiusM: rwSI,
        };
        points = horizontalWellIPR(prSI, input, 30);
        qMax = points.length > 0 ? points[0].qM3S : 0;
      } else if (model === "fractured") {
        if (kSI == null || hSI == null || muSI == null || boSI == null || reSI == null || xfSI == null) {
          setError("All reservoir parameters are required for fractured well IPR.");
          return;
        }
        const input: ProductivityIndexFracturedWellInputSI = {
          permeabilityM2: kSI,
          thicknessM: hSI,
          viscosityPaS: muSI,
          formationVolumeFactorRBPerSTB: boSI,
          drainageRadiusM: reSI,
          fractureHalfLengthM: xfSI,
        };
        points = fracturedWellIPR(prSI, input, 30);
        qMax = points.length > 0 ? points[0].qM3S : 0;
      }
    } catch {
      setError("Invalid inputs.");
      return;
    }

    setCurve(points);
    setMaxRateSI(qMax);
  };

  const canCalculate = useMemo(() => {
    if (prSI == null || prSI <= 0) return false;
    if (model === "linear") return kSI != null && hSI != null && muSI != null && boSI != null && reSI != null && rwSI != null;
    if (model === "horizontal") return kSI != null && hSI != null && muSI != null && boSI != null && lSI != null && rwSI != null;
    if (model === "fractured") return kSI != null && hSI != null && muSI != null && boSI != null && reSI != null && xfSI != null;
    if (model === "fetkovich") return qMaxSI != null && qMaxSI > 0 && nSI != null && nSI > 0;
    if (model === "vogel" || model === "gasPressureSquared" || model === "gasPseudopressure") {
      return qMaxSI != null && qMaxSI > 0;
    }
    return false;
  }, [model, prSI, qMaxSI, nSI, kSI, hSI, muSI, boSI, reSI, rwSI, lSI, xfSI]);

  const showQMax = ["vogel", "gasPressureSquared", "gasPseudopressure", "fetkovich"].includes(model);
  const showN = model === "fetkovich";
  const showReservoir = ["linear", "horizontal", "fractured"].includes(model);
  const showRe = ["linear", "fractured"].includes(model);
  const showRw = ["linear", "horizontal"].includes(model);
  const showL = model === "horizontal";
  const showXf = model === "fractured";

  return (
    <CalculatorLayout
      title="IPR Analysis"
      description="Inflow performance relationships for oil and gas wells."
      sectionHref="/production"
      sectionLabel="Production Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select IPR Model
            </label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value as IPRModel);
                setCurve([]);
                setMaxRateSI(null);
              }}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {cfg && <p className="mt-2 text-xs text-muted">{cfg.formula}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput
              quantity="pressure"
              label="Reservoir pressure Pr"
              name="pr"
              value={prVal}
              unit={prUnit}
              onValueChange={setPrVal}
              onUnitChange={setPrUnit}
              onValueSI={setPrSI}
            />
            {showQMax && (
              <UnitInput
                quantity="flowrate"
                label="Max rate Qmax (AOF)"
                name="qmax"
                value={qMaxVal}
                unit={qMaxUnit}
                onValueChange={setQMaxVal}
                onUnitChange={setQMaxUnit}
                onValueSI={setQMaxSI}
              />
            )}
            {showN && (
              <UnitInput
                quantity="dimensionless"
                label="Exponent n"
                name="n"
                value={nVal}
                unit={nUnit}
                onValueChange={setNVal}
                onUnitChange={setNUnit}
                onValueSI={setNSI}
              />
            )}
            {showReservoir && (
              <>
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
                  label="FVF Bo"
                  name="bo"
                  value={boVal}
                  unit={boUnit}
                  onValueChange={setBoVal}
                  onUnitChange={setBoUnit}
                  onValueSI={setBoSI}
                />
                {showRe && (
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
                {showRw && (
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
                {showL && (
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
                {showXf && (
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
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Generate IPR curve
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="space-y-4">
          {maxRateDisplay != null && (
            <ResultPanel
              items={[
                { label: "Max production rate (AOF)", value: maxRateDisplay.toFixed(2), unit: rateUnit },
                { label: "Model", value: cfg?.label ?? model },
              ]}
            />
          )}
        </div>
      </div>
      {graphData.length > 0 && (
        <div className="mt-8">
          <IPRGraphPanel
            title="IPR curve (Rate vs. Flowing BHP)"
            data={graphData}
            xLabel={`Rate (${rateUnit})`}
            yLabel="Flowing BHP (psi)"
            rateUnit={rateUnit}
          />
        </div>
      )}
    </CalculatorLayout>
  );
}