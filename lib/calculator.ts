import {
  CalculatorInput, CalculatorResult, AllocationCategory,
  PayrollDeductionSummary, BudgetRule, AnalyticsData, AnalyticsInsight,
} from "@/types/calculator";
import { calculatePayroll } from "@/lib/payroll-id";

// ============================================================
// BUDGET FRAMEWORKS
// ============================================================

interface BudgetCategory {
  name: string; percentage: number; color: string; emoji: string;
}

const BUDGET_FRAMEWORKS: Record<Exclude<BudgetRule, "custom">, BudgetCategory[]> = {
  "50_30_20": [
    { name: "Needs",   percentage: 50, color: "#2563EB", emoji: "🏠" },
    { name: "Wants",   percentage: 30, color: "#8B5CF6", emoji: "🎮" },
    { name: "Savings", percentage: 20, color: "#14B8A6", emoji: "💰" },
  ],
  "80_20": [
    { name: "Spending", percentage: 80, color: "#2563EB", emoji: "💳" },
    { name: "Savings",  percentage: 20, color: "#14B8A6", emoji: "💰" },
  ],
  "70_20_10": [
    { name: "Living",  percentage: 70, color: "#2563EB", emoji: "🏠" },
    { name: "Saving",  percentage: 20, color: "#14B8A6", emoji: "💰" },
    { name: "Giving",  percentage: 10, color: "#F59E0B", emoji: "🤝" },
  ],
};

// Custom categories (original SalarySplit allocations)
const CUSTOM_ALLOCATIONS = {
  single: {
    savings: 20, investments: 10, housing: 25, food: 15,
    transportation: 8, medical: 3, emergency: 5, lifestyle: 7, family: 0, other: 7,
  },
  married: {
    savings: 15, investments: 8, housing: 25, food: 15,
    transportation: 8, medical: 5, emergency: 5, lifestyle: 5, family: 7, other: 7,
  },
  married_with_children: {
    savings: 10, investments: 5, housing: 25, food: 18,
    transportation: 8, medical: 7, emergency: 5, lifestyle: 3, family: 14, other: 5,
  },
};

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

// ============================================================
// ANALYTICS GENERATOR
// ============================================================

