"use client";

import { useState } from "react";
import UnitInput from "./UnitInput";

export interface FluidState {
    oilDensity: number;
    oilDensityUnit: string;
    gasDensity: number;
    gasDensityUnit: string;
    waterCut: number;
    gasLiquidRatio: number;

    // Advanced parameters
    apiGravity: number;
    formationVolumeFactor: number;
    wellTemperature: number;
}

export const defaultFluidState: FluidState = {
    oilDensity: 40, // lb/ft3
    oilDensityUnit: "lb/ft³",
    gasDensity: 0.05,
    gasDensityUnit: "lb/ft³",
    waterCut: 0.1, // fraction
    gasLiquidRatio: 400, // scf/stb

    // Advanced defaults
    apiGravity: 32,
    formationVolumeFactor: 1.2,
    wellTemperature: 185,
};

interface Props {
    data: FluidState;
    onChange: (update: Partial<FluidState>) => void;
}

export default function FluidInputs({ data, onChange }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Fluid Inputs</h3>

            <UnitInput
                quantity="density"
                label="Oil Density"
                name="oilDensity"
                value={data.oilDensity.toString()}
                unit={data.oilDensityUnit}
                onValueChange={(v) => onChange({ oilDensity: Number(v) })}
                onUnitChange={(u) => onChange({ oilDensityUnit: u })}
                onValueSI={() => { }}
            />

            <UnitInput
                quantity="density"
                label="Gas Density"
                name="gasDensity"
                value={data.gasDensity.toString()}
                unit={data.gasDensityUnit}
                onValueChange={(v) => onChange({ gasDensity: Number(v) })}
                onUnitChange={(u) => onChange({ gasDensityUnit: u })}
                onValueSI={() => { }}
            />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Water Cut (fraction)
                </label>
                <div className="flex rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/30">
                    <input
                        type="number"
                        value={data.waterCut}
                        onChange={(e) => onChange({ waterCut: Number(e.target.value) })}
                        min={0}
                        max={1}
                        step={0.01}
                        className="flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-muted focus:outline-none dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Gas Liquid Ratio (scf/STB)
                </label>
                <div className="flex rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/30">
                    <input
                        type="number"
                        value={data.gasLiquidRatio}
                        onChange={(e) => onChange({ gasLiquidRatio: Number(e.target.value) })}
                        min={0}
                        className="flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-muted focus:outline-none dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Collapsible Section: Advanced Fluid Parameters */}
            <div className="border-t border-border/50 pt-4 mt-2">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-accent focus:outline-none"
                >
                    <span>Advanced Fluid Parameters</span>
                    <svg
                        className={`h-5 w-5 transform transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showAdvanced && (
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">API Gravity</label>
                            <input
                                type="number"
                                value={data.apiGravity}
                                onChange={(e) => onChange({ apiGravity: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Formation Volume Factor Bo (res bbl/STB)</label>
                            <input
                                type="number"
                                value={data.formationVolumeFactor}
                                onChange={(e) => onChange({ formationVolumeFactor: Number(e.target.value) })}
                                step="0.01"
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Well Temperature (°F)</label>
                            <input
                                type="number"
                                value={data.wellTemperature}
                                onChange={(e) => onChange({ wellTemperature: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
