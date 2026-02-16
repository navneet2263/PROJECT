"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  [key: string]: number | string;
}

interface GraphPanelProps {
  title?: string;
  data: DataPoint[];
  xKey: string;
  lines: { dataKey: string; color?: string; name?: string }[];
  xUnit?: string;
  yUnit?: string;
}

export default function GraphPanel({ title, data, xKey, lines, xUnit, yUnit }: GraphPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      )}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => (typeof v === "number" ? v.toFixed(0) : String(v))}
              unit={xUnit}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => (typeof v === "number" ? v.toFixed(0) : String(v))}
              unit={yUnit}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [value?.toFixed(2) ?? value, yUnit ?? ""]}
            />
            <Legend />
            {lines.map(({ dataKey, color = "var(--accent)", name }) => (
              <Line
                key={dataKey}
                type="monotone"
                dataKey={dataKey}
                name={name ?? dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