function generateAnalytics(
  input: CalculatorInput,
  baseTakeHome: number,
  extraIncome: number,
  totalIncome: number,
  totalDebt: number,
  categories: AllocationCategory[],
  budgetRule: BudgetRule,
): AnalyticsData {
  const debtRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;
  const availableAfterDebt = totalIncome - totalDebt;

  // Savings rate
  const savingsCats = categories.filter(c =>
    ["Savings", "Saving", "Investments"].includes(c.name) ||
    c.name.toLowerCase().includes("saving")
  );
  const savingsTotal = savingsCats.reduce((sum, c) => sum + c.amount, 0);
  const savingsRate = totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0;

  // Health score (0-100)
  let healthScore = 50;
  if (savingsRate >= 20) healthScore += 20;
  else if (savingsRate >= 10) healthScore += 10;
  if (debtRatio <= 30) healthScore += 15;
  else if (debtRatio <= 50) healthScore += 5;
  else healthScore -= 15;
  if (totalDebt === 0) healthScore += 15;
  if (extraIncome > 0) healthScore += 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const insights: AnalyticsInsight[] = [];

  // Income insight
  insights.push({
    icon: "💰",
    title: "Take-Home Pay",
    value: formatRupiah(totalIncome),
    description: extraIncome > 0
      ? `Base ${formatRupiah(baseTakeHome)} + ${formatRupiah(extraIncome)} allowances/bonus`
      : "Your monthly income after all deductions",
    status: "info",
  });

  // Debt insight
  if (totalDebt > 0) {
    insights.push({
      icon: "💳",
      title: "Debt-to-Income",
      value: `${debtRatio.toFixed(0)}%`,
      description: debtRatio > 50
        ? `${formatRupiah(totalDebt)}/mo — critically high. Prioritize paying off highest-interest debt first.`
        : debtRatio > 30
        ? `${formatRupiah(totalDebt)}/mo — approaching the 30-36% safe limit. Avoid new debt.`
        : `${formatRupiah(totalDebt)}/mo — within healthy range. Keep it up.`,
      status: debtRatio > 50 ? "danger" : debtRatio > 30 ? "warning" : "good",
    });
  }

  // Savings insight
  insights.push({
    icon: "📈",
    title: "Savings Rate",
    value: `${savingsRate.toFixed(0)}%`,
    description: savingsRate >= 30
      ? "Excellent — you're building wealth faster than most people."
      : savingsRate >= 20
      ? "Solid. You're on track for long-term financial security."
      : savingsRate >= 10
      ? "Decent start. Try to push toward 20% for stability."
      : "Below target. Aim for at least 20% savings rate over time.",
    status: savingsRate >= 20 ? "good" : savingsRate >= 10 ? "warning" : "danger",
  });

  // Budget method insight
  const methodNames: Record<string, string> = {
    "50_30_20": "50/30/20", "80_20": "80/20", "70_20_10": "70/20/10", "custom": "Custom",
  };
  let methodTip = "";
  if (budgetRule === "50_30_20") {
    methodTip = `Needs ${formatRupiah(Math.round(availableAfterDebt * 0.5))} · Wants ${formatRupiah(Math.round(availableAfterDebt * 0.3))} · Save ${formatRupiah(Math.round(availableAfterDebt * 0.2))}`;
  } else if (budgetRule === "80_20") {
    methodTip = `Save ${formatRupiah(Math.round(availableAfterDebt * 0.2))} first, spend the rest freely. Auto-transfer on payday.`;
  } else if (budgetRule === "70_20_10") {
    methodTip = `Living ${formatRupiah(Math.round(availableAfterDebt * 0.7))} · Save ${formatRupiah(Math.round(availableAfterDebt * 0.2))} · Give ${formatRupiah(Math.round(availableAfterDebt * 0.1))}`;
  } else {
    methodTip = "Personalized across 9 categories based on your life situation.";
  }
  insights.push({
    icon: "📊",
    title: `${methodNames[budgetRule]} Method`,
    value: formatRupiah(availableAfterDebt),
    description: methodTip,
    status: "info",
  });

  // Emergency fund tip
  const monthsTarget = input.maritalStatus === "married_with_children" ? 6 : 3;
  insights.push({
    icon: "🛡️",
    title: "Emergency Fund",
    value: `${monthsTarget} months`,
    description: `Aim for ${monthsTarget} months of expenses saved. This is your safety net before investing.`,
    status: "info",
  });

  return { insights, savingsRate, debtRatio, healthScore };
}

// ============================================================
// MAIN CALCULATOR
// ============================================================

