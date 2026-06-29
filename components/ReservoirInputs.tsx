"use client";

import { useState } from "react";
import UnitInput from "./UnitInput";

export interface ReservoirState {
    model: string;

    reservoirPressure: number;
    reservoirPressureUnit: string;

    permeability: number;
    permeabilityUnit: string;

    netPay: number;
    netPayUnit: string;

    drainageRadius: number;
    drainageRadiusUnit: string;

    wellboreRadius: number;
    wellboreRadiusUnit: string;

    skinFactor: number;

    oilViscosity: number;
    oilViscosityUnit: string;

    formationVolumeFactor: number;
    formationVolumeFactorUnit: string;

    // Empirical parameters
    j: number;
    jUnit: string;
    qMax: number;
    qMaxUnit: string;
    n: number;

    // Advanced parameters
    bubblePointPressure: number;
    driveMechanism: "Solution Gas Drive" | "Water Drive" | "Gas Cap Drive" | "Combination";
    porosity: number;
    initialReservoirPressure: number;
}

export const defaultReservoirState: ReservoirState = {
    model: "Vogel",
    reservoirPressure: 3000,
    reservoirPressureUnit: "psi",

    permeability: 45,
    permeabilityUnit: "mD",

    netPay: 100,
    netPayUnit: "ft",

    drainageRadius: 1000,
    drainageRadiusUnit: "ft",

    wellboreRadius: 0.328,
    wellboreRadiusUnit: "ft",

    skinFactor: 6.5,

    oilViscosity: 2,
    oilViscosityUnit: "cP",

    formationVolumeFactor: 1.2,
    formationVolumeFactorUnit: "—",

    j: 1.5,
    jUnit: "—",
    qMax: 2000,
    qMaxUnit: "stb/d",
    n: 1,

    // Advanced defaults
    bubblePointPressure: 2800,
    driveMechanism: "Solution Gas Drive",
    porosity: 0.22,
    initialReservoirPressure: 3500,
};


interface Props {
    data: ReservoirState;
    onChange: (update: Partial<ReservoirState>) => void;
}

