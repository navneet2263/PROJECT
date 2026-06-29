"use client";

import { useRouter } from "next/navigation";
import {
    ProductionDiagnosis as ProductionDiagnosisResult,
    ProductionBottleneck,
} from "@/lib/productionDiagnosis";
import { SharedArtificialLiftRecommendation } from "@/components/SimulationStateProvider";

interface LossCard {
    label: string;
    value: number;
}

interface ProductionDiagnosisProps {
    diagnosis: ProductionDiagnosisResult;
    artificialLiftRecommendation: SharedArtificialLiftRecommendation | null;
    showArtificialLiftAction: boolean;
}

const bottleneckTone: Record<ProductionBottleneck, "green" | "yellow" | "red"> = {
    "Reservoir Pressure": "yellow",
    "Hydrostatic Head": "red",
    "Tubing Friction": "yellow",
    "Surface Back Pressure": "yellow",
    "Formation Damage": "red",
};

const severityClasses = {
    green: {
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        bar: "bg-emerald-500",
    },
    yellow: {
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        bar: "bg-amber-500",
    },
    red: {
        badge: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
        bar: "bg-red-500",
    },
};

function formatPressure(value: number): string {
    return value.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
}

function getLossSeverity(contribution: number): "green" | "yellow" | "red" {
    if (contribution >= 35) return "red";
    if (contribution >= 20) return "yellow";
    return "green";
}

function LossContribution({ label, value, total }: LossCard & { total: number }) {
    const contribution = total > 0 ? (value / total) * 100 : 0;
    const severity = getLossSeverity(contribution);

    return (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {formatPressure(value)}
                        <span className="ml-1 text-sm font-medium text-muted">psi</span>
                    </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityClasses[severity].badge}`}>
                    {contribution.toFixed(0)}%
                </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                    className={`h-full rounded-full ${severityClasses[severity].bar}`}
                    style={{ width: `${Math.min(contribution, 100)}%` }}
                />
            </div>
        </div>
    );
}

export default function ProductionDiagnosis({
    diagnosis,
    artificialLiftRecommendation,
    showArtificialLiftAction,
}: ProductionDiagnosisProps) {
    const router = useRouter();
    const primaryTone = bottleneckTone[diagnosis.primaryBottleneck];

    const cards: LossCard[] = [
        { label: "Reservoir Loss", value: diagnosis.reservoirLoss },
        { label: "Hydrostatic Loss", value: diagnosis.hydrostaticLoss },
        { label: "Tubing Friction", value: diagnosis.frictionLoss },
        { label: "Surface Back Pressure", value: diagnosis.surfaceBackPressure },
        { label: "Skin Effect", value: diagnosis.skinImpact },
        { label: "Overall Loss", value: diagnosis.totalLoss },
    ];

    return (
        <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Production Diagnosis
                    </h2>
                    <p className="text-sm text-muted">
                        Pressure-equivalent loss breakdown at the solved operating point.
                    </p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[primaryTone].badge}`}>
                    {diagnosis.primaryBottleneck}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <LossContribution
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        total={diagnosis.totalLoss}
                    />
                ))}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Engineering Recommendations
                    </h3>
                    <span className="text-sm font-semibold text-accent">
                        Primary Bottleneck: {diagnosis.primaryBottleneck}
                    </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                    {diagnosis.recommendations}
                </p>

                {showArtificialLiftAction && artificialLiftRecommendation ? (
                    <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-5 dark:bg-accent/10">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                    Recommended Artificial Lift
                                </p>
                                <h4 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                    {artificialLiftRecommendation.method}
                                </h4>
                                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Reason
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                    <li className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                        <span>Production diagnosis indicates lift support should be evaluated.</span>
                                    </li>
                                    {artificialLiftRecommendation.reasons.map((reason) => (
                                        <li key={reason} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push("/artificial-lift")}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-surface sm:w-auto"
                            >
                                Analyze Artificial Lift
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
