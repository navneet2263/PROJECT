interface ResultItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface ResultPanelProps {
  title?: string;
  items: ResultItem[];
}

export default function ResultPanel({ title = "Results", items }: ResultPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <dl className="space-y-3">
        {items.map(({ label, value, unit }) => (
          <div key={label} className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-mono font-semibold text-slate-800 dark:text-slate-100">
              {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : value}
              {unit != null && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