export default function ReservoirInputs({ data, onChange }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Dynamic badge styles for Skin Factor
    let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    let badgeText = "Low";
    if (data.skinFactor >= 2 && data.skinFactor <= 5) {
        badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
        badgeText = "Medium";
    } else if (data.skinFactor > 5) {
        badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
        badgeText = "High";
    }

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Reservoir Inputs</h3>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">IPR Model</label>
                <select
                    value={data.model}
                    onChange={(e) => onChange({ model: e.target.value })}
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:bg-surface dark:text-slate-100"
                >
                    <option value="Linear">Linear</option>
                    <option value="Vogel">Vogel</option>
                    <option value="Fetkovich">Fetkovich</option>
                    <option value="Radial Steady State">Radial Steady State</option>
                    <option value="Radial Pseudo-Steady State">Radial Pseudo-Steady State</option>
                </select>
            </div>

            <UnitInput
                quantity="pressure"
                label="Reservoir Pressure"
                name="reservoirPressure"
                value={data.reservoirPressure === 0 ? "" : data.reservoirPressure.toString()}
                unit={data.reservoirPressureUnit}
                onValueChange={(v) => onChange({ reservoirPressure: Number(v) })}
                onUnitChange={(u) => onChange({ reservoirPressureUnit: u })}
                onValueSI={() => { }}
            />

            {(data.model === "Linear") && (
                <UnitInput
                    quantity="dimensionless"
                    label="Productivity Index (J)"
                    name="j"
                    value={data.j.toString()}
                    unit="—"
                    onValueChange={(v) => onChange({ j: Number(v) })}
                    onUnitChange={() => { }}
                    onValueSI={() => { }}
                />
            )}

            {(data.model === "Vogel" || data.model === "Fetkovich") && (
                <UnitInput
                    quantity="flowrate"
                    label="Absolute Open Flow (qMax)"
                    name="qMax"
                    value={data.qMax === 0 ? "" : data.qMax.toString()}
                    unit={data.qMaxUnit}
                    onValueChange={(v) => onChange({ qMax: Number(v) })}
                    onUnitChange={(u) => onChange({ qMaxUnit: u })}
                    onValueSI={() => { }}
                />
            )}

            {data.model === "Fetkovich" && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fetkovich Exponent (n)</label>
                    <input
                        type="number"
                        value={data.n}
                        onChange={(e) => onChange({ n: Number(e.target.value) })}
                        min={0.5}
                        max={1}
                        step={0.01}
                        className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                    />
                </div>
            )}

            {(data.model === "Radial Steady State" || data.model === "Radial Pseudo-Steady State") && (
                <>
                    <UnitInput
                        quantity="length"
                        label="Net Pay"
                        name="netPay"
                        value={data.netPay.toString()}
                        unit={data.netPayUnit}
                        onValueChange={(v) => onChange({ netPay: Number(v) })}
                        onUnitChange={(u) => onChange({ netPayUnit: u })}
                        onValueSI={() => { }}
                    />
                    <UnitInput
                        quantity="length"
                        label="Drainage Radius"
                        name="drainageRadius"
                        value={data.drainageRadius.toString()}
                        unit={data.drainageRadiusUnit}
                        onValueChange={(v) => onChange({ drainageRadius: Number(v) })}
                        onUnitChange={(u) => onChange({ drainageRadiusUnit: u })}
                        onValueSI={() => { }}
                    />
                    <UnitInput
                        quantity="length"
                        label="Wellbore Radius"
                        name="wellboreRadius"
                        value={data.wellboreRadius.toString()}
                        unit={data.wellboreRadiusUnit}
                        onValueChange={(v) => onChange({ wellboreRadius: Number(v) })}
                        onUnitChange={(u) => onChange({ wellboreRadiusUnit: u })}
                        onValueSI={() => { }}
                    />

                    <UnitInput
                        quantity="viscosity"
                        label="Oil Viscosity"
                        name="oilViscosity"
                        value={data.oilViscosity.toString()}
                        unit={data.oilViscosityUnit}
                        onValueChange={(v) => onChange({ oilViscosity: Number(v) })}
                        onUnitChange={(u) => onChange({ oilViscosityUnit: u })}
                        onValueSI={() => { }}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Formation Volume Factor</label>
                        <input
                            type="number"
                            value={data.formationVolumeFactor}
                            onChange={(e) => onChange({ formationVolumeFactor: Number(e.target.value) })}
                            step={0.01}
                            className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                        />
                    </div>
                </>
            )}

            {/* Collapsible Section: Advanced Reservoir Parameters */}
            <div className="border-t border-border/50 pt-4 mt-2">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-accent focus:outline-none"
                >
                    <span>Advanced Reservoir Parameters</span>
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
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bubble Point Pressure (psi)</label>
                            <input
                                type="number"
                                value={data.bubblePointPressure}
                                onChange={(e) => onChange({ bubblePointPressure: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Drive Mechanism</label>
                            <select
                                value={data.driveMechanism}
                                onChange={(e) => onChange({ driveMechanism: e.target.value as ReservoirState["driveMechanism"] })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:bg-surface dark:text-slate-100"
                            >
                                <option value="Solution Gas Drive">Solution Gas Drive</option>
                                <option value="Water Drive">Water Drive</option>
                                <option value="Gas Cap Drive">Gas Cap Drive</option>
                                <option value="Combination">Combination</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Permeability (md)</label>
                            <input
                                type="number"
                                value={data.permeability}
                                onChange={(e) => onChange({ permeability: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Porosity (fraction)</label>
                            <input
                                type="number"
                                value={data.porosity}
                                onChange={(e) => onChange({ porosity: Number(e.target.value) })}
                                step="0.01"
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skin Factor</label>
                                <span className={`rounded px-1.5 py-0.5 text-2xs font-semibold ${badgeColor}`}>
                                    {badgeText}
                                </span>
                            </div>
                            <input
                                type="number"
                                value={data.skinFactor}
                                onChange={(e) => onChange({ skinFactor: Number(e.target.value) })}
                                step="0.1"
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Initial Reservoir Pressure (psi)</label>
                            <input
                                type="number"
                                value={data.initialReservoirPressure}
                                onChange={(e) => onChange({ initialReservoirPressure: Number(e.target.value) })}
                                className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
