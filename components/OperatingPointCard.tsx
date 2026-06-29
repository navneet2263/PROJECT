"use client";

interface Props {
    operatingRate: number | null;
    operatingPwf: number | null;
}

export default function OperatingPointCard({ operatingRate, operatingPwf }: Props) {
    const hasIntersection = operatingRate !== null && operatingPwf !== null;

    return (
        <div className="rounded-xl border border-border bg-surface-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Operating Point
            </h2>

            {hasIntersection ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-surface p-4 text-center border border-border">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted">Flow Rate</p>
                        <p className="mt-2 text-3xl font-bold text-accent">
                            {operatingRate.toFixed(1)} <span className="text-base font-normal text-muted">STB/day</span>
                        </p>
                    </div>
                    <div className="rounded-lg bg-surface p-4 text-center border border-border">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted">Bottomhole Pwf</p>
                        <p className="mt-2 text-3xl font-bold text-accent">
                            {operatingPwf.toFixed(1)} <span className="text-base font-normal text-muted">psi</span>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-inner dark:border-red-900/50 dark:bg-red-900/20">
                    <p className="font-semibold text-red-800 dark:text-red-300">
                        Natural flow not possible. Artificial lift recommended.
                    </p>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        The Inflow Performance Relationship does not intersect with the Vertical Lift Performance curve.
                    </p>
                </div>
            )}
        </div>
    );
}
