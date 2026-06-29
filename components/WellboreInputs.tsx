"use client";

import { useState } from "react";
import UnitInput from "./UnitInput";

export interface WellboreState {
    wellDepth: number;
    depthUnit: string;

    tubingDiameter: number;
    diameterUnit: string;

    wellheadPressure: number;
    whpUnit: string;

    roughness: number;
    roughnessUnit: string;

    wellInclination: number;

    // Advanced parameters
    flowlinePressure: number;
    casingSize: string;
}

export const defaultWellboreState: WellboreState = {
    wellDepth: 8000,
    depthUnit: "ft",

    tubingDiameter: 2.875,
    diameterUnit: "in",

    wellheadPressure: 200,
    whpUnit: "psi",

    roughness: 0.0006,
    roughnessUnit: "in",

    wellInclination: 90, // degrees from horizontal, typically vertical = 90

    // Advanced defaults
    flowlinePressure: 150,
    casingSize: "7\"",
};

interface Props {
    data: WellboreState;
    onChange: (update: Partial<WellboreState>) => void;
}

export default function WellboreInputs({ data, onChange }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Wellbore Inputs</h3>

            <UnitInput
                quantity="length"
                label="Well Depth"
                name="wellDepth"
                value={data.wellDepth.toString()}
                unit={data.depthUnit}
                onValueChange={(v) => onChange({ wellDepth: Number(v) })}
                onUnitChange={(u) => onChange({ depthUnit: u })}
                onValueSI={() => { }}
            />

            <UnitInput
                quantity="length"
                label="Tubing Inner Diameter"
                name="tubingDiameter"
                value={data.tubingDiameter.toString()}
                unit={data.diameterUnit}
                onValueChange={(v) => onChange({ tubingDiameter: Number(v) })}
                onUnitChange={(u) => onChange({ diameterUnit: u })}
                onValueSI={() => { }}
            />

            <UnitInput
                quantity="pressure"
                label="Wellhead Pressure"
                name="wellheadPressure"
                value={data.wellheadPressure.toString()}
                unit={data.whpUnit}
                onValueChange={(v) => onChange({ wellheadPressure: Number(v) })}
                onUnitChange={(u) => onChange({ whpUnit: u })}
                onValueSI={() => { }}
            />

            <UnitInput
                quantity="length"
                label="Tubing Roughness"
                name="roughness"
                value={data.roughness.toString()}
                unit={data.roughnessUnit}
                onValueChange={(v) => onChange({ roughness: Number(v) })}
                onUnitChange={(u) => onChange({ roughnessUnit: u })}
                onValueSI={() => { }}
            />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Well Inclination (degrees)</label>
                <div className="flex rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/30">
                    <input
                        type="number"
                        value={data.wellInclination}
                        onChange={(e) => onChange({ wellInclination: Number(e.target.value) })}
                        min={0}
                        max={90}
                        className="flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-muted focus:outline-none dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Collapsible Section: Advanced Well Parameters */}
            <div className="border-t border-border/50 pt-4 mt-2">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-accent focus:outline-none"
                >
                    <span>Advanced Well Parameters</span>
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
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Flowline Pressure (psi)</label>
                            <input
                                type="number"
                                value={data.flowlinePressure}
                                onChange={(e) => onChange({ flowlinePressure: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Casing Size</label>
                            <select
                                value={data.casingSize}
                                onChange={(e) => onChange({ casingSize: e.target.value })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:bg-surface dark:text-slate-100"
                            >
                                <option value="4½&quot;"> 4-1/2&quot;</option>
                                <option value="5½&quot;"> 5-1/2&quot;</option>
                                <option value="7&quot;">7&quot;</option>
                                <option value="9⅝&quot;"> 9-5/8&quot;</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

