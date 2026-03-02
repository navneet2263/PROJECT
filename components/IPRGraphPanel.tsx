"use client";

import { useEffect, useState } from "react";
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

export interface IPRGraphDataPoint {
  pwf: number;
  rate: number;
}

interface IPRGraphPanelProps {
  data: IPRGraphDataPoint[];
  xLabel: string;
  yLabel: string;
  rateUnit: string;
  title?: string;
}

const ANIMATION_DURATION = 1000;
const PROGRESSIVE_INTERVAL_MS = 35;

export default function IPRGraphPanel({ data, xLabel, yLabel, rateUnit, title }: IPRGraphPanelProps) {
  const [animatedData, setAnimatedData] = useState<IPRGraphDataPoint[]>([]);

  useEffect(() => {
    if (data.length === 0) {
      setAnimatedData([]);
      return;
    }

    setAnimatedData([]);
    let visibleCount = 0;
    const step = Math.max(1, Math.ceil(data.length / Math.max(1, ANIMATION_DURATION / PROGRESSIVE_INTERVAL_MS)));
    const timer = setInterval(() => {
      visibleCount = Math.min(visibleCount + step, data.length);
      setAnimatedData(data.slice(0, visibleCount));
      if (visibleCount >= data.length) {
        clearInterval(timer);
      }
    }, PROGRESSIVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5">
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      )}
      <div className="h-80 w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={animatedData}
            margin={{ top: 10, right: 24, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="rate"
              type="number"
              tick={{ fontSize: 12, fill: "var(--muted)" }}
              tickFormatter={(v: number) => (typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : String(v))}
              label={{ value: xLabel, position: "bottom", fontSize: 12, fill: "var(--muted)" }}
            />
            <YAxis
              dataKey="pwf"
              type="number"
              tick={{ fontSize: 12, fill: "var(--muted)" }}
              tickFormatter={(v: number) => (typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : String(v))}
              label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 12, fill: "var(--muted)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const { rate, pwf } = payload[0].payload as IPRGraphDataPoint;
                return (
                  <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm">
                    <div className="font-medium text-slate-700 dark:text-slate-200">
                      Rate: {Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 })} {rateUnit}
                    </div>
                    <div className="text-muted">
                      Pwf: {Number(pwf).toLocaleString(undefined, { maximumFractionDigits: 2 })} psi
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="pwf"
              name={yLabel}
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={ANIMATION_DURATION}
              animationEasing="ease-in-out"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
