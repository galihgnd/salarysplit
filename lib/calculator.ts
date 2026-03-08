import {
  CalculatorInput,
  CalculatorResult,
  AllocationCategory,
} from "@/types/calculator";

// Base percentage allocations for each life condition
const BASE_ALLOCATIONS = {
  single: {
    savings: 20,
    investments: 10,
    housing: 25,
    food: 15,
    transportation: 8,
    medical: 3,
    emergency: 5,
    lifestyle: 7,
    family: 0,
    other: 7,
  },
  married: {
    savings: 15,
    investments: 8,
    housing: 25,
    food: 15,
    transportation: 8,
    medical: 5,
    emergency: 5,
    lifestyle: 5,
    family: 7,
    other: 7,
  },
  married_with_children: {
    savings: 10,
    investments: 5,
    housing: 25,
    food: 18,
    transportation: 8,
    medical: 7,
    emergency: 5,
    lifestyle: 3,
    family: 14,
    other: 5,
  },
};

// Display info for each category
const CATEGORY_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  savings: { label: "Savings", color: "#2563EB", emoji: "💰" },
  investments: { label: "Investments", color: "#4F46E5", emoji: "📈" },
  housing: { label: "Housing", color: "#0EA5E9", emoji: "🏠" },
  food: { label: "Food", color: "#14B8A6", emoji: "🍽️" },
  transportation: { label: "Transportation", color: "#06B6D4", emoji: "🚗" },
  medical: { label: "Medical", color: "#F43F5E", emoji: "🏥" },
  emergency: { label: "Emergency Fund", color: "#F59E0B", emoji: "🛡️" },
  lifestyle: { label: "Lifestyle", color: "#8B5CF6", emoji: "🎮" },
  family: { label: "Family", color: "#EC4899", emoji: "👨‍👩‍👧" },
  other: { label: "Other / Misc", color: "#6B7280", emoji: "📦" },
};

export function calculateAllocation(input: CalculatorInput): CalculatorResult {
  // Step 1: Get base allocations based on marital status
  const base = { ...BASE_ALLOCATIONS[input.maritalStatus] };

  // Step 2: Adjust for housing
  if (input.housingType === "company_provided" || input.housingType === "with_parents") {
    // Housing is free — redistribute the 25%
    const housingPct = base.housing;
    base.housing = input.housingType === "with_parents" ? 5 : 0; // small contribution if with parents
    const freed = housingPct - base.housing;
    base.savings += Math.round(freed * 0.4);       // 40% of freed goes to savings
    base.investments += Math.round(freed * 0.35);   // 35% to investments
    base.lifestyle += freed - Math.round(freed * 0.4) - Math.round(freed * 0.35); // rest to lifestyle
  }

  // Step 3: Adjust for medical coverage
  if (input.medicalCovered) {
    const medicalPct = base.medical;
    base.medical = 1; // keep 1% for uncovered minor costs
    const freed = medicalPct - 1;
    base.savings += freed; // freed medical goes to savings
  }

  // Step 4: Adjust for dependents (extra pressure on family + food)
  if (input.dependents > 0 && input.maritalStatus === "married_with_children") {
    const extraPerDependent = 2;
    const extraNeeded = Math.min(input.dependents * extraPerDependent, 6); // cap at 6%
    base.family += extraNeeded;
    // Take from lifestyle and other
    const fromLifestyle = Math.min(base.lifestyle, Math.ceil(extraNeeded / 2));
    const fromOther = extraNeeded - fromLifestyle;
    base.lifestyle -= fromLifestyle;
    base.other -= Math.min(base.other, fromOther);
  }

  // Step 5: Normalize percentages to exactly 100%
  const total = Object.values(base).reduce((sum, val) => sum + val, 0);
  if (total !== 100) {
    const diff = 100 - total;
    base.other += diff; // adjust "other" to make it exactly 100
  }

  // Make sure no category is negative
  Object.keys(base).forEach((key) => {
    const k = key as keyof typeof base;
    if (base[k] < 0) {
      base.other += base[k]; // absorb negative into other
      base[k] = 0;
    }
  });

  // Step 6: Calculate total income based on mode
  let totalIncome: number;

  if (input.calculationMode === "annual") {
    totalIncome =
      input.monthlyIncome * 12 +
      input.annualBonus +
      input.monthlyAllowances * 12;
  } else {
    totalIncome =
      input.monthlyIncome +
      input.monthlyAllowances +
      Math.round(input.annualBonus / 12); // spread bonus across months
  }

  // Step 7: Build the categories array
  const categories: AllocationCategory[] = Object.entries(base)
    .map(([key, percentage]) => {
      const info = CATEGORY_INFO[key];
      return {
        name: info.label,
        percentage,
        amount: Math.round((totalIncome * percentage) / 100),
        color: info.color,
        emoji: info.emoji,
      };
    })
    .filter((cat) => cat.percentage > 0) // hide categories with 0%
    .sort((a, b) => b.percentage - a.percentage); // sort by largest first

  return {
    input,
    totalIncome,
    categories,
    mode: input.calculationMode,
  };
}

// Helper: format number as Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
