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
  ReferenceDot,
} from "recharts";

export interface GraphPoint {
  rate: number;
  pwf: number;
}

export interface OperatingPoint {
  operatingRate: number;
  operatingPwf: number;
}

interface GraphPanelProps {
  iprData: GraphPoint[];
  vlpData: GraphPoint[];
  operatingPoint?: OperatingPoint | null;
  sensitivityCurves?: { data: GraphPoint[]; name: string; color: string }[];
}

export default function GraphPanel({ iprData, vlpData, operatingPoint, sensitivityCurves = [] }: GraphPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">System Performance</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis
              dataKey="rate"
              type="number"
              name="Rate"
              unit=" STB/d"
              domain={['dataMin', 'dataMax']}
              allowDataOverflow={true}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => (typeof v === "number" ? v.toFixed(0) : String(v))}
            />
            <YAxis
              dataKey="pwf"
              type="number"
              name="Pwf"
              unit=" psi"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => (typeof v === "number" ? v.toFixed(0) : String(v))}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "Rate") return [`${value.toFixed(1)} STB/d`, "Rate"];
                return [`${value.toFixed(1)} psi`, name];
              }}
            />
            <Legend />
            <Line
              data={iprData}
              type="monotone"
              dataKey="pwf"
              name="IPR Curve"
              stroke="var(--accent)"
              strokeWidth={2}
              isAnimationActive={true}
              dot={false}
              animationDuration={500}
            />
            <Line
              data={vlpData}
              type="monotone"
              dataKey="pwf"
              name="VLP Curve"
              stroke="#3b82f6"
              strokeWidth={2}
              isAnimationActive={true}
              dot={false}
              animationDuration={500}
            />

            {sensitivityCurves.map((sc, idx) => (
              <Line
                key={`sens-${idx}`}
                data={sc.data}
                type="monotone"
                dataKey="pwf"
                name={sc.name}
                stroke={sc.color}
                strokeWidth={2}
                isAnimationActive={true}
                dot={false}
                animationDuration={500}
                strokeDasharray="5 5"
              />
            ))}

            {operatingPoint && (
              <ReferenceDot
                x={operatingPoint.operatingRate}
                y={operatingPoint.operatingPwf}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
                isFront={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