export function calculateAllocation(input: CalculatorInput): CalculatorResult {
  // Step 1: Calculate payroll deductions on BASE SALARY ONLY
  // Allowances and bonus are NOT included in tax/BPJS calculation
  const payrollResult = calculatePayroll({
    monthlyGrossSalary: input.monthlyIncome, // base salary only
    taxStatus: input.taxStatus,
    hasBpjsKesehatan: input.hasBpjsKesehatan,
    hasBpjsKetenagakerjaan: input.hasBpjsKetenagakerjaan,
    bpjsEmployeeShareCoveredByCompany: input.medicalCovered,
    pph21CoveredByCompany: input.taxCovered,
    jkkRiskRate: input.jkkRiskRate,
    isFinalPayrollMonth: false,
  });

  const baseTakeHome = payrollResult.employeeTakeHome;

  // Step 2: Add allowances and bonus ON TOP of take-home (not taxed)
  const monthlyBonus = Math.round(input.annualBonus / 12);
  const extraIncome = input.monthlyAllowances + monthlyBonus;
  const totalMonthlyIncome = baseTakeHome + extraIncome;

  const grossIncome = input.monthlyIncome; // base gross only
  const totalIncome = input.calculationMode === "annual"
    ? totalMonthlyIncome * 12
    : totalMonthlyIncome;

  // Step 3: Calculate total debt
  let totalDebt = 0;
  if (input.debtMode === "simple") {
    totalDebt = input.totalDebt;
  } else {
    totalDebt = input.debtItems.reduce((sum, item) => sum + item.amount, 0);
  }
  if (input.calculationMode === "annual") totalDebt *= 12;

  const availableAfterDebt = totalIncome - totalDebt;

  // Step 4: Build payroll summary
  const payroll: PayrollDeductionSummary = {
    grossSalary: payrollResult.grossSalary,
    bpjsKesehatanEmployee: payrollResult.bpjsKesehatanEmployee,
    bpjsKesehatanEmployer: payrollResult.bpjsKesehatanEmployer,
    bpjsKesehatanCoveredByCompany: payrollResult.bpjsKesehatanCoveredByCompany,
    jhtEmployee: payrollResult.jhtEmployee, jpEmployee: payrollResult.jpEmployee,
    jhtEmployer: payrollResult.jhtEmployer, jpEmployer: payrollResult.jpEmployer,
    jkkEmployer: payrollResult.jkkEmployer, jkmEmployer: payrollResult.jkmEmployer,
    pph21Amount: payrollResult.pph21Monthly,
    pph21Method: payrollResult.pph21Method,
    terRate: payrollResult.terRate, terCategory: payrollResult.terCategory,
    pph21CoveredByCompany: payrollResult.pph21CoveredByCompany,
    totalEmployeeDeductions: payrollResult.totalEmployeeDeductions,
    totalEmployerContributions: payrollResult.totalEmployerContributions,
    totalCompanyCost: payrollResult.totalCompanyCost,
    employeeTakeHome: payrollResult.employeeTakeHome,
  };

  // Step 5: Build categories based on budget rule
  const budgetBase = availableAfterDebt > 0 ? availableAfterDebt : totalIncome;
  let categories: AllocationCategory[];

  if (input.budgetRule !== "custom") {
    // Use framework categories
    const framework = BUDGET_FRAMEWORKS[input.budgetRule];
    categories = framework.map(cat => ({
      name: cat.name,
      percentage: cat.percentage,
      amount: Math.round((budgetBase * cat.percentage) / 100),
      color: cat.color,
      emoji: cat.emoji,
    }));
  } else {
    // Use custom allocations (original SalarySplit logic)
    const base = { ...CUSTOM_ALLOCATIONS[input.maritalStatus] };

    // Housing adjustment
    if (input.housingType === "company_provided" || input.housingType === "with_parents") {
      const housingPct = base.housing;
      base.housing = input.housingType === "with_parents" ? 5 : 0;
      const freed = housingPct - base.housing;
      base.savings += Math.round(freed * 0.4);
      base.investments += Math.round(freed * 0.35);
      base.lifestyle += freed - Math.round(freed * 0.4) - Math.round(freed * 0.35);
    }

    // Medical adjustment
    if (input.medicalCovered && input.hasBpjsKesehatan) {
      const medicalPct = base.medical;
      base.medical = 1;
      base.savings += medicalPct - 1;
    }

    // Dependents adjustment
    if (input.dependents > 0 && input.maritalStatus === "married_with_children") {
      const extraNeeded = Math.min(input.dependents * 2, 6);
      base.family += extraNeeded;
      const fromLifestyle = Math.min(base.lifestyle, Math.ceil(extraNeeded / 2));
      base.lifestyle -= fromLifestyle;
      base.other -= Math.min(base.other, extraNeeded - fromLifestyle);
    }

    // Normalize
    const total = Object.values(base).reduce((sum, val) => sum + val, 0);
    if (total !== 100) base.other += 100 - total;
    Object.keys(base).forEach((key) => {
      const k = key as keyof typeof base;
      if (base[k] < 0) { base.other += base[k]; base[k] = 0; }
    });

    categories = Object.entries(base)
      .map(([key, percentage]) => {
        const info = CATEGORY_INFO[key];
        return {
          name: info.label, percentage,
          amount: Math.round((budgetBase * percentage) / 100),
          color: info.color, emoji: info.emoji,
        };
      })
      .filter((cat) => cat.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }

  // Step 6: Generate analytics
  const analytics = generateAnalytics(
    input, baseTakeHome, extraIncome, totalIncome, totalDebt, categories, input.budgetRule,
  );

  return {
    input,
    baseTakeHome: input.calculationMode === "annual" ? baseTakeHome * 12 : baseTakeHome,
    extraIncome: input.calculationMode === "annual" ? extraIncome * 12 : extraIncome,
    totalIncome,
    grossIncome: input.calculationMode === "annual" ? grossIncome * 12 : grossIncome,
    categories,
    mode: input.calculationMode,
    payroll,
    totalDebt,
    availableAfterDebt,
    analytics,
    budgetRule: input.budgetRule,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}
