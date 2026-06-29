"use client";

import { optimizeTubing, TubingOptimizationInputs } from "@/lib/tubingOptimization";

function formatNumber(value: number, fractionDigits = 1): string {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

function formatTubingSize(value: number): string {
    return `${value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} in`;
}

export default function TubingOptimization(props: TubingOptimizationInputs) {
    const analysis = optimizeTubing(props);

    return (
        <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Tubing Optimization
                    </h2>
                    <p className="text-sm text-muted">
                        Nodal comparison across standard tubing diameters.
                    </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Recommended: {formatTubingSize(analysis.recommendedTubingSize)}
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                        <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Tubing Size</th>
                                <th className="px-4 py-3 text-right font-semibold">Operating Rate</th>
                                <th className="px-4 py-3 text-right font-semibold">Production Gain</th>
                                <th className="px-4 py-3 text-right font-semibold">Efficiency</th>
                                <th className="px-4 py-3 text-left font-semibold">Recommendation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-surface-elevated">
                            {analysis.results.map((result) => (
                                <tr
                                    key={result.tubingSize}
                                    className={result.recommended ? "bg-accent/10" : "transition-colors hover:bg-surface"}
                                >
                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                                        {formatTubingSize(result.tubingSize)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                        {formatNumber(result.operatingRate)}
                                        <span className="ml-1 text-muted">STB/day</span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${result.productionGain >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
                                        {result.productionGain >= 0 ? "+" : ""}
                                        {formatNumber(result.productionGain)}
                                        <span className="ml-1">%</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                        {formatNumber(result.efficiency)}
                                        <span className="ml-1 text-muted">%</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {result.recommended ? (
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                Recommended
                                            </span>
                                        ) : (
                                            <span className="text-muted">Alternative</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Expected Production Increase</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                        {formatNumber(analysis.expectedProductionIncrease)}
                        <span className="ml-1 text-sm font-medium text-muted">%</span>
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pressure Reduction</p>
                    <p className="mt-2 text-2xl font-bold text-accent">
                        {formatNumber(analysis.pressureReduction)}
                        <span className="ml-1 text-sm font-medium text-muted">psi</span>
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 md:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Engineering Explanation</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        {analysis.engineeringExplanation}
                    </p>
                </div>
            </div>
        </section>
    );
}
