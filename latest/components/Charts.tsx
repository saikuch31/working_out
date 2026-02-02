"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TagDistributionItem } from "@/lib/aggregate";

type ChartsProps = {
  title: string;
  tagDistribution: TagDistributionItem[];
  rangeLabel: string;
  rangeDays: number;
  onRangeChange: (days: number) => void;
};

const COLORS = [
  "#0f766e",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#be185d",
  "#c2410c",
  "#ca8a04",
  "#16a34a",
];

export default function Charts({
  title,
  tagDistribution,
  rangeLabel,
  rangeDays,
  onRangeChange,
}: ChartsProps) {
  return (
    <section className="w-1/2 mx-auto rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-gray-800/80 md:w-1/3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onRangeChange(7)}
            className={`rounded-full border px-3 py-1 font-semibold ${
              rangeDays === 7
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
                : "border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500"
            }`}
          >
            7d
          </button>
          <button
            type="button"
            onClick={() => onRangeChange(30)}
            className={`rounded-full border px-3 py-1 font-semibold ${
              rangeDays === 30
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900"
                : "border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500"
            }`}
          >
            30d
          </button>
        </div>
      </div>
      {tagDistribution.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Add tags to workouts to see distribution.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagDistribution}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  stroke="transparent"
                >
                  {tagDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} workout${value === 1 ? "" : "s"}`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-1 text-xs text-slate-700 dark:text-slate-200">
            {tagDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="capitalize">{item.name}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
