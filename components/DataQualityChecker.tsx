"use client";

import { useState } from "react";
import { ReservoirState } from "./ReservoirInputs";
import { WellboreState } from "./WellboreInputs";
import { FluidState } from "./FluidInputs";

interface Props {
    res: ReservoirState;
    well: WellboreState;
    fluid: FluidState;
}

interface ValidationResult {
    param: string;
    value: string;
    status: "pass" | "warning" | "error" | "info";
    message: string;
}

export default function DataQualityChecker({ res, well, fluid }: Props) {
    const [isOpen, setIsOpen] = useState(true);

    // Run validation checks
    const checks: ValidationResult[] = [];

    // 1. waterCut 0–100 -> error if outside -> "Water cut must be between 0% and 100%"
    // (Note: in FluidInputs, waterCut is a fraction from 0.0 to 1.0, but let's handle percentage as well)
    const wcRaw = fluid.waterCut;
    const wcPct = wcRaw <= 1.0 && wcRaw > 0.0 ? wcRaw * 100 : wcRaw;
    const isWcValid = wcPct >= 0 && wcPct <= 100;
    checks.push({
        param: "Water Cut",
        value: `${(wcRaw <= 1.0 ? wcRaw * 100 : wcRaw).toFixed(1)}%`,
        status: isWcValid ? "pass" : "error",
        message: isWcValid ? "Valid" : "Water cut must be between 0% and 100%",
    });

    // 2. reservoirPressure > wellheadPressure -> warning if not -> "Reservoir pressure should exceed wellhead pressure"
    const pRes = res.reservoirPressure;
    const pWhp = well.wellheadPressure;
    const isPressOk = pRes > pWhp;
    checks.push({
        param: "Reservoir vs Wellhead Pressure",
        value: `${pRes} vs ${pWhp} psi`,
        status: isPressOk ? "pass" : "warning",
        message: isPressOk ? "Valid" : "Reservoir pressure should exceed wellhead pressure",
    });

    // 3. reservoirPressure > bubblePointPressure OR show info note -> "Reservoir below bubble point – two-phase flow expected"
    const pBub = res.bubblePointPressure;
    const isAbovePb = pRes > pBub;
    checks.push({
        param: "Bubble Point Pressure Check",
        value: `${pRes} vs ${pBub} psi`,
        status: isAbovePb ? "pass" : "info",
        message: isAbovePb ? "Valid" : "Reservoir below bubble point – two-phase flow expected",
    });

    // 4. permeability > 0 -> error if zero (or <= 0)
    const k = res.permeability;
    checks.push({
        param: "Permeability",
        value: `${k} mD`,
        status: k > 0 ? "pass" : "error",
        message: k > 0 ? "Valid" : "Permeability must be greater than 0",
    });

    // 5. porosity between 0.01–0.40 -> warning if outside
    const phi = res.porosity;
    const isPhiOk = phi >= 0.01 && phi <= 0.40;
    checks.push({
        param: "Porosity",
        value: `${(phi * 100).toFixed(1)}%`,
        status: isPhiOk ? "pass" : "warning",
        message: isPhiOk ? "Valid" : "Porosity should be between 0.01 and 0.40",
    });

    // 6. apiGravity between 10–70 -> warning if outside
    const api = fluid.apiGravity;
    const isApiOk = api >= 10 && api <= 70;
    checks.push({
        param: "API Gravity",
        value: `${api}°API`,
        status: isApiOk ? "pass" : "warning",
        message: isApiOk ? "Valid" : "API gravity should be between 10 and 70",
    });

    // 7. wellDepth > 0 -> error if zero
    const depth = well.wellDepth;
    checks.push({
        param: "Well Depth",
        value: `${depth} ${well.depthUnit || "ft"}`,
        status: depth > 0 ? "pass" : "error",
        message: depth > 0 ? "Valid" : "Well depth must be greater than 0",
    });

    // 8. tubingDiameter > 0 -> error if zero
    const dt = well.tubingDiameter;
    checks.push({
        param: "Tubing Diameter",
        value: `${dt} ${well.diameterUnit || "in"}`,
        status: dt > 0 ? "pass" : "error",
        message: dt > 0 ? "Valid" : "Tubing diameter must be greater than 0",
    });

    // 9. wellheadPressure >= 0 -> error if negative
    checks.push({
        param: "Wellhead Pressure",
        value: `${pWhp} ${well.whpUnit || "psi"}`,
        status: pWhp >= 0 ? "pass" : "error",
        message: pWhp >= 0 ? "Valid" : "Wellhead pressure cannot be negative",
    });

    // 10. skinFactor: info note if > 5 -> "High skin detected – consider stimulation"
    const s = res.skinFactor;
    checks.push({
        param: "Skin Factor",
        value: `${s}`,
        status: s > 5 ? "info" : "pass",
        message: s > 5 ? "High skin detected – consider stimulation" : "Valid",
    });

    // 11. oilViscosity > 0 -> error if zero or missing
    const muO = res.oilViscosity;
    checks.push({
        param: "Oil Viscosity",
        value: `${muO} ${res.oilViscosityUnit || "cP"}`,
        status: (muO && muO > 0) ? "pass" : "error",
        message: (muO && muO > 0) ? "Valid" : "Oil viscosity must be greater than 0",
    });

    // Count states
    const errors = checks.filter((c) => c.status === "error");
    const warnings = checks.filter((c) => c.status === "warning");
    const infos = checks.filter((c) => c.status === "info");
    const passes = checks.filter((c) => c.status === "pass");

    const errorCount = errors.length;
    const warningCount = warnings.length;
    const infoCount = infos.length;
    const passCount = passes.length;

    // Badge configuration
    let badgeText = "All pass";
    let badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";

    if (errorCount > 0) {
        badgeText = `${errorCount} error${errorCount > 1 ? "s" : ""}${warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? "s" : ""}` : ""}`;
        badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold";
    } else if (warningCount > 0) {
        badgeText = `${warningCount} warning${warningCount > 1 ? "s" : ""}`;
        badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold";
    }

    return (
        <div className="rounded-xl border border-border bg-surface-elevated shadow-sm transition-all">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Data Quality Check
                    </h4>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${badgeClass}`}>
                        {badgeText}
                    </span>
                </div>
                <svg
                    className={`h-5 w-5 text-muted transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="border-t border-border/50 p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/50 text-muted">
                                    <th className="pb-2 font-medium">Parameter</th>
                                    <th className="pb-2 font-medium">Value</th>
                                    <th className="pb-2 font-medium text-center">Status</th>
                                    <th className="pb-2 font-medium pl-3">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checks.map((check, index) => {
                                    // Row background classes
                                    let rowBg = "hover:bg-surface/30";
                                    let statusColor = "text-emerald-500";
                                    let statusIcon = (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    );

                                    if (check.status === "error") {
                                        rowBg = "bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100/30 dark:hover:bg-rose-950/20";
                                        statusColor = "text-rose-500";
                                        statusIcon = (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        );
                                    } else if (check.status === "warning") {
                                        rowBg = "bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100/30 dark:hover:bg-amber-950/20";
                                        statusColor = "text-amber-500";
                                        statusIcon = (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        );
                                    } else if (check.status === "info") {
                                        rowBg = "bg-sky-50/30 dark:bg-sky-950/10 hover:bg-sky-100/20 dark:hover:bg-sky-950/15";
                                        statusColor = "text-sky-500";
                                        statusIcon = (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        );
                                    }

                                    return (
                                        <tr key={index} className={`border-b border-border/30 transition-colors ${rowBg}`}>
                                            <td className="py-2.5 font-medium text-slate-700 dark:text-slate-300">{check.param}</td>
                                            <td className="py-2.5 text-slate-600 dark:text-slate-400">{check.value}</td>
                                            <td className="py-2.5 text-center">
                                                <div className={`inline-flex items-center justify-center ${statusColor}`}>
                                                    {statusIcon}
                                                </div>
                                            </td>
                                            <td className={`py-2.5 pl-3 text-slate-500 dark:text-slate-400 ${check.status === "pass" ? "italic opacity-50" : ""}`}>
                                                {check.status === "pass" ? "Pass" : check.message}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-3 flex items-center justify-between text-2xs text-muted border-t border-border/50 pt-2.5">
                        <span>
                            {passCount + infoCount} checks passed · {warningCount} warning{warningCount !== 1 ? "s" : ""} · {errorCount} error{errorCount !== 1 ? "s" : ""}
                        </span>
                        {errorCount > 0 ? (
                            <span className="text-rose-500 font-semibold">Errors need resolving</span>
                        ) : warningCount > 0 ? (
                            <span className="text-amber-500 font-semibold">Warnings to review</span>
                        ) : (
                            <span className="text-emerald-500 font-semibold">All inputs healthy</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
