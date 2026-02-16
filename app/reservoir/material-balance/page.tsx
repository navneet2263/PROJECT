"use client";

import { useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import UnitInput from "@/components/UnitInput";
import InputField from "@/components/InputField";
import ResultPanel from "@/components/ResultPanel";
import { materialBalanceBasicSI } from "@/lib/reservoir";
import { convertFromSI } from "@/lib/units";

export default function MaterialBalancePage() {
  const [bo, setBo] = useState("1.2");
  const [bp, setBp] = useState("1");
  const [boi, setBoi] = useState("1.15");
  const [bpi, setBpi] = useState("1");
  const [cf, setCf] = useState("3e-6");
  const [cw, setCw] = useState("3e-6");
  const [swi, setSwi] = useState("0.25");
  const [weVal, setWeVal] = useState("0");
  const [weUnit, setWeUnit] = useState("stb");
  const [weSI, setWeSI] = useState<number | null>(0);
  const [wpVal, setWpVal] = useState("0");
  const [wpUnit, setWpUnit] = useState("stb");
  const [wpSI, setWpSI] = useState<number | null>(0);
  const [npVal, setNpVal] = useState("1e6");
  const [npUnit, setNpUnit] = useState("stb");
  const [npSI, setNpSI] = useState<number | null>(null);
  const [gpVal, setGpVal] = useState("5e8");
  const [gpUnit, setGpUnit] = useState("m³");
  const [gpSI, setGpSI] = useState<number | null>(null);
  const [rs, setRs] = useState("500");
  const [rsi, setRsi] = useState("600");
  const [bg, setBg] = useState("0.001");
  const [bgi, setBgi] = useState("0.0009");
  const [result, setResult] = useState<{ fM3: number; eo: number; eg: number } | null>(null);

  const handleCalculate = () => {
    if (npSI == null || gpSI == null) return;
    const r = materialBalanceBasicSI({
      n: 0,
      bo: Number(bo),
      bp: Number(bp),
      boi: Number(boi),
      bpi: Number(bpi),
      cf: Number(cf),
      cw: Number(cw),
      swi: Number(swi),
      we: weSI ?? 0,
      wp: wpSI ?? 0,
      np: npSI,
      gp: gpSI,
      rs: Number(rs),
      rsi: Number(rsi),
      bg: Number(bg),
      bgi: Number(bgi),
    });
    setResult(r);
  };

  const fStb = result != null ? convertFromSI(result.fM3, "stb", "volume") : null;

  return (
    <CalculatorLayout title="Material Balance (Basic)" description="Basic material balance equation terms: F, Eo, Eg." sectionHref="/reservoir" sectionLabel="Reservoir Engineering">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Bo" name="bo" value={bo} onChange={setBo} />
            <InputField label="Bp (water)" name="bp" value={bp} onChange={setBp} />
            <InputField label="Boi" name="boi" value={boi} onChange={setBoi} />
            <InputField label="Bpi" name="bpi" value={bpi} onChange={setBpi} />
            <InputField label="cf" name="cf" value={cf} onChange={setCf} />
            <InputField label="cw" name="cw" value={cw} onChange={setCw} />
            <InputField label="Swi" name="swi" value={swi} onChange={setSwi} />
            <UnitInput quantity="volume" label="We" name="we" value={weVal} unit={weUnit} onValueChange={setWeVal} onUnitChange={setWeUnit} onValueSI={setWeSI} />
            <UnitInput quantity="volume" label="Wp" name="wp" value={wpVal} unit={wpUnit} onValueChange={setWpVal} onUnitChange={setWpUnit} onValueSI={setWpSI} />
            <UnitInput quantity="volume" label="Np" name="np" value={npVal} unit={npUnit} onValueChange={setNpVal} onUnitChange={setNpUnit} onValueSI={setNpSI} />
            <UnitInput quantity="volume" label="Gp" name="gp" value={gpVal} unit={gpUnit} onValueChange={setGpVal} onUnitChange={setGpUnit} onValueSI={setGpSI} />
            <InputField label="Rs" name="rs" value={rs} onChange={setRs} />
            <InputField label="Rsi" name="rsi" value={rsi} onChange={setRsi} />
            <InputField label="Bg" name="bg" value={bg} onChange={setBg} />
            <InputField label="Bgi" name="bgi" value={bgi} onChange={setBgi} />
          </div>
          <button type="button" onClick={handleCalculate} disabled={npSI == null || gpSI == null} className="mt-4 w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50">
            Calculate
          </button>
        </div>
        <div>
          {result != null && fStb != null && (
            <ResultPanel
              items={[
                { label: "F", value: fStb.toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: "STB" },
                { label: "Eo", value: result.eo.toFixed(6) },
                { label: "Eg", value: result.eg.toFixed(6) },
              ]}
            />
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
