import type { CalculatorResult } from "@/types/calculator";
import { formatRupiah } from "@/lib/calculator";

export interface DiffRow {
  label: string;
  values: (number | string)[];
  type: "currency" | "percentage" | "score";
  higherIsBetter: boolean;
}

export interface ComparisonDiff {
  rows: DiffRow[];
  winnerIndex: number; // index of scenario with best overall healthScore
}

export function buildDiffSummary(results: CalculatorResult[]): ComparisonDiff {
  const rows: DiffRow[] = [
    {
      label: "Gross Income",
      values: results.map((r) => r.grossIncome),
      type: "currency",
      higherIsBetter: true,
    },
    {
      label: "Take-Home Pay",
      values: results.map((r) => r.baseTakeHome),
      type: "currency",
      higherIsBetter: true,
    },
    {
      label: "Total Income",
      values: results.map((r) => r.totalIncome),
      type: "currency",
      higherIsBetter: true,
    },
    {
      label: "Total Deductions",
      values: results.map((r) => r.payroll?.totalEmployeeDeductions ?? 0),
      type: "currency",
      higherIsBetter: false,
    },
    {
      label: "Debt / Bills",
      values: results.map((r) => r.totalDebt),
      type: "currency",
      higherIsBetter: false,
    },
    {
      label: "Available After Debt",
      values: results.map((r) => r.availableAfterDebt),
      type: "currency",
      higherIsBetter: true,
    },
    {
      label: "Savings Rate",
      values: results.map((r) => r.analytics.savingsRate),
      type: "percentage",
      higherIsBetter: true,
    },
    {
      label: "Debt-to-Income",
      values: results.map((r) => r.analytics.debtRatio),
      type: "percentage",
      higherIsBetter: false,
    },
    {
      label: "Health Score",
      values: results.map((r) => r.analytics.healthScore),
      type: "score",
      higherIsBetter: true,
    },
  ];

  // Determine overall winner: first by health score, then break ties by
  // counting how many rows each scenario "wins" (has the best value).
  let winnerIndex = 0;
  let bestScore = -1;
  const tiedIndices: number[] = [];

  results.forEach((r, i) => {
    if (r.analytics.healthScore > bestScore) {
      bestScore = r.analytics.healthScore;
      tiedIndices.length = 0;
      tiedIndices.push(i);
    } else if (r.analytics.healthScore === bestScore) {
      tiedIndices.push(i);
    }
  });

  if (tiedIndices.length === 1) {
    winnerIndex = tiedIndices[0];
  } else {
    // Tied on health score — count how many rows each scenario wins
    const wins = new Array(results.length).fill(0);
    rows.forEach((row) => {
      const best = getBestIndex(row);
      if (best !== -1) wins[best]++;
    });
    // Among the tied scenarios, pick the one with the most row wins
    let maxWins = -1;
    for (const idx of tiedIndices) {
      if (wins[idx] > maxWins) {
        maxWins = wins[idx];
        winnerIndex = idx;
      }
    }
  }

  return { rows, winnerIndex };
}

export function formatDiffValue(value: number | string, type: DiffRow["type"]): string {
  if (typeof value === "string") return value;
  switch (type) {
    case "currency":
      return formatRupiah(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "score":
      return `${Math.round(value)}/100`;
  }
}

/**
 * For a given row, determine which scenario index has the "best" value.
 * Returns -1 if all values are equal.
 */
export function getBestIndex(row: DiffRow): number {
  const nums = row.values.map((v) => (typeof v === "number" ? v : 0));
  if (nums.every((n) => n === nums[0])) return -1;
  if (row.higherIsBetter) {
    return nums.indexOf(Math.max(...nums));
  } else {
    return nums.indexOf(Math.min(...nums));
  }
}
