"use client";

export type SensitivityVariable = "None" | "Tubing Size" | "GLR" | "WHP";

interface Props {
    variable: SensitivityVariable;
    onVariableChange: (v: SensitivityVariable) => void;
    values: [number, number, number];
    onValuesChange: (vals: [number, number, number]) => void;
}

export default function SensitivityPanel({ variable, onVariableChange, values, onValuesChange }: Props) {
    return (
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Sensitivity Analysis</h3>

            <div className="mb-4 flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Variable</label>
                <select
                    value={variable}
                    onChange={(e) => onVariableChange(e.target.value as SensitivityVariable)}
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:bg-surface dark:text-slate-100"
                >
                    <option value="None">None</option>
                    <option value="Tubing Size">Tubing Size (in)</option>
                    <option value="GLR">GLR (scf/STB)</option>
                    <option value="WHP">Wellhead Pressure (psi)</option>
                </select>
            </div>

            {variable !== "None" && (
                <div className="flex gap-2">
                    {values.map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col gap-1">
                            <label className="text-xs text-muted">Value {idx + 1}</label>
                            <input
                                type="number"
                                value={val}
                                onChange={(e) => {
                                    const newVals = [...values] as [number, number, number];
                                    newVals[idx] = Number(e.target.value);
                                    onValuesChange(newVals);
                                }}
                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:text-slate-100"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
