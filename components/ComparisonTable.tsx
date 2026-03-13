"use client";

import type { CalculatorResult } from "@/types/calculator";
import {
  buildDiffSummary,
  formatDiffValue,
  getBestIndex,
} from "@/lib/compare-utils";

interface ComparisonTableProps {
  results: CalculatorResult[];
  labels: string[];
  accentColors: string[];
}

const COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  emerald: "#10b981",
};

export default function ComparisonTable({
  results,
  labels,
  accentColors,
}: ComparisonTableProps) {
  const diff = buildDiffSummary(results);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header row */}
      <div className="grid border-b border-slate-800"
        style={{ gridTemplateColumns: `180px repeat(${results.length}, 1fr)` }}
      >
        <div className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Metric
        </div>
        {labels.map((label, i) => (
          <div
            key={i}
            className="p-4 text-center text-sm font-bold"
            style={{ color: COLOR_MAP[accentColors[i]] || "#3b82f6" }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {diff.rows.map((row, rowIdx) => {
        const bestIdx = getBestIndex(row);
        return (
          <div
            key={rowIdx}
            className="grid border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
            style={{ gridTemplateColumns: `180px repeat(${results.length}, 1fr)` }}
          >
            <div className="p-4 text-sm text-slate-400 font-medium flex items-center">
              {row.label}
            </div>
            {row.values.map((val, colIdx) => {
              const isBest = bestIdx === colIdx && bestIdx !== -1;
              return (
                <div
                  key={colIdx}
                  className={`p-4 text-center text-sm font-semibold ${
                    isBest ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {formatDiffValue(val, row.type)}
                  {isBest && (
                    <span className="ml-1.5 text-xs text-emerald-500">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Winner banner */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-400">Overall Best:</span>
          <span
            className="font-bold"
            style={{ color: COLOR_MAP[accentColors[diff.winnerIndex]] || "#3b82f6" }}
          >
            🏆 {labels[diff.winnerIndex]}
          </span>
          <span className="text-slate-500">
            (Health Score: {results[diff.winnerIndex].analytics.healthScore}/100)
          </span>
        </div>
      </div>

      {/* Category comparison */}
      <div className="p-5 border-t border-slate-800">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Budget Category Breakdown
        </h4>
        <div className="space-y-3">
          {/* Get all unique category names */}
          {getAllCategoryNames(results).map((catName) => (
            <div key={catName}>
              <div className="text-xs text-slate-400 mb-1.5 font-medium">{catName}</div>
              <div className="flex gap-2">
                {results.map((r, i) => {
                  const cat = r.categories.find((c) => c.name === catName);
                  const maxAmount = Math.max(
                    ...results
                      .map((res) => res.categories.find((c) => c.name === catName)?.amount ?? 0)
                  );
                  const pct = cat && maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 3)}%`,
                              backgroundColor: COLOR_MAP[accentColors[i]] || "#3b82f6",
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 min-w-[50px] text-right tabular-nums">
                          {cat ? `${cat.percentage}%` : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getAllCategoryNames(results: CalculatorResult[]): string[] {
  const names = new Set<string>();
  results.forEach((r) => r.categories.forEach((c) => names.add(c.name)));
  return Array.from(names);
}
