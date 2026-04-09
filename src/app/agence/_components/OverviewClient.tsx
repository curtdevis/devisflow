"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartPoint = { date: string; label: string; count: number };

interface Props {
  chartData: ChartPoint[];
}

export default function OverviewClient({ chartData }: Props) {
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Show every 5th label to avoid clutter
  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? chartData[index]?.label ?? "" : "";

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="colorDevis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, Math.max(maxCount + 1, 5)]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value ?? 0} devis`, "Devis générés"]}
            labelFormatter={(label) => `Le ${label}`}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#1e3a5f"
            strokeWidth={2.5}
            fill="url(#colorDevis)"
            dot={false}
            activeDot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
