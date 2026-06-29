"use client";

import { useState, useEffect } from "react";
import { recommendArtificialLift, LiftInputs, LiftRecommendation } from "@/lib/artificialLift";
import InputField from "./InputField";

interface Props {
    initialInputs: LiftInputs;
}

export default function ArtificialLiftRecommendation({ initialInputs }: Props) {
    const [inputs, setInputs] = useState<LiftInputs>(initialInputs);
    const [result, setResult] = useState(() => recommendArtificialLift(initialInputs));

    // Update results when inputs change
    useEffect(() => {
        setResult(recommendArtificialLift(inputs));
    }, [inputs]);

    // Keep inputs synced if initialInputs change (e.g. when simulation runs again with new inputs)
    useEffect(() => {
        setInputs(initialInputs);
    }, [initialInputs]);

    const handleInputChange = (field: keyof LiftInputs, value: string | number | boolean) => {
        setInputs((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const recommended = result.recommended;
    const alternatives = result.alternatives;

    return (
        <div className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md transition-all">
            {/* Warning Banner */}
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center shadow-inner dark:border-red-900/50 dark:bg-red-900/20">
                <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-semibold text-red-800 dark:text-red-300">
                        Natural flow not possible. Artificial lift recommended.
                    </p>
                </div>
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    The Inflow Performance Relationship does not intersect with the Vertical Lift Performance curve.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left Panel: Override Parameters */}
                <div className="flex flex-col gap-4 border-r border-border/50 pr-0 md:pr-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            Lift Evaluation Parameters
                        </h3>
                        <p className="text-xs text-muted mt-1">
                            Adjust parameters below to see real-time recommendation updates.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Well Depth"
                            name="depth"
                            value={inputs.depth}
                            onChange={(val) => handleInputChange("depth", Number(val))}
                            unit="ft"
                        />
                        <InputField
                            label="Rate Potential"
                            name="ratePotential"
                            value={inputs.ratePotential}
                            onChange={(val) => handleInputChange("ratePotential", Number(val))}
                            unit="stb/d"
                        />
                        <InputField
                            label="Gas Fraction"
                            name="gasFraction"
                            value={inputs.gasFraction}
                            onChange={(val) => handleInputChange("gasFraction", Number(val))}
                            unit="fraction"
                            min={0}
                            max={1}
                            step="0.01"
                        />
                        <InputField
                            label="Oil Viscosity"
                            name="viscosity"
                            value={inputs.viscosity}
                            onChange={(val) => handleInputChange("viscosity", Number(val))}
                            unit="cP"
                        />
                        <InputField
                            label="Well Deviation"
                            name="deviation"
                            value={inputs.deviation}
                            onChange={(val) => handleInputChange("deviation", Number(val))}
                            unit="deg"
                            min={0}
                            max={90}
                        />

                        {/* Sand Production Toggle */}
                        <div className="flex flex-col justify-end pb-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Sand Production
                            </label>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={inputs.sandProduction}
                                    onChange={(e) => handleInputChange("sandProduction", e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                                <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">
                                    {inputs.sandProduction ? "Yes" : "No"}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Scoring & Recommendations */}
                <div className="flex flex-col gap-6">
                    {/* Recommended Lift */}
                    {recommended ? (
                        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 dark:bg-accent/10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                                        Best Fit Recommended
                                    </span>
                                    <h4 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {recommended.method}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-muted">Match Score</span>
                                    <p className="text-3xl font-extrabold text-accent">{recommended.score}</p>
                                </div>
                            </div>

                            {/* Reasons list */}
                            <div className="mt-4">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                    Suitability Logic
                                </h5>
                                <ul className="space-y-2">
                                    {recommended.reasons.length > 0 ? (
                                        recommended.reasons.map((reason, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{reason}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted italic">
                                            Meets general parameters (no active constraints triggered).
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-surface p-5 text-center">
                            <p className="text-muted italic">No suitable artificial lift method found with positive scores.</p>
                        </div>
                    )}

                    {/* Alternatives */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Alternative Lift Suitability
                        </h4>
                        <div className="space-y-3">
                            {alternatives.length > 0 ? (
                                alternatives.map((alt, idx) => (
                                    <div key={idx} className="rounded-lg border border-border bg-surface p-3.5 transition-all hover:bg-surface-elevated">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {alt.method}
                                            </span>
                                            <span className="font-bold text-slate-600 dark:text-slate-400">
                                                Score: {alt.score}
                                            </span>
                                        </div>
                                        <details className="mt-2 text-xs text-muted">
                                            <summary className="cursor-pointer hover:text-accent font-medium select-none">
                                                View analysis details
                                            </summary>
                                            <ul className="mt-2 pl-3 list-disc space-y-1">
                                                {alt.reasons.length > 0 ? (
                                                    alt.reasons.map((r, i) => <li key={i}>{r}</li>)
                                                ) : (
                                                    <li className="italic">Meets general parameters.</li>
                                                )}
                                            </ul>
                                        </details>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted italic">No alternative methods scored.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
