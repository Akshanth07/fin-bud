"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { WeeklyStat } from "@/types";

export function StatisticsCard({ data }: { data: WeeklyStat[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#14181C]">Statistics</span>
      </div>
      <button className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#14181C]">
        Weekly Comparison <ChevronDown size={14} className="text-muted" />
      </button>

      <div className="mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid vertical={false} stroke="#EEF0F2" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A9099" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#8A9099" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ borderRadius: 12, border: "1px solid #E7E9EC" }}
            />
            <Bar dataKey="previous" fill="#E7E9EC" radius={[6, 6, 6, 6]} barSize={16} />
            <Bar dataKey="current" fill="#14A38B" radius={[6, 6, 6, 6]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
