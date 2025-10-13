"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="count" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

