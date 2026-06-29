"use client";

import {
    calculateWellPerformanceDashboard,
    WellHealth,
} from "@/lib/wellPerformanceDashboard";

interface WellPerformanceDashboardProps {
    reservoirPressure: number;
    flowingPressure: number;
    operatingRate: number;
    maxDeliverability: number;
    naturalFlow: boolean;
    flowRegime: string;
}

interface MetricCard {
    label: string;
    value: string;
    unit?: string;
    tone?: "default" | "green" | "yellow" | "red";
}

const healthTone: Record<WellHealth, "green" | "yellow" | "red"> = {
    Excellent: "green",
    Moderate: "yellow",
    "Needs Optimization": "red",
};

const toneClasses: Record<NonNullable<MetricCard["tone"]>, string> = {
    default: "text-accent bg-accent/5 border-border",
    green: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-900/50",
    yellow: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-900/50",
    red: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-900/50",
};

const valueToneClasses: Record<NonNullable<MetricCard["tone"]>, string> = {
    default: "text-slate-900 dark:text-slate-100",
    green: "text-emerald-700 dark:text-emerald-300",
    yellow: "text-amber-700 dark:text-amber-300",
    red: "text-red-700 dark:text-red-300",
};

function formatNumber(value: number, fractionDigits = 1): string {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

function formatProductivityIndex(value: number | null): string {
    if (value === null) return "N/A";
    return formatNumber(value, 3);
}

function DashboardMetricCard({ label, value, unit, tone = "default" }: MetricCard) {
    return (
        <div className={`rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${toneClasses[tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {label}
            </p>
            <p className={`mt-3 text-2xl font-bold ${valueToneClasses[tone]}`}>
                {value}
                {unit ? (
                    <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
                ) : null}
            </p>
        </div>
    );
}

export default function WellPerformanceDashboard(props: WellPerformanceDashboardProps) {
    const dashboard = calculateWellPerformanceDashboard(props);

    const cards: MetricCard[] = [
        {
            label: "Operating Rate",
            value: formatNumber(dashboard.operatingRate),
            unit: "STB/day",
        },
        {
            label: "Flowing Bottomhole Pressure",
            value: formatNumber(dashboard.flowingPressure),
            unit: "psi",
        },
        {
            label: "Reservoir Pressure",
            value: formatNumber(dashboard.reservoirPressure),
            unit: "psi",
        },
        {
            label: "Pressure Drawdown",
            value: formatNumber(dashboard.pressureDrawdown),
            unit: "psi",
        },
        {
            label: "Productivity Index",
            value: formatProductivityIndex(dashboard.productivityIndex),
            unit: dashboard.productivityIndex === null ? undefined : "STB/day/psi",
        },
        {
            label: "Maximum Deliverability",
            value: formatNumber(dashboard.maxDeliverability),
            unit: "STB/day",
        },
        {
            label: "Production Efficiency",
            value: formatNumber(dashboard.productionEfficiency),
            unit: "%",
        },
        {
            label: "Natural Flow Status",
            value: dashboard.naturalFlow ? "Sustainable" : "Not Sustainable",
            tone: dashboard.naturalFlow ? "green" : "red",
        },
        {
            label: "Well Health",
            value: dashboard.wellHealth,
            tone: healthTone[dashboard.wellHealth],
        },
    ];

    return (
        <section className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Well Performance Dashboard
                    </h2>
                    <p className="text-sm text-muted">
                        Operating condition summary from the solved nodal point.
                    </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
                    {dashboard.flowRegime}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <DashboardMetricCard key={card.label} {...card} />
                ))}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Engineering Summary
                </h3>
                <ul className="mt-3 space-y-2">
                    {dashboard.engineeringSummary.map((summaryItem) => (
                        <li key={summaryItem} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span>{summaryItem}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
