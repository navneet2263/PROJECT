"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import ResultPanel from "@/components/ResultPanel";
import GenericGraphPanel from "@/components/GenericGraphPanel";
import { coreyRelPermAtSw, coreyRelPermCurve, type CoreyRelPermPoint, type CoreyRelPermParams } from "@/lib/production";

export default function RelativePermeabilityPage() {
  const [swVal, setSwVal] = useState("0.3");
  const [swUnit, setSwUnit] = useState("—");
  const [swSI, setSwSI] = useState<number | null>(null);

  const [swcVal, setSwcVal] = useState("0.2");
  const [swcUnit, setSwcUnit] = useState("—");
  const [swcSI, setSwcSI] = useState<number | null>(null);

  const [sorVal, setSorVal] = useState("0.2");
  const [sorUnit, setSorUnit] = useState("—");
  const [sorSI, setSorSI] = useState<number | null>(null);

  const [kroEndVal, setKroEndVal] = useState("1");
  const [kroEndUnit, setKroEndUnit] = useState("—");
  const [kroEndSI, setKroEndSI] = useState<number | null>(null);

  const [krwEndVal, setKrwEndVal] = useState("0.3");
  const [krwEndUnit, setKrwEndUnit] = useState("—");
  const [krwEndSI, setKrwEndSI] = useState<number | null>(null);

  const [noVal, setNoVal] = useState("2");
  const [noUnit, setNoUnit] = useState("—");
  const [noSI, setNoSI] = useState<number | null>(null);

  const [nwVal, setNwVal] = useState("2");
  const [nwUnit, setNwUnit] = useState("—");
  const [nwSI, setNwSI] = useState<number | null>(null);

  const [curve, setCurve] = useState<CoreyRelPermPoint[]>([]);
  const [swPoint, setSwPoint] = useState<{
    sw: number;
    swEff: number;
    kro: number;
    krw: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const graphData = useMemo(
    () =>
      curve.map((p) => ({
        sw: p.sw * 100,
        krw: p.krw,
        kro: p.kro,
      })),
    [curve],
  );

  const handleCalculate = () => {
    if (
      swSI == null ||
      swcSI == null ||
      sorSI == null ||
      kroEndSI == null ||
      krwEndSI == null ||
      noSI == null ||
      nwSI == null
    ) {
      return;
    }

    const sw = swSI;
    const swc = swcSI;
    const sor = sorSI;
    const kroEnd = kroEndSI;
    const krwEnd = krwEndSI;
    const noExp = noSI;
    const nwExp = nwSI;

    if (swc < 0 || swc >= 1 || sor < 0 || sor >= 1 || swc + sor >= 1) {
      setError("Swc and Sor must be between 0 and 1 and satisfy Swc + Sor < 1.");
      setCurve([]);
      setSwPoint(null);
      return;
    }

    if (sw < 0 || sw > 1) {
      setError("Sw must be between 0 and 1.");
      setCurve([]);
      setSwPoint(null);
      return;
    }

    const swMin = swc;
    const swMax = 1 - sor;
    if (sw < swMin || sw > swMax) {
      setError("Sw must lie between Swc and 1 − Sor.");
      setCurve([]);
      setSwPoint(null);
      return;
    }

    if (kroEnd < 0 || krwEnd < 0) {
      setError("Endpoint relative permeabilities must be non-negative.");
      setCurve([]);
      setSwPoint(null);
      return;
    }

    const params: CoreyRelPermParams = {
      swc,
      sor,
      kroEnd,
      krwEnd,
      no: noExp,
      nw: nwExp,
    };

    const curvePoints = coreyRelPermCurve(params, 50);
    const point = coreyRelPermAtSw(sw, params);

    setError(null);
    setCurve(curvePoints);
    setSwPoint({
      sw,
      swEff: point.swEff,
      kro: point.kro,
      krw: point.krw,
    });
  };

  const hasResult = swPoint != null && error == null;

  return (
    <CalculatorLayout
      title="Relative Permeability (Corey)"
      description="Oil and water relative permeabilities from Corey-type correlations."
      sectionHref="/production"
      sectionLabel="Production Engineering"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitInput
              quantity="dimensionless"
              label="Water saturation Sw"
              name="sw"
              value={swVal}
              unit={swUnit}
              onValueChange={setSwVal}
              onUnitChange={setSwUnit}
              onValueSI={setSwSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Connate water saturation Swc"
              name="swc"
              value={swcVal}
              unit={swcUnit}
              onValueChange={setSwcVal}
              onUnitChange={setSwcUnit}
              onValueSI={setSwcSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Residual oil saturation Sor"
              name="sor"
              value={sorVal}
              unit={sorUnit}
              onValueChange={setSorVal}
              onUnitChange={setSorUnit}
              onValueSI={setSorSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Endpoint kro"
              name="kro_end"
              value={kroEndVal}
              unit={kroEndUnit}
              onValueChange={setKroEndVal}
              onUnitChange={setKroEndUnit}
              onValueSI={setKroEndSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Endpoint krw"
              name="krw_end"
              value={krwEndVal}
              unit={krwEndUnit}
              onValueChange={setKrwEndVal}
              onUnitChange={setKrwEndUnit}
              onValueSI={setKrwEndSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Oil exponent no"
              name="no"
              value={noVal}
              unit={noUnit}
              onValueChange={setNoVal}
              onUnitChange={setNoUnit}
              onValueSI={setNoSI}
            />
            <UnitInput
              quantity="dimensionless"
              label="Water exponent nw"
              name="nw"
              value={nwVal}
              unit={nwUnit}
              onValueChange={setNwVal}
              onUnitChange={setNwUnit}
              onValueSI={setNwSI}
            />
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={
              swSI == null ||
              swcSI == null ||
              sorSI == null ||
              kroEndSI == null ||
              krwEndSI == null ||
              noSI == null ||
              nwSI == null
            }
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Calculate relative permeability
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="space-y-4">
          {hasResult && (
            <ResultPanel
              items={[
                { label: "Sw", value: swPoint!.sw.toFixed(3) },
                { label: "Sw, effective", value: swPoint!.swEff.toFixed(3) },
                { label: "kro", value: swPoint!.kro.toFixed(4) },
                { label: "krw", value: swPoint!.krw.toFixed(4) },
              ]}
            />
          )}
          {curve.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-elevated p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Relative permeability table</h3>
              <div className="max-h-80 overflow-auto">
                <table className="min-w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted">
                      <th className="px-2 py-1 font-medium">Sw</th>
                      <th className="px-2 py-1 font-medium">kro</th>
                      <th className="px-2 py-1 font-medium">krw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curve.map((p) => (
                      <tr key={p.sw} className="border-b border-border/60 last:border-0">
                        <td className="px-2 py-1 font-mono">{p.sw.toFixed(3)}</td>
                        <td className="px-2 py-1 font-mono">{p.kro.toFixed(4)}</td>
                        <td className="px-2 py-1 font-mono">{p.krw.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {graphData.length > 0 && (
        <div className="mt-8">
          <GenericGraphPanel
            title="Relative permeability vs water saturation"
            data={graphData}
            xKey="sw"
            lines={[
              { dataKey: "krw", name: "krw", color: "#0ea5e9" },
              { dataKey: "kro", name: "kro", color: "#f97316" },
            ]}
            xUnit="%"
            yUnit="—"
          />
        </div>
      )}
    </CalculatorLayout>
  );
}

